# Production readiness

This document is the release gate for the VisualMath frontend.

## Automated PR gate

Every pull request to `main` must pass the single CI `release-gate` job:

1. install dependencies;
2. Vitest unit/model tests;
3. TypeScript + Vite production build;
4. install Playwright Chromium;
5. run browser smoke tests against `vite preview`.

Playwright covers:

- homepage and real topic rendering;
- topic-local search availability;
- notes + Important persistence across reload;
- My Marks aggregation;
- block deep links;
- local-only Account behavior with no fake activity.

A failed browser run uploads `playwright-report` and `test-results` for seven days.

## Runtime configuration

Use `.env.example` as the deployment contract.

### Backend-optional deployment

```env
VITE_API_BASE_URL=
VITE_REQUIRE_BACKEND=false
```

The course runs local-first and account/server features remain unavailable without breaking learning.

### Backend-required staging/production

```env
VITE_API_BASE_URL=https://api.example.com
VITE_REQUIRE_BACKEND=true
VITE_APP_ENV=production
VITE_BUILD_SHA=<git-sha>
```

Invalid runtime configuration is raised inside the React error boundary instead of silently running a partially configured build.

## Runtime health

When a backend URL is configured the frontend checks:

- `GET /health`;
- `GET /ready`;
- `GET /api/v1/meta`.

The runtime status distinguishes local-only, checking, ready, degraded and offline states.

## Error reporting

React render failures, global `error` events and unhandled promise rejections pass through one observability adapter.

If `VITE_ERROR_REPORT_URL` is configured, the frontend sends a small `navigator.sendBeacon` payload containing:

- application/environment;
- build SHA;
- current hash route;
- timestamp;
- error name/message/stack;
- technical source/context.

The payload intentionally excludes profile data, notes, progress, tokens, email and other user content.

Without a reporting URL errors remain visible in developer console and recovery UI.

## Required hosting/security conditions

For a backend-enabled production deployment:

- frontend and backend must use HTTPS;
- backend CORS must allow the exact frontend origin, not `*` with credentials;
- refresh cookie must be `HttpOnly`, `Secure` in production and scoped to the auth route;
- access tokens remain memory-only in the frontend;
- static hosting must serve `index.html` for the application root (routing itself is hash-based);
- frontend assets should use long immutable cache headers for hashed files and short/no-cache for `index.html`;
- production should define a CSP appropriate for the selected hosting/error-report endpoint;
- secrets must never use `VITE_*` variables because Vite exposes them to the browser.

## Data readiness

Backend-capable today:

- auth/session;
- profile;
- learning progress;
- theorem bookmark metadata;
- saved topics;
- topic resume;
- reading width;
- UI preferences;
- activity statistics/heatmap.

Block notes and generic Important marks remain local until the backend annotation resource exists. Their UI is already isolated behind stable `topicId::blockIndex` models, so the future adapter does not require page rewrites.

## Release decision

A frontend commit is **code-release-ready** only when:

- release-gate CI is green;
- runtime config validation has no issues;
- no mock account/activity data is exposed;
- backend-required deployments report backend `ready`;
- annotation sync is either explicitly device-local or supported by the deployed backend.

A complete public production launch additionally requires a real staging smoke test against the deployed Go backend and production infrastructure monitoring/capacity policies.
