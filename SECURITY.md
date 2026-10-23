# Security Policy / Политика безопасности

MathMaMath использует автоматические проверки и документированные меры защиты. Успешные проверки не являются гарантией отсутствия уязвимостей.

## Сообщения об уязвимостях / Vulnerability disclosure

**Приватный канал:** [GitHub Security Advisory](https://github.com/kumofsoc/MathMaMath/security/advisories/new).

Если приватная форма недоступна, в [Issues](https://github.com/kumofsoc/MathMaMath/issues/new) допускается только запрос закрытого канала связи. Не размещайте в публичных обсуждениях секреты, персональные данные, рабочие эксплойты или детали неизвестной уязвимости.

Приватное сообщение должно содержать затронутую версию/commit, последовательность воспроизведения, последствия и рекомендации по исправлению. Проверки проводятся только с тестовыми данными без нарушения доступности сервиса или доступа к чужим аккаунтам.

**English:** Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/kumofsoc/MathMaMath/security/advisories/new). If that form is unavailable, use a public issue only to request a private disclosure channel. Do not disclose exploit details, tokens, or personal data publicly.

## Область проверки / Scope

- Этот репозиторий содержит frontend и его конфигурацию развёртывания.
- Backend, API-авторизация, управление сессиями и защита серверных данных требуют отдельного анализа: [FsocietyMathAdvancedBackend](https://github.com/kumofsoc/FsocietyMathAdvancedBackend).
- Защита продакшн-инфраструктуры, DNS/TLS, backup/restore и cloud configuration проверяется отдельно.
- Ограничения и результаты предыдущего обзора: [Security Review](docs/security/SECURITY-REVIEW.md).

## Проверяемые механизмы / Verification

- [Security Checks](https://github.com/kumofsoc/MathMaMath/actions/workflows/security-checks.yml): CodeQL и Dependency Review.
- [CI](https://github.com/kumofsoc/MathMaMath/actions/workflows/ci.yml): типизация, тесты, проверка зависимостей и frontend-контейнера.
- [Release Gate](https://github.com/kumofsoc/MathMaMath/actions/workflows/release-gate.yml): интеграционные тесты с реальным backend при доступном HTTPS staging.
- [GitHub Security](https://github.com/kumofsoc/MathMaMath/security): сведения и предупреждения GitHub.

Результаты действительны только для соответствующих commit SHA и среды запуска; CI не является независимой сертификацией безопасности.
