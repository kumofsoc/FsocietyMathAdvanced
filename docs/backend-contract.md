# Backend contract / frontend boundary

VisualMath is **local-first with authenticated server sync**. The frontend remains fully usable when no backend is configured, while a configured backend becomes the canonical account-scoped store after authentication.

## Runtime configuration

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=12000
```

The base URL is the backend origin. Frontend routes use the backend's real `/api/v1` namespace.

## Auth lifecycle

The frontend matches the current Go backend contract:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `PATCH /api/v1/me/profile`

Access tokens live **in memory only**. Refresh credentials remain in the backend-issued HttpOnly cookie. On application startup, a configured frontend attempts one serialized refresh; React StrictMode cannot trigger duplicate refresh rotations. Protected requests receive one automatic retry after a successful refresh on HTTP 401.

## Request boundary

`src/shared/api/client.ts` is the only HTTP transport boundary.

It provides:

- request timeout/cancellation;
- `credentials: include`;
- bearer access-token injection;
- nested backend error-envelope parsing;
- request ID capture when returned by the backend;
- normalized timeout/network errors;
- serialized token refresh;
- one authenticated retry after 401.

UI components do not call raw `fetch`.

## Learning sync

Canonical backend routes:

- `GET /api/v1/me/learning`
- `POST /api/v1/me/learning/sync`

On authenticated bootstrap and debounced local changes the frontend sends:

- completed theory topic IDs;
- solved task IDs;
- saved theorem IDs;
- per-topic reading coverage;
- last topic;
- client timestamp.

The backend performs set-union / monotonic merge. The returned canonical state hydrates the local cache. Rich bookmark metadata is fetched separately from `GET /api/v1/me/bookmarks` when available so server-only theorem IDs can still be represented in the existing local UI.

## Learning workspace sync

Canonical backend routes:

- `GET /api/v1/me/workspace`
- `PUT/DELETE /api/v1/me/workspace/saved-topics/{topicId}`
- `PUT /api/v1/me/workspace/topics/{topicId}/resume`
- `PUT /api/v1/me/workspace/reading-width`

Merge strategy:

1. saved topics are additive during bootstrap;
2. resume entries use their existing millisecond `updatedAt` timestamps;
3. a non-default local reading width seeds a default server workspace;
4. the final server snapshot hydrates local caches.

## Preferences sync

Canonical backend routes:

- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`

The frontend exposes one normalized preference snapshot containing theme, all 12 theme tokens, cursor mode, motion profile and sidebar state.

Local preference changes set a dirty marker. A dirty local snapshot is pushed to the backend; server hydration clears the marker. If neither side is dirty, server account preferences win. This prevents ordinary server hydration from overwriting a fresh local UI change.

## Data currently server-capable

The frontend has transport/reconciliation boundaries for:

- auth/session;
- user profile;
- learning progress;
- saved theorem IDs / bookmark metadata;
- saved topics;
- reading resume;
- reading width;
- interface preferences;
- activity stats/heatmap.

The Go backend also exposes catalog, search and media APIs; existing frontend course content remains bundled and browser audio remains IndexedDB-first until those transports are deliberately enabled.

## Local-only annotation cache

Block notes and generic “important” marks are intentionally isolated behind their feature models and stable `topicId::blockIndex` identities. The current Go backend does **not** expose a note/annotation endpoint, so the frontend does not invent one or silently overload theorem bookmarks.

This is not a UI coupling problem: adding a server annotation adapter later does not require changes to TopicPage or MyMarksPage. Required future backend capability:

```text
GET    /api/v1/me/annotations
PUT    /api/v1/me/annotations/{contentBlockId}
DELETE /api/v1/me/annotations/{contentBlockId}
```

Suggested resource fields:

```json
{
  "contentBlockId": "matrices::12",
  "topicId": "matrices",
  "note": "my note",
  "important": true,
  "updatedAt": "RFC3339"
}
```

Until the backend implements that capability, notes and generic important marks remain device-local by design.

## Backend readiness rule

The frontend is considered backend-ready when:

1. all account-capable UI reads/writes through local feature models or the shared API boundary;
2. authenticated bootstrap can merge and hydrate learning/workspace/preferences without page rewrites;
3. account UI uses the auth/profile API when configured;
4. API errors, timeout, session refresh and offline fallback have defined behavior;
5. integration-critical E2E smoke tests run in CI.

Production readiness additionally requires deployment observability, security/runtime configuration, and a live backend/staging environment.
