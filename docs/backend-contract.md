# Backend contract / frontend boundary

The frontend is intentionally **local-first** today. A backend is optional and configured only through:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Existing frontend boundary

- `src/shared/api/types.ts` — transport DTOs.
- `src/shared/api/client.ts` — one fetch client, auth header, errors, credentials.
- `src/features/learning/model/progressSync.ts` — converts current local learning state into the future server payload.
- `src/types/api.ts`, `src/lib/api.ts` and `src/lib/progressSync.ts` remain thin compatibility facades during migration.
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

Background music is currently browser-local and stored directly in IndexedDB by
`src/features/background-music/model/backgroundAudio.ts`. No media HTTP transport is
implemented in the current frontend.

If cloud media is added later, introduce an explicit storage/transport boundary first.
Large audio blobs should remain separate from `/v1/progress`; do not couple progress
sync to media uploads.
