# Production readiness

This document is the frontend release gate for VisualMath.

## Status definitions

### Backend ready

The frontend is **backend ready** when all of the following are true:

- one typed HTTP boundary owns backend requests;
- auth/session restore uses the Go backend's refresh-cookie contract;
- local anonymous learning state can merge into an authenticated account;
- canonical server learning/workspace/preferences hydrate browser caches;
- account/profile/activity UI uses real backend data when configured;
- failure modes for timeout, offline, 401 refresh and unavailable backend are defined;
- integration-critical browser smoke tests run in CI.

### Production ready

Production ready additionally requires:

- a deployed staging backend reachable over HTTPS;
- production CORS/cookie settings verified against the final frontend origin;
- runtime error ingestion configured and verified;
- security headers configured at the deployment edge;
- database migrations/backups/monitoring owned by backend infrastructure;
- a final staging smoke run using the live API, not only local-first mode.

## Frontend runtime variables

```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT_MS=12000
VITE_ERROR_REPORTING_URL=https://errors.example.com/v1/frontend
VITE_APP_RELEASE=<git-sha-or-release>
```

`VITE_API_BASE_URL` may be empty for local-first builds.

`VITE_ERROR_REPORTING_URL` is optional. When configured, VisualMath sends small JSON payloads for React render failures, global window errors and unhandled promise rejections. Error reporting deliberately excludes localStorage contents, note text, auth tokens and user profile fields.

## Browser release gate

Every pull request to `main` must pass:

```bash
pnpm test
pnpm build
pnpm test:e2e
```

The Chromium smoke suite runs against the built production bundle and covers:

- home/app shell;
- semantic topic deep links;
- topic-local search rendering;
- My Marks route;
- Account local-first fallback without a backend.

A staging job with real backend credentials/origin should be added when the Go deployment is available.

## Security headers

Configure these at the CDN/reverse proxy. Do not hardcode them in React:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

Use a Content-Security-Policy appropriate for the final hosting setup. At minimum, restrict `default-src`, `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `media-src`, `worker-src`, `frame-ancestors` and `base-uri`. The `connect-src` allowlist must include the Go API and the optional error ingestion endpoint.

## Auth / cookie deployment requirements

The backend owns the refresh cookie. For production:

- cookie must be `HttpOnly`, `Secure` and scoped as narrowly as possible;
- choose `SameSite=Lax` for same-site deployment or the backend-approved cross-site strategy if origins differ;
- CORS must allow only the real frontend origins and credentials;
- access tokens remain in frontend memory only;
- never expose refresh credentials to JavaScript.

## Data ownership

Server-capable today:

- auth/session;
- user profile;
- learning progress;
- semantic reading blocks;
- saved theorem bookmark metadata;
- saved topics;
- topic resume;
- reading width;
- UI preferences;
- activity heatmap/stats.

Device-local by deliberate product boundary:

- uploaded background audio blobs;
- free-form block notes until the backend exposes an annotation resource.

Generic Important marks use rich bookmarks where possible and still keep a local cache for instant UX.

## Annotation backend gap

Free-form notes require an explicit backend resource. The frontend already uses stable `topicId::blockIndex` identities and does not need page rewrites when this arrives.

Recommended contract:

```text
GET    /api/v1/me/annotations
PUT    /api/v1/me/annotations/{contentBlockId}
DELETE /api/v1/me/annotations/{contentBlockId}
```

Until then notes remain device-local and the UI states that local-first behavior.

## Staging acceptance checklist

Before calling the complete product production-ready:

1. deploy frontend + Go backend to staging HTTPS origins;
2. verify `/health`, `/ready`, auth register/login/refresh/logout;
3. create an anonymous local progress state, sign in, verify merge;
4. reload and verify refresh-cookie session restoration;
5. verify workspace/preferences sync on a second browser;
6. verify activity appears after real learning mutations;
7. force backend offline and verify graceful fallback/error states;
8. force a 401 access-token expiry and verify single refresh + retry;
9. trigger a controlled frontend error and confirm error ingestion;
10. run the browser smoke suite against staging;
11. verify CSP/CORS/cookies in browser devtools;
12. verify backend backups/migrations/alerts separately.

The frontend code can be backend-ready before the backend deployment itself is production-ready.
