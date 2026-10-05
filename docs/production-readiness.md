# Production readiness

This document is the frontend release gate for VisualMath.

Backend contract target for the current MVP integration:

```text
kumofsoc/FsocietyMathAdvancedBackend
5b33e893d913593d0042f8932e902f5f6225e0ed
```

## Current status

### MVP integration-ready

The frontend is MVP integration-ready when all of these are green:

- typed shared HTTP/auth boundary;
- refresh-cookie session restore;
- `GET /api/v1/me/bootstrap` session hydration;
- controlled one-time anonymous -> account migration;
- server-canonical ordinary authenticated hydration;
- resource-specific background writes without full merge loops;
- dedicated Notes API integration;
- dedicated Important Blocks integration;
- capability-gated account media adapter;
- local-first/offline fallback;
- unit tests;
- production build;
- local-first Playwright;
- real-backend Playwright against the release-gate backend.

### Production-ready

Production additionally requires infrastructure/runtime validation that cannot be proven by frontend code alone:

- final HTTPS frontend/backend origin;
- production CORS and cookie behavior;
- deployed PostgreSQL migration execution plus scheduled off-host backup retention/restore drills;
- runtime metrics/alerts and external error ingestion;
- storage capacity monitoring/backups for media (application quota is already enforced);
- live staging/production smoke against the final public origin.

The repository-level production image now ships and browser-tests a concrete CSP, and the backend ships PostgreSQL backup/restore tooling. Those controls still need to be exercised in the real deployment environment.

## Frontend runtime variables

Local:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=12000
VITE_MEDIA_TRANSFER_TIMEOUT_MS=600000
```

Production:

```env
VITE_API_BASE_URL=https://<final-visualmath-origin>
VITE_API_TIMEOUT_MS=12000
VITE_MEDIA_TRANSFER_TIMEOUT_MS=600000
VITE_APP_RELEASE=<git-sha>
VITE_ERROR_REPORTING_URL=https://<optional-error-ingestion-origin>
```

The API base is an origin only. Do not append `/api`.

`VITE_API_TIMEOUT_MS` is for normal JSON API calls. Audio upload/content transfer uses the separate `VITE_MEDIA_TRANSFER_TIMEOUT_MS` so the backend's 120 MiB media contract is not accidentally reduced to the normal 12-second client timeout.

`VITE_API_BASE_URL` may be empty for a pure local-first build.

For authenticated server-backed audio, auth responses also set a short-lived HttpOnly cookie scoped only to the media path. The player assigns the server content URL directly to the native `<audio>` element, so the browser can use HTTP Range requests for metadata loading and seeking instead of first downloading the whole track into a Blob. Local IndexedDB tracks continue to use Blob/ObjectURL playback.

## Release commands

Required frontend commands:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

Backend-integrated browser suite:

```bash
VISUALMATH_E2E_API_BASE_URL=http://127.0.0.1:8080 pnpm test:e2e:backend
```

The integrated backend must match the current release-gate contract. The frontend suite must not invent or mock replacement endpoints for this gate.

PR CI contains a separate `Backend E2E` workflow. It runs this suite only when the repository variable `VISUALMATH_E2E_API_BASE_URL` is configured with an accessible release-gate/staging backend URL. When the variable is absent, the workflow emits an explicit notice and skips the real-backend job. Therefore, frontend CI success by itself must not be reported as proof that the backend-integrated suite executed.

## Auth/security acceptance

- access token exists only in JavaScript memory;
- refresh token is HttpOnly and never read by JavaScript;
- protected calls use bearer Authorization;
- exactly one refresh is serialized when concurrent requests hit 401 inside a tab;
- refresh-cookie rotation is additionally serialized across tabs through the Web Locks API when available, preventing normal multi-tab use from triggering backend reuse detection;
- the original protected request is retried once;
- logout removes the authenticated session state;
- no auth token is persisted to localStorage/sessionStorage/IndexedDB;
- no token is placed in an audio/content URL.

## Data ownership

Server-canonical after authentication:

- current user/profile;
- learning/progress;
- exact reading blocks;
- saved theorem/bookmark metadata;
- saved topics;
- topic resume;
- reading width;
- UI preferences;
- block notes;
- Important Blocks;
- activity/stats;
- media playlist when `capabilities.mediaAudio === true`.

Local cache/fallback remains intentionally present for instant UX and offline resilience.

Anonymous/device-local by design:

- anonymous learning/workspace/preferences caches;
- anonymous block notes;
- anonymous Important Blocks;
- IndexedDB audio when anonymous or server media is unavailable/disabled;
- original IndexedDB audio blobs that have not been explicitly imported.

## Migration acceptance

For every account:

- core migration has a versioned per-user marker;
- note migration has a separate per-user marker;
- Important migration has a separate per-user marker;
- markers are written only after success;
- logging into another account does not migrate the previous account cache;
- server state wins after first successful migration;
- note conflict resolution uses `updatedAt`;
- legacy `important:*` bookmarks are removed only after dedicated Important PUT succeeds;
- retries are idempotent.

## Offline/failure acceptance

- missing `VITE_API_BASE_URL` does not break the app;
- bundled course content has no backend hard dependency;
- backend outage does not blank the shell/topic pages;
- failed note writes remain locally visible and pending;
- failed Important writes remain locally visible and pending;
- media API failure does not delete local IndexedDB audio;
- hydration events do not start infinite write-back loops.

## Browser acceptance scenarios

The real-backend Playwright suite verifies:

1. anonymous local data -> first registration/login migration;
2. authenticated bootstrap response;
3. preference mutation;
4. topic reading/progress mutation;
5. saved topic;
6. resume;
7. note;
8. Important Block;
9. reload -> refresh-cookie session restore;
10. logout;
11. login -> server state restore;
12. second browser context -> account-scoped state restore;
13. different account does not receive the first account's state;
14. forced 401 -> exactly one refresh -> retry;
15. backend offline -> bundled UI remains usable;
16. media upload/content/rename/reorder/delete when the capability flag is true.

## Security headers

Configure these at the CDN/reverse proxy, not inside React:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
X-Frame-Options: DENY
```

Use a CSP appropriate for the final deployment. At minimum restrict:

- `default-src`;
- `script-src`;
- `style-src`;
- `img-src`;
- `font-src`;
- `connect-src`;
- `media-src`;
- `worker-src`;
- `frame-ancestors`;
- `base-uri`.

`connect-src` must allow the VisualMath API origin and optional error-ingestion origin.

## What still remains before production

Even after frontend MVP merge, production still needs:

1. choose the final VisualMath HTTPS origin;
2. deploy frontend + backend + PostgreSQL;
3. configure backend `CORS_ALLOWED_ORIGINS` for the exact origin;
4. verify Secure/HttpOnly refresh cookie behavior on the deployed topology;
5. schedule the shipped PostgreSQL backup job, replicate backups off-host, and perform a restore drill;
6. configure runtime metrics/alerts and error ingestion;
7. configure media backup retention and capacity monitoring;
8. verify the shipped CSP against the final public origin and any configured error-ingestion endpoint;
9. run the backend-integrated Playwright suite against staging/production topology;
10. set `VITE_APP_RELEASE` to the deployed git SHA and verify release-tagged error reporting.
