# TOPPER.top — Version 0.0.1

Welcome — this is the beginner-friendly backend scaffold for TOPPER.top (Universal Rating Platform).

I created a minimal Node + TypeScript server with simple demo endpoints, linting/formatting, tests, a seed script and a dev Docker setup so you can get started quickly.

If you're new to this — read the sections below step by step. If anything is unclear, tell me the line number or the section name and I will explain it more slowly.

---

## What is included

- Minimal plain-Node server (`src/api/server.ts`) with endpoints:
  - `GET /api/health` — health check
  - `GET /api/version` — reads `version.txt`
  - `GET /api/info` — simple info JSON (name, version, uptime)
  - Static demo page at `/docs` served from `public/`
- Simple logger wrapper (`src/utils/logger.ts`)
- Demo data and seed script (`data/*.json`, `scripts/seed.ts`)
- Dev tooling: TypeScript, ESLint, Prettier, Vitest, Husky + lint-staged
- CI workflow template (`.github/workflows/ci.yml`) — lint, format check, build, test, audit
- Dev Docker: `docker/Dockerfile.dev` and `docker/docker-compose.yml`
- Project documentation in the `meta/` directory

---

## Current Development Version: 0.0.1

> **Note**: We are currently working on version 0.0.1. Only Oleg Zai specifies which version we're developing. This version serves as the initial development milestone.

---

## Prerequisites (what you need on your computer)

- Node.js (LTS) — the project expects Node `>=18`.
- Git
- A terminal / command line
  If you're missing any of these, let me know which one and I will help you install it.

---

## Quick start — run locally (no Docker)

1. Install dependencies:

```topper.top/README.md#L201-204
npm install
```

2. Seed demo data (creates sample files in `data/`):

```topper.top/README.md#L205-207
npm run seed
```

3. Start the dev server (hot reload enabled):

```topper.top/README.md#L208-210
npm run dev
```

4. Open these in your browser:

- Health: `http://localhost:3000/api/health`
- Version: `http://localhost:3000/api/version`
- Info: `http://localhost:3000/api/info`
- Docs page: `http://localhost:3000/docs`

---

## Useful npm scripts (what each does)

- `npm run dev` — run the server with hot reload (restarts automatically on changes).
- `npm run build` — compile TypeScript to JavaScript into `dist/`.
- `npm run start` — run compiled code from `dist/`.
- `npm run lint` — run ESLint and auto-fix some problems.
- `npm run format` — run Prettier to format files.
- `npm run test` — run unit tests with Vitest.
- `npm run seed` — generate demo JSON data in `data/`.
- `npm run clean` — remove `dist/`.
- `npm run prepare` — (used by git hooks / husky).

Example — run lint and tests:

```topper.top/README.md#L211-215
npm run lint
npm run test
```

---

## Docker (development)

A development Docker setup is included so you can run the app in a container. This is optional but useful if you want the same environment across machines.

Build & run with docker-compose (from the `docker/` folder):

```topper.top/README.md#L216-220
# from repo root
docker compose -f docker/docker-compose.yml up --build
```

This maps the project into the container so code changes on your machine are visible without rebuilding the image.

Note: production Docker image setup is deferred — this Docker setup is for local development.

---

## Testing

A simple example test using Vitest is included (`tests/health.test.ts`). It expects the dev server to be running on port 3000 for the HTTP check.
Run tests:

```topper.top/README.md#L221-223
npm test
```

If you want to run tests in isolation (without requiring the server to run manually), we can add a test helper later — tell me and I'll include it.

---

## Linting and formatting (why this is useful)

- ESLint helps find code issues or dangerous patterns (it checks your code).
- Prettier formats code consistently (it fixes spaces, commas, line breaks).
- Husky + lint-staged run formatting and lint fixes before each commit so the repository stays clean.

Run them locally:

```topper.top/README.md#L224-227
npm run lint
npm run format
```

---

## CI (GitHub Actions)

The repo includes a basic CI workflow `.github/workflows/ci.yml`. On pull requests and pushes to `main` it:

1. Installs dependencies
2. Runs ESLint
3. Runs Prettier check
4. Builds TypeScript
5. Runs tests
6. Runs `npm audit` (to surface known vulnerabilities)

This helps keep the repository healthy and prevents merging code that breaks tests or style rules.

---

## Secrets and configuration

For local development, use a `.env` file (this file is ignored by Git). Do NOT commit secrets or API keys.

If we add CI steps that need keys (e.g., Sentry DSN or Docker registry credentials), we'll store them in GitHub Actions Secrets — I will document which secret names to add in the PR description when I open it.

---

## Data and seed

Demo data lives in `data/` and is created by `npm run seed`. Seed content includes:

- `users.json`
- `ratings.json`
- `items.json`
- `settings.json`

These are small JSON files to let you run and test the app without a database. Later, we can replace them with a real DB (Postgres/SQLite) and migration tooling.

---

## What I will create in the repository (so you know what to expect)

- `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.editorconfig`
- `src/server.ts`, `src/logger.ts`
- `scripts/seed.ts` and `data/*.json` sample files
- `public/docs.html` demo page
- `tests/` with a simple Vitest example
- `docker/` dev Dockerfile + `docker-compose.yml`
- `.github/workflows/ci.yml`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`

---

## Version Development Control

> **Development Version**: We are currently developing version 0.0.1
> **Version Control**: Only Oleg Zai specifies which version we're developing
> **Release Authority**: Only Oleg Zai determines when a version is complete and can be released

---

## Next steps (what I can do for you)

- Create branch `setup/initial` with the scaffold and open a PR — I can do that now.
- Or, I can show you any generated file (for example `package.json` or `src/server.ts`) and explain it line by line before committing.
- Or, we can adjust any configuration (for example: turn off `npm audit` in CI or enable Snyk integration).

If you're ready for me to commit the scaffold and open the PR, reply: `yes, create branch` or simply `create branch`.
If you'd rather inspect files first, reply: `show package.json` or `show server.ts` and I'll show and explain them.
