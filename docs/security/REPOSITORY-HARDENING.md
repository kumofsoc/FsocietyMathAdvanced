# Защита открытого репозитория MathMaMath

Публичный доступ к исходному коду не даёт прав изменять `main`, секреты или настройки репозитория. Защита обеспечивается разрешениями, правилами GitHub, CI, контролем зависимостей и управлением релизами.

## Обязательная настройка GitHub

На момент составления документа автоматизированный просмотр показал, что `main` имеет признак `protected: false`; опубликованных repository rulesets не обнаружено. **Правила ниже не активируются добавлением Markdown-файла:** их необходимо применить в настройках GitHub.

Откройте [Settings → Rules → Rulesets](https://github.com/kumofsoc/MathMaMath/settings/rules) и создайте активный ruleset для default branch `main`:

1. **Restrict deletions** и **Block force pushes**.
2. **Require a pull request before merging**, разрешая squash merge; прямой push в `main` ограничить.
3. **Require status checks to pass**: проверки успешных прогонов из [Actions](https://github.com/kumofsoc/MathMaMath/actions) (в том числе `build`, `CodeQL (JavaScript / TypeScript)` и `Review new dependencies` для PR); проверяйте уникальность имён job.
4. **Require conversation resolution**; при наличии независимых reviewers включите review approvals и dismiss stale approvals. Требование внешнего approval на единственном аккаунте может заблокировать все PR.
5. **Do not allow bypassing** применяйте, если предусмотрен безопасный путь восстановления доступа и настройки допускают его.

Проверьте результат повторным запросом `Branches` и реальным тестовым PR.

Подготовленные JSON-шаблоны и последовательность активации: [GitHub Rulesets и PR](../github-rulesets-and-prs.md).

## Другие настройки

- [Settings → Actions → General](https://github.com/kumofsoc/MathMaMath/settings/actions): минимальные workflow permissions (read-only по умолчанию), запрет опасных ненужных workflows и контроль approvals для PR из форков.
- [Security settings](https://github.com/kumofsoc/MathMaMath/settings/security_analysis): Dependency Graph, Dependabot alerts, CodeQL, secret scanning и push protection по доступности.
- [Settings → General](https://github.com/kumofsoc/MathMaMath/settings): `Automatically delete head branches` после merge; разрешить squash merge и настроить методы merge.
- Доступ к аккаунту: passkey/2FA, ограниченные fine-grained tokens, периодический пересмотр установленных GitHub Apps и collaborators. Не выдавайте `write` без необходимости.
- Секреты: только Actions Secrets/Environments; не добавлять в `VITE_*` закрытые ключи (они могут попасть в frontend bundle). Раздельные staging/production credentials, rotation после утечек.
- Публикация: CI плюс интеграционный release gate с реальным backend, релизы из `main`, фиксированные SHA/digest образов и actions, при возможности provenance и подписанные артефакты.
- Резервирование: независимый mirror/backup Git репозитория, экспорт Issues/Releases по необходимости, backup backend PostgreSQL/media отдельно, периодическое тестовое восстановление.

## Что это предотвращает и чего не предотвращает

- Произвольный PR **не изменяет код сайта без merge и deployment**.
- Форки остаются самостоятельными репозиториями; GitHub не позволяет блокировать копирование публично доступного кода.
- Правила защищают целостность основной ветки, но не заменяют проверку вредоносных зависимостей, токенов, автоматизации и backend.
- При компрометации аккаунта с админ-доступом требуется немедленный отзыв сессий/токенов и проверка истории действий.

## Очистка веток и истории

Для уборки используйте `scripts/cleanup-merged-branches.py`: сначала без аргументов (только план), после просмотра `--execute`. Скрипт удаляет только ветки, точно соответствующие последним коммитам уже **объединённых PR**, и не затрагивает `main`, `checkpoint/*`, Dependabot и открытые PR.

Коммиты в `main` не удаляются очисткой веток. Ошибочные изменения отменяются новым `git revert`, а не force push. История Git остаётся аудируемой.
