# Backend contract / frontend boundary

The frontend is intentionally **local-first** today. A backend is optional and configured only through:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Existing frontend boundary

- `src/types/api.ts` — transport DTOs.
- `src/lib/api.ts` — one fetch client, auth header, errors, credentials.
- `src/lib/progressSync.ts` — converts current local learning state into the future server payload.
- No React component calls raw `fetch`.
- No backend URL is hard-coded in UI components.
- The course remains usable when `VITE_API_BASE_URL` is absent.

## Planned Go endpoints

```text
GET  /health
GET  /v1/profile
GET  /v1/progress
PUT  /v1/progress
```

### PUT /v1/progress

Request:

```json
{
  "theoryRead": ["matrices"],
  "solvedTaskIds": ["matrix-001"],
  "savedTheoremIds": ["determinants::12"],
  "lastTopicId": "determinants",
  "clientUpdatedAt": "2026-10-02T12:00:00.000Z"
}
```

The server should return the canonical merged progress object with its own `updatedAt`.

## Conflict strategy to implement with backend

1. Authentication establishes the server identity.
2. On first login, upload the anonymous/local state.
3. Merge set-like data by union: theory, solved tasks, saved theorem IDs.
4. Resolve `lastTopicId` by the newest timestamp.
5. Return server canonical state.
6. Only after a successful merge may the frontend hydrate local caches.

This keeps current localStorage/IndexedDB UX fast and makes backend sync additive instead of invasive.

## Background music / media

Current default is still browser IndexedDB, but the frontend already exposes a separate `BackgroundTrackStorage` transport contract in `src/lib/backgroundAudio.ts`.

Future cloud media endpoint:

```text
GET    /v1/media/background-track
PUT    /v1/media/background-track
DELETE /v1/media/background-track
```

`PUT` accepts `multipart/form-data` with a `file` part. `GET` returns the audio blob and may send `X-Track-Name` / `X-Track-Updated-At` headers.

Large media blobs deliberately stay outside `/v1/progress`; connecting the Go backend only requires injecting `createHttpBackgroundTrackStorage(...)` into the player storage boundary.
