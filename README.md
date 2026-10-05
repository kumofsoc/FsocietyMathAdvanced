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

Access token хранится только в памяти. Refresh token остаётся HttpOnly cookie и никогда не читается из JavaScript.

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

Audio content загружается Authorization-fetch -> Blob/ObjectURL. Access token не попадает в URL.

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

PR CI also contains a separate `Backend E2E` workflow. It executes the same suite when the repository variable `VISUALMATH_E2E_API_BASE_URL` points to an accessible release-gate/staging backend. If the variable is not configured, the workflow reports that the real-backend job is skipped; a green frontend CI alone is not evidence that the backend-integrated suite ran.

Backend contract baseline verified by the current frontend integration:

```text
kumofsoc/FsocietyMathAdvancedBackend
5b33e893d913593d0042f8932e902f5f6225e0ed
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
