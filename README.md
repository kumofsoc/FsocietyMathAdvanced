# VisualMath

Интерактивная среда для изучения высшей математики на React + TypeScript.

## Стек

- React 19 + TypeScript + Vite
- Framer Motion / GSAP
- Three.js / React Three Fiber
- KaTeX
- G6 / интерактивная карта курса
- local-first browser cache + authenticated Go backend

## Текущее состояние курса

- **87 / 87 тем READY**
- **551 задача** в общем банке практики
- Linear Academy PRO для углублённого линала/геометрии
- Review Mode для сухого повторения
- интерактивные лаборатории и математические визуализации
- bundled course content: чтение курса не требует backend

## Local-first + account sync

VisualMath работает без backend и без аккаунта.

После авторизации backend становится canonical account-scoped storage, а существующие browser-модели остаются optimistic cache/UI boundary.

Session start использует:

```text
GET /api/v1/me/bootstrap
```

Bootstrap одним read model гидратирует user, preferences, workspace, learning/progress и runtime capabilities.

Bearer-копия access token, которой пользуется JavaScript API-клиент, хранится только в памяти. Refresh token остаётся HttpOnly cookie и никогда не читается из JavaScript. Для нативного server-audio backend дополнительно выставляет короткоживущую HttpOnly-копию access token, ограниченную путём `/api/v1/me/media/audio`; она не используется остальными API и не попадает в URL.

## Account-scoped ресурсы

После авторизации синхронизируются:

- learning/progress;
- exact reading blocks;
- saved theorem/bookmarks;
- saved topics;
- topic resume;
- reading width;
- themes/cursor/motion/sidebar preferences;
- block notes;
- Important Blocks;
- activity;
- background audio playlist, если `bootstrap.capabilities.mediaAudio === true`.

Первая anonymous -> account migration выполняется один раз на user ID. После неё server state является canonical.

## Account security and lifecycle

Authenticated account UI now supports:

- password rotation through `PUT /api/v1/me/password`; success revokes every backend session and returns the browser to login;
- canonical JSON portability export through `GET /api/v1/me/account/export`;
- password-confirmed self-deletion through `DELETE /api/v1/me/account`.

The password-change flow never keeps a stale access token alive after success. Export is server-canonical and excludes password/session secrets and internal media object keys.

## Notes

Block Notes используют dedicated backend API:

```text
GET    /api/v1/me/notes
GET    /api/v1/me/notes/{topicId}/{blockIndex}
PUT    /api/v1/me/notes/{topicId}/{blockIndex}
DELETE /api/v1/me/notes/{topicId}/{blockIndex}
```

Anonymous notes остаются localStorage-only.

Authenticated note сохраняется optimistic локально, затем write-through на backend. При network failure текст остаётся локально и pending mutation повторяется позже.

## Important Blocks

Important Blocks используют отдельный resource:

```text
GET    /api/v1/me/important-blocks
PUT    /api/v1/me/important-blocks/{topicId}/{blockIndex}
DELETE /api/v1/me/important-blocks/{topicId}/{blockIndex}
```

Новые Important marks больше не создаются как `important:*` bookmarks.

Legacy `important:*` bookmarks мигрируются один раз и удаляются только после успешного dedicated PUT.

## Background Music

Anonymous или media capability disabled:

- IndexedDB playlist;
- play/pause/volume/loop;
- локальные файлы переживают перезапуск.

Authenticated + `mediaAudio === true`:

- server upload/list;
- rename;
- reorder;
- delete;
- private authenticated playback.

Server audio воспроизводится напрямую через native `<audio>` по приватному content URL. Перед playback frontend обновляет короткоживущий media-access credential при необходимости, а браузер использует authenticated HTTP Range для metadata/seek/resume. Access token не попадает в URL; Blob/ObjectURL остаётся только для локальных IndexedDB-треков.

Существующие IndexedDB blobs не удаляются автоматически. Если включён account media, UI предлагает явный импорт локальных треков.

## Runtime config

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
```

Не добавляй `/api` к `VITE_API_BASE_URL`.

## Запуск

```bash
pnpm install
pnpm dev
```

## Release gate

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Real-backend E2E:

```bash
VISUALMATH_E2E_API_BASE_URL=http://127.0.0.1:8080 pnpm test:e2e:backend
```

PR CI also contains a convenience `Backend E2E` workflow. It executes the same suite when the repository variable `VISUALMATH_E2E_API_BASE_URL` points to an accessible staging backend; without that variable it skips the browser job.

The separate `Release Gate` workflow is strict: manual runs and `v*` tags fail if the staging backend URL is missing or non-HTTPS, and then run the real-backend Playwright suite. Use that workflow as the integration proof before a production release.

Backend contract baseline verified by the current frontend integration:

```text
kumofsoc/FsocietyMathAdvancedBackend
a1096551363151cf5d2ac3a7ab53ce54500c4180
```

## Основные routes продукта

- `#home` — главная
- `#map` — карта курса
- `#academy` — Linear Academy PRO
- `#review` — краткий конспект
- `#marks` — заметки + Important Blocks
- `#account` — аккаунт
- `#<topicId>` — тема курса

## Архитектура

Контент курса остаётся bundled/static и отделён от account storage.

Ключевые integration layers:

- `src/shared/api/types.ts` — DTO;
- `src/shared/api/client.ts` — HTTP/auth/session boundary;
- `src/features/auth/model/authSession.ts` — bootstrap/login/register/logout;
- `src/features/sync/model/userStateSync.ts` — first migration + canonical hydration;
- `src/features/sync/model/autoSync.ts` — resource-specific debounced mutations;
- `src/features/block-notes/model/blockNotes.ts` — local cache + pending notes;
- `src/features/important-blocks/model/importantBlocks.ts` — local cache + pending Important markers;
- `src/features/background-music/model/backgroundAudio.ts` — IndexedDB/server media adapters.

Подробности: `docs/backend-contract.md` и `docs/production-readiness.md`.
