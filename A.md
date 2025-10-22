# A — Answers for TOPPER.top (consolidated and updated)

Ниже — все подтверждённые ответы для scaffold проекта, включая обновления из `Q.md`. Я сгруппировал ответы и добавил краткие пояснения там, где вы задавали вопросы.

## Общие
- Проект: `TOPPER.top`
- Краткое описание (one-line): Universal Rating Platform
- Целевая аудитория: от детей до взрослых
- Репозиторий: публичный

## Лицензия
- Лицензия: `MIT` (подтверждено)

## Технологический стек
- Язык / среда выполнения: `Node.js + TypeScript`
- Node: указать в `package.json` `engines: { "node": ">=18" }` (подтверждено)
- Пакетный менеджер: `npm`
- Подход к зависимостям: минимум внешних зависимостей, `plain node` + минимальный роутер (подтверждено)

## Репо / структура (подтверждено)
- Формат репозитория: split repo — backend и frontend в разных репо (подтверждено)
- Базовая структура (backend):
  - `src/` — исходники
  - `public/` — статика (включая `docs.html`)
  - `tests/` — тесты
  - `scripts/` — утилиты (например seed, start)
  - `docs/` — документация
  - `data/` — json-базы (подтверждено)
  - `version.txt` — файл версии
  - опционально: `bin/`, `examples/` (по запросу)

## Endpoints / demo (подтверждено)
- `GET /api/version` — читает `version.txt`
- `GET /api/health`
- `GET /api/info` — простая инфа: name, version, description, uptime
- Статическая страница `/docs` в `public/docs.html`

## Хранение данных (подтверждено)
- Начальный подход: json текстовые базы в `data/` (файловая storage)
- Seed-скрипты: да — `scripts/seed.ts` создаст demo-данные (подтверждено)
- Seed-сущности: `users`, `ratings`, `content`, `settings` (подтверждено)

## Секреты и безопасность (подтверждено)
- Секреты/конфиги: GitHub Actions Secrets для CI; локально — `.env`
- Security audit: вы спросили "а что это такое?" — пояснение: `npm audit` (встроенный), Snyk (внешний сервис). Рекомендация: включить `npm audit` в CI сейчас (опция Snyk позже).

## Авторизация (подтверждено)
- OAuth: откладываем на позже
- Сейчас: minimal session scaffold (cookie + in-memory) — подтверждённо добавить

## PWA / фронтенд (подтверждено)
- PWA: минимальная конфигурация (manifest + service worker) — будет в frontend репо
- В backend repo: добавить статический `public/docs.html` и minimal endpoints

## Документы / onboarding (подтверждено)
- Создать шаблонные файлы:
  - `README.md` (установка, локальный запуск, Docker, добавление secrets)
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `CHANGELOG.md` (шаблон; changelog можно генерировать автоматически)

## Code quality, dev tools и CI (подтверждено)
- ESLint + Prettier + EditorConfig — включаем (`eslint:recommended` + Prettier)
- `@types/*` policy: `auto` — добавлять по необходимости / автоматически для популярных пакетов
- NPM-скрипты (стандартный набор): `build`, `start`, `dev`, `lint`, `test`, `format`, `clean`, `prepare` (подтверждено)
- Hot-reload: `ts-node-dev` для `npm run dev` (подтверждено)
- Тестовый рантайм: `Vitest` (подтверждено)
- Примерные unit-тесты: добавить тесты для `/api/health` и `/api/version` (подтверждено)
- CI (GitHub Actions): workflow на `pull_request` и `push to main` с шагами:
  - checkout, setup-node, install, lint, `prettier --check`, build (tsc), test
  - `npm audit` опционально (рекомендуется)
- Pre-commit hooks: `husky` + `lint-staged` (prettier --write + eslint --fix) (подтверждено)
- Commit convention: `Conventional Commits` (подтверждено) — используется для auto changelog
- Releases: автоматически создавать GitHub Release при теге (подтверждено)
- Публикация в npm/docker: откладывается (позже)

## Логирование и мониторинг
- Logger: `console` wrapper в `src/logger.ts` для MVP (пользователь спрашивал про разницу — `console` проще, `pino` лучше для production) (подтверждено)
- APM / Sentry / Datadog / Prometheus: объяснение добавлено; интеграции откладываем на позже (подтверждено)

## Branch protection / templates / governance
- Issue / PR templates: создать базовые шаблоны (bug, feature, PR checklist) (подтверждено)
- CODEOWNERS: пока нет (по запросу)
- Branch protection: вы спросили «что это?» — пояснение было дано; рекомендую включить require passing CI и require at least 1 reviewer (по желанию включу при создании репо)

## TypeScript / Runtime settings (подтверждено)
- `tsconfig.json`:
  - `"strict": true` (выбранно)
  - `target`: `ES2022` (рекомендация принята)
- `package.json`:
  - `engines.node`: `>=18` (подтверждено)

## Дополнительное
- OpenAPI/Swagger: откладываем на позже (подтверждено)
- i18n: откладываем на позже (подтверждено)
- GDPR / PII: вы задали вопрос "Что это такое?" — пояснение добавлено; никаких специальных требований пока не заявлено (если начнётся сбор PII, потребуется добавить политику)
- План перехода с json → реляционная БД: возможно в будущем (подтверждено как возможный план)

## Финальное подтверждение
- Вы отметили `Answer: auto` — значит применять рекомендованные настройки и генерировать scaffold (я начну работу по созданию ветки `setup/initial` и scaffold, если вы подтвердите ещё раз или напишете `начинай`/`да`).

---

Если нужно внести правку в любой из подтверждённых пунктов (например: выбрать Render вместо Heroku, изменить список seed-сущностей или включить Snyk), скажите, и я обновлю план перед созданием ветки.
