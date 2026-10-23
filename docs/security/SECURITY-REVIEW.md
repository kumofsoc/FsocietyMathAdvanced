# MathMaMath / VisualMath: Security Review

**Дата обзора:** 2026-10-23  
**Тип:** ограниченный обзор исходного кода frontend и конфигурации CI/CD; не независимый penetration test.  
**Статус:** проверка частичная. Не подтверждает отсутствие уязвимостей и не является security certification.

## Проверенные исходники

- `src/shared/api/client.ts` и `src/shared/api/transport.ts`: bearer access token in memory, refresh flow, credentials.
- `src/features/auth/model/authSession.ts`, `src/features/auth/ui/AccountAuthGate.tsx`: восстановление сессий, reset/verify через URL fragment.
- `src/shared/observability/runtimeErrors.ts`: outbound diagnostic telemetry.
- `deploy/nginx.conf`, `deploy/security-headers.conf`, `Dockerfile`: frontend HTTP headers, CSP, runtime permissions.
- `.github/workflows/ci.yml`, `.github/workflows/release-gate.yml`, `.github/dependabot.yml`, `package.json`.
- `README.md`, `docs/production-readiness.md`: documented expectations.

Это **ручное чтение перечисленных файлов**, не репозиторный exhaustive review. Тесты и сканеры в этой проверке локально не запускались. Результаты нового CI см. по ссылкам в `SECURITY.md`.

## Наблюдаемые защитные механизмы

| Контроль | Свидетельство | Ограничение |
| --- | --- | --- |
| JavaScript access token не записывается штатным API-клиентом в persistent storage | `src/shared/api/client.ts` | Только проверенный клиентский код, не backend/cookie policy |
| Режим local-first и разделение учётных данных | `src/features/auth/model/authSession.ts` | Cross-account/API controls подтверждаются тестами backend |
| CSP, запрет iframe, nosniff и прочие заголовки | `deploy/security-headers.conf` | Действует на проверяемый Nginx image; требуются live HTTP checks |
| Non-root frontend container | `Dockerfile` плюс CI smoke `id -u` | Не доказывает защиту runtime host |
| `pnpm audit --prod --audit-level high`, тесты, CI smoke | `.github/workflows/ci.yml` | Успех конкретного запуска проверяется в GitHub Actions |
| Dependabot | `.github/dependabot.yml` | Alerts/PR и их устранение должны контролироваться |
| CodeQL и dependency review | `.github/workflows/security-checks.yml` | Результаты появятся после запуска; CodeQL alerts нужно разбирать отдельно |
| Сведения об уязвимостях | `SECURITY.md` | GitHub private vulnerability reporting нужно включить в настройках, если доступно |

## Конкретное улучшение этого изменения

В предыдущей версии `src/shared/observability/runtimeErrors.ts` диагностические сообщения включали raw `window.location.hash`, `error.message`, `error.stack` и `componentStack`. Маршруты `#account?reset=...` и `#account?verify=...` содержат чувствительные токены, поэтому существовал **риск передачи токенов во внешнее error-reporting хранилище**.

Теперь удалены сырые сообщения/стеки, error name ограничен известными типами, route сводится к небольшой группе публичных маршрутов. Добавлены регрессионные тесты, запрещающие попадание тестового токена в telemetry payload. Это сокращает диагностическую детализацию ради предотвращения передачи пользовательских секретов.

## Непроверенное и оставшиеся риски

1. **Backend:** проверки owner-scoped API, CORS/CSRF, refresh rotation, cookie flags, rate limiting, password reset/email verify, file upload validation и authorization bypass требуют самостоятельного security review и real-backend E2E.
2. **Продакшн:** отсутствие подтверждений HTTPS/TLS, backup/restore, DNS/infra hardening, runtime headers на реальном адресе.
3. **Supply chain:** GitHub Actions и Docker base images с версиями/тегами вместо immutable commit SHA/digest; желательно зафиксировать и регулярно обновлять.
4. **CSP:** `style-src 'unsafe-inline'` остаётся разрешённым. Для его удаления потребуется согласование со стилями и runtime-библиотеками.
5. **Static scan coverage:** CodeQL не заменяет ручной аудит, secret scanning, container image scanning или динамическое тестирование.
6. **Workflow enforcement:** настройте branch protection/rulesets с обязательными status checks; настройте GitHub Code Security, Dependabot alerts, secret scanning и push protection, где они доступны.
7. **Privacy:** периодически проверяйте новые источники телеметрии, localStorage/IndexedDB isolation, retention and consent.

## Как публиковать подтверждения

1. Зафиксировать commit SHA и точные версии frontend и backend.
2. Дождаться CI, CodeQL и Dependency Review и проверить **конкретные** результаты. Зеленый job CodeQL означает успешный анализ, а не ноль найденных alerts.
3. Провести реальный authenticated API pentest в своём staging, тесты матрицы прав, cookies/CORS/CSRF, сценариев восстановления и удаления.
4. Собрать findings c severity, шагами воспроизведения (приватно), исправлением и повторной проверкой.
5. Опубликовать датированный отчёт c явно обозначенным scope и ограничениями. Только независимое заключение аудитора может называться независимым аудитом.

**Security statement:** проект включает проверяемые защитные механизмы и регулярный автоматизированный анализ. Заявления о гарантированной или сертифицированной безопасности **не делаются**.
