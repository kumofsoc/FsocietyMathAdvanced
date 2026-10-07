# Backend contract / frontend boundary

VisualMath is **local-first for anonymous/offline use** and **server-canonical after authentication**.

The frontend remains usable when no backend is configured. When a user authenticates successfully, account-scoped data is hydrated from the Go backend and local feature models become an optimistic cache/write-through boundary.

Backend release gate used for this integration:

```text
kumofsoc/FsocietyMathAdvancedBackend
8b2116c0be6c4acbde0f957378f53ea0c373b1b2
```

## Runtime configuration

Local development:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=12000
```

Production:

```env
VITE_API_BASE_URL=https://<final-visualmath-origin>
VITE_API_TIMEOUT_MS=12000
VITE_APP_RELEASE=<git-sha>
```

`VITE_API_BASE_URL` is the origin only. Do **not** append `/api`; the shared client already calls `/api/v1/...`.

Bundled course content never depends on the backend.

## HTTP/auth boundary

All product HTTP goes through `src/shared/api/client.ts` or transport adapters built on that same boundary.

The client owns:

- `credentials: include`;
- request timeout/cancellation;
- bearer access-token injection;
- normalized backend errors/request IDs;
- one authenticated retry after HTTP 401;
- serialized refresh so React StrictMode cannot rotate the refresh cookie twice;
- JSON and authenticated Blob responses.

Security rules:

- access token lives **only in memory**;
- refresh token is never read by JavaScript;
- refresh remains the backend-owned HttpOnly cookie;
- normal protected JSON/API calls use Authorization headers;
- native server audio uses the narrow HttpOnly media-access cookie on the existing private content URL;
- auth tokens are never embedded in media URLs.

## Account lifecycle

Authenticated account-management endpoints:

- `GET /api/v1/me/sessions` — active unexpired session metadata with a current-session marker;
- `DELETE /api/v1/me/sessions/{sessionId}` — idempotent owner-scoped revoke; self-revoke clears the current browser auth state;
- `PUT /api/v1/me/password` — current-password-confirmed password rotation; backend revokes all sessions/tokens and the frontend clears visible account cache before returning to anonymous/login state;
- `GET /api/v1/me/account/export` — canonical JSON portability snapshot;
- `DELETE /api/v1/me/account` — current-password-confirmed destructive account removal.
- `POST /api/v1/auth/email-verification/request` — capability-gated, anti-enumeration resend request; accepted response does not reveal whether an account exists.\n- `POST /api/v1/auth/email-verification/confirm` — one-time opaque-token confirmation; invalid/expired/reused tokens are rejected.\n- `POST /api/v1/auth/password-reset/request` — capability-gated, anti-enumeration reset request; returns the same accepted result for known/unknown valid emails.
- `POST /api/v1/auth/password-reset/confirm` — one-time opaque-token confirmation; successful reset revokes all existing sessions and refresh tokens.

These operations use the same bearer/session boundary as the rest of `/api/v1/me`. Password rotation and deletion deliberately invalidate the current browser session instead of silently issuing replacement credentials.

## Session bootstrap

Auth routes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

Session-start read model:

- `GET /api/v1/me/bootstrap`

Typed response:

```ts
{
  version: number;
  generatedAt: string;
  user: UserDto;
  preferences: PreferencesDto;
  workspace: WorkspaceDto;
  learning: LearningProgressDto;
  capabilities: {
    mediaAudio: boolean;
  };
}
```

After refresh/login/register, bootstrap is the primary session-start snapshot. The frontend does not immediately repeat four equivalent reads for user/preferences/workspace/learning.

Bootstrap hydrates:

- current user/profile;
- UI preferences;
- workspace;
- learning/progress and exact reading blocks;
- runtime capabilities.

Notes, Important Blocks, bookmarks, activity and media track lists remain separate/lazy resources because the backend intentionally does not include them in bootstrap.

## First authenticated migration vs normal hydration

`src/features/sync/model/userStateSync.ts` separates three concerns.

### First authenticated migration

A per-user, versioned migration marker controls anonymous -> account migration.

Before bootstrap hydration overwrites core local state, VisualMath captures the anonymous migration seed. Migration then:

- union-merges monotonic learning facts;
- migrates exact reading blocks;
- migrates saved topics;
- migrates resume by `updatedAt`;
- seeds reading width only when the remote workspace is pristine;
- migrates meaningful/dirty preferences without overwriting established server preferences;
- creates missing theorem bookmark metadata.

The marker is written only after successful migration.

### Ordinary authenticated hydration

On normal login/session restore, server bootstrap is canonical. A browser cache previously owned by another user is not migrated into the new account.

Hydration-generated browser events are tagged as `source: "hydrate"` and do not trigger write-back loops.

### Background mutations

After migration, UI events use resource-specific endpoints instead of re-running a full multi-resource merge after each small change.

Examples:

- saved topic -> workspace saved-topic endpoint;
- resume -> workspace resume endpoint;
- reading width -> workspace reading-width endpoint;
- preferences -> preferences PUT;
- reading block -> exact reading-block PUT;
- theory/exercise -> dedicated progress mutation;
- note -> dedicated note endpoint;
- Important -> dedicated Important Blocks endpoint.

Offline/network failures keep optimistic local state and durable pending mutations where needed.

On confirmed logout or confirmed session absence, the frontend clears the visible browser cache only when it is marked as account-owned. Durable pending mutations stay user-bound and are not reclassified as anonymous state, so unsent account edits can retry when that same user logs back in without leaking their cached content to anonymous mode.

## Learning/progress

Canonical endpoints used by the frontend include:

- `GET /api/v1/me/learning`
- `POST /api/v1/me/learning/sync` — first migration/coarse recovery
- `PUT /api/v1/me/progress/topics/{topicId}`
- `POST/DELETE /api/v1/me/theory/{topicId}/complete`
- `POST/DELETE /api/v1/me/exercises/{exerciseId}/solve`
- `PUT /api/v1/me/resume`
- `PUT /api/v1/me/reading-blocks/{topicId}/{blockIndex}`
- `POST /api/v1/me/reading-blocks/sync` — first migration

Saved theorem metadata uses:

- `GET /api/v1/me/bookmarks`
- `POST /api/v1/me/bookmarks`
- `DELETE /api/v1/me/bookmarks/{id}`

Bookmarks remain bookmarks. Important Blocks are no longer represented by new `kind="important:*"` bookmarks.

## Workspace

Endpoints:

- `GET /api/v1/me/workspace`
- `PUT/DELETE /api/v1/me/workspace/saved-topics/{topicId}`
- `PUT /api/v1/me/workspace/topics/{topicId}/resume`
- `PUT /api/v1/me/workspace/reading-width`

The existing local feature models remain the UI boundary for instant local-first UX.

## Preferences

Endpoints:

- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`

Hydration never marks preferences dirty. Theme/cursor/motion/sidebar mutations are persisted only after an explicit local user change.

This prevents a normal login on another device from sending browser defaults back over established account preferences.

## Block Notes

Endpoints:

- `GET /api/v1/me/notes`
- `GET /api/v1/me/notes/{topicId}/{blockIndex}`
- `PUT /api/v1/me/notes/{topicId}/{blockIndex}`
- `DELETE /api/v1/me/notes/{topicId}/{blockIndex}`

`src/features/block-notes/model/blockNotes.ts` remains the UI/cache boundary.

Anonymous:

- localStorage only.

Authenticated:

- optimistic local save;
- durable pending mutation;
- debounced backend write-through;
- canonical response replaces the optimistic timestamp/cache entry.

First authenticated migration:

1. read local notes;
2. list remote notes;
3. upload local-only notes;
4. resolve conflicts by `updatedAt`;
5. hydrate canonical local cache;
6. write a per-user migration marker only after success.

A failed network write never deletes the local note; pending state is retried later.

## Important Blocks

Dedicated endpoints:

- `GET /api/v1/me/important-blocks`
- `PUT /api/v1/me/important-blocks/{topicId}/{blockIndex}`
- `DELETE /api/v1/me/important-blocks/{topicId}/{blockIndex}`

Backend metadata (`topicTitle`, `blockTitle`, `kind`) is authoritative.

The existing `visualmath-important-blocks-v1` feature model remains the UI cache.

One-time migration is idempotent:

- migrate existing local Important Blocks;
- detect legacy server bookmarks with `kind="important:*"`;
- PUT the dedicated Important marker;
- delete the legacy bookmark only after that PUT succeeds;
- mark migration complete per user.

After migration, dedicated Important Blocks are the server resource. Saved theorem/bookmark behavior remains separate.

## Background audio

Runtime switch:

```ts
bootstrap.capabilities.mediaAudio
```

Anonymous or `mediaAudio === false`:

- existing IndexedDB playlist remains active.

Authenticated and `mediaAudio === true`:

- `POST /api/v1/me/media/audio`
- `GET /api/v1/me/media/audio`
- `PUT /api/v1/me/media/audio/order`
- `PATCH /api/v1/me/media/audio/{id}`
- `DELETE /api/v1/me/media/audio/{id}`
- `GET /api/v1/me/media/audio/{id}/content` (Bearer or narrow HttpOnly media-access cookie; byte-range capable for native playback)

Server playback assigns the authenticated content URL directly to native `<audio>`. Before assigning/resuming that URL, the frontend refreshes the short-lived media-access credential when the in-memory access session is near expiry. Native HTTP Range requests handle metadata, seek and resume without buffering the entire server track into a Blob. Blob/ObjectURL playback remains only for local IndexedDB tracks; local object URLs are revoked when the selected track changes or the player unmounts.

If server media becomes unavailable, the player can fall back to the local IndexedDB playlist. Existing local blobs are never silently deleted.

When account media is available and old local blobs exist, the Settings UI exposes an explicit import action. Import does not remove the original local files.

## Local-first guarantees

When `VITE_API_BASE_URL` is empty, VisualMath remains fully usable locally.

When the user is anonymous:

- course content stays bundled;
- learning state keeps working locally;
- notes and Important marks stay local;
- music stays IndexedDB-backed.

When a configured backend is temporarily unavailable:

- already loaded app/course content remains usable;
- local caches remain readable;
- note/Important optimistic writes remain pending instead of being discarded;
- media falls back locally where possible;
- account/network errors do not turn the course into a blank screen.

## Tests

Local/frontend release gate:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

Real-backend mode:

```bash
VISUALMATH_E2E_API_BASE_URL=http://127.0.0.1:8080 pnpm test:e2e:backend
```

The backend-integrated suite covers registration, bootstrap, preferences, progress/reading, saved topic/resume, notes, Important Blocks, reload/session restore, logout/login, cross-browser account state, one 401 -> one refresh -> retry, backend outage fallback, capability-gated media CRUD, account export/delete contracts, and password rotation with old-session/old-password invalidation.
