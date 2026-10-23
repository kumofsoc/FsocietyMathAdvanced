# Security Policy / Политика безопасности

Безопасность MathMaMath (в исходном коде приложение называется VisualMath) проверяется публичными, воспроизводимыми процедурами. **Ни один статус CI, badge или этот документ не является сертификатом отсутствия уязвимостей.**

## Сообщение об уязвимости / Reporting

Пожалуйста, **не раскрывайте** уязвимость, токены, персональные данные или PoC в публичном Issue.

1. Откройте [Private vulnerability reporting](https://github.com/kumofsoc/MathMaMath/security/advisories/new), если эта функция включена владельцем репозитория.
2. Если приватная отправка недоступна, создайте публичный Issue **без технических деталей уязвимости** с просьбой открыть закрытый канал связи. Не публикуйте эксплойт.
3. Сообщите затронутые версии/commit, воспроизведение, последствия и предполагаемое исправление **только приватно**.

Не тестируйте доступ к чужим аккаунтам, не извлекайте чужие данные и не нарушайте доступность сервиса. Для исследования используйте собственные тестовые данные.

**English:** Please disclose vulnerabilities privately through GitHub's private vulnerability reporting if enabled. If unavailable, request a private channel in a public Issue without publishing exploit details, secrets or user data. Avoid disruptive testing or accessing third-party accounts.

## Scope / Область действия

- Этот репозиторий содержит frontend и конфигурацию frontend-контейнера.
- Аутентификация, хранение пользовательских данных, cookie, токены и API-авторизация **требуют отдельной проверки backend**: [FsocietyMathAdvancedBackend](https://github.com/kumofsoc/FsocietyMathAdvancedBackend).
- Реальное развёртывание, DNS/TLS, облачные настройки, backup/restore и инфраструктура не подтверждаются одним исходным кодом.
- Результаты проверки и оставшиеся ограничения: [docs/security/SECURITY-REVIEW.md](docs/security/SECURITY-REVIEW.md).

## Public verification / Проверка

- [Security Checks](https://github.com/kumofsoc/MathMaMath/actions/workflows/security-checks.yml): CodeQL на push/PR/по расписанию и Dependency Review на PR.
- [CI](https://github.com/kumofsoc/MathMaMath/actions/workflows/ci.yml): unit, typecheck, build, локальные Playwright-тесты, dependency audit, smoke контейнера.
- [Release Gate](https://github.com/kumofsoc/MathMaMath/actions/workflows/release-gate.yml): real-backend Playwright; требуется доступный staging backend по HTTPS.
- [Security alerts](https://github.com/kumofsoc/MathMaMath/security): предупреждения GitHub при доступности и соответствующих настройках.

Перед релизом проверьте **актуальный SHA, статус прогонов, результаты CodeQL/Dependabot и ручные findings**, а не только цвет badge.
