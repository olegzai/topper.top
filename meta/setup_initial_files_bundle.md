topper.top/setup_initial_files_bundle.md#L1-400

# TOPPER.top — initial scaffold files bundle

This document contains the initial scaffold files for the TOPPER.top project. Each file below is shown with its intended path and full content. Copy each block into the corresponding file in the repository to initialize the project.

Important: These are minimal, sensible starter files for a Node + TypeScript plain-node backend, with dev conveniences (ESLint, Prettier, Vitest, simple CI, dev Docker). They are written for a beginner; where appropriate, there are comments and simple instructions.

---

```topper.top/package.json#L1-200
{
  "name": "topper.top-backend",
  "version": "0.1.0",
  "description": "Backend for TOPPER.top — Universal Rating Platform (MVP skeleton)",
  "main": "dist/server.js",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "lint": "eslint \"src/**/*.{ts,js}\" --fix",
    "format": "prettier --write \"**/*.{ts,js,json,md}\"",
    "test": "vitest",
    "seed": "ts-node scripts/seed.ts",
    "clean": "rm -rf dist",
    "prepare": "husky install"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^2.0.0",
    "ts-node": "^10.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.30.0"
  }
}
```

---

```topper.top/tsconfig.json#L1-200
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "scripts/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

```topper.top/.gitignore#L1-200
# Node
node_modules/
dist/
.env
.env.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store

# IDEs
.vscode/
.idea/

# Misc
coverage/
```

---

```topper.top/README.md#L1-400
# TOPPER.top — backend (MVP scaffold)

This repository contains the backend scaffold for TOPPER.top (Universal Rating Platform). It is a minimal Node + TypeScript project intended to be a learning-friendly starting point.

## Quick start (local, without Docker)

1. Install dependencies:
```

npm install

```

2. Seed demo data:
```

npm run seed

```

3. Start dev server (hot reload):
```

npm run dev

```

4. Open in browser:
- Health: http://localhost:3000/api/health
- Version: http://localhost:3000/api/version
- Info: http://localhost:3000/api/info
- Docs page: http://localhost:3000/docs

## Scripts

- `npm run dev` — run development server with hot reload.
- `npm run build` — compile TypeScript to `dist/`.
- `npm run start` — run compiled server (`node dist/server.js`).
- `npm run lint` — run ESLint and auto-fix issues.
- `npm run format` — run Prettier to format project files.
- `npm run test` — run Vitest tests.
- `npm run seed` — generate demo JSON data (in `data/`).

## Docker (dev)

A dev Dockerfile and docker-compose are included under `docker/`. They are configured for local development and mount the project files into the container.

## CI

A simple GitHub Actions workflow is included at `.github/workflows/ci.yml` with steps: install, lint, prettier check, build, test, audit.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## License

MIT — see `LICENSE`.

```

---

```topper.top/LICENSE#L1-200
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
(Full MIT text should be included here; replace ... with the standard MIT terms)
```

---

```topper.top/version.txt#L1-10
0.1.0
```

---

```topper.top/src/server.ts#L1-300
/**
 * Minimal plain-Node TypeScript HTTP server.
 * - GET /api/health  -> simple { status: 'ok' }
 * - GET /api/version -> reads version.txt
 * - GET /api/info    -> basic JSON with name, version, uptime
 * - Serves static files from `public/` (docs page)
 *
 * This code purposely avoids frameworks to keep dependencies minimal for learning.
 */

import http, { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { info as logInfo, error as logError } from "./logger";

const PORT = Number(process.env.PORT) || 3000;
const BASE_DIR = path.resolve(process.cwd());
const PUBLIC_DIR = path.join(BASE_DIR, "public");

async function sendJson(res: ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function serveStatic(res: ServerResponse, filePath: string) {
  try {
    const data = await readFile(filePath);
    // Simple content-type guess
    const contentType = filePath.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || "/";
  logInfo("incoming", url);

  if (url === "/api/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (url === "/api/version") {
    try {
      const v = await readFile(path.join(BASE_DIR, "version.txt"), "utf-8");
      return sendJson(res, 200, { version: v.trim() });
    } catch (err) {
      logError("version read error", err);
      return sendJson(res, 500, { error: "could not read version" });
    }
  }

  if (url === "/api/info") {
    const v = (await readFile(path.join(BASE_DIR, "version.txt"), "utf-8")).trim();
    return sendJson(res, 200, {
      name: "TOPPER.top Backend",
      version: v,
      description: "Universal Rating Platform (MVP backend)",
      uptime: process.uptime()
    });
  }

  // serve static /docs and files under public/
  if (url === "/docs" || url.startsWith("/docs/") || url === "/") {
    const filePath = url === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, url.replace(/^\/+/,""));
    return serveStatic(res, filePath);
  }

  // fallback 404
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "not found" }));
}

const server = http.createServer(handler);

server.listen(PORT, () => {
  logInfo(`Server listening on http://localhost:${PORT}`);
});
```

---

```topper.top/src/logger.ts#L1-200
/**
 * Lightweight logger wrapper using console.
 * Keeps the interface simple so you can later replace implementation with pino/winston easily.
 */

export function info(...args: unknown[]) {
  console.log("[INFO]", ...args);
}

export function error(...args: unknown[]) {
  console.error("[ERROR]", ...args);
}

export function debug(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEBUG]", ...args);
  }
}
```

---

```topper.top/data/users.json#L1-200
[
  {
    "id": 1,
    "username": "alice",
    "displayName": "Alice Example"
  },
  {
    "id": 2,
    "username": "bob",
    "displayName": "Bob Example"
  }
]
```

---

```topper.top/data/ratings.json#L1-200
[
  {
    "id": 1,
    "userId": 1,
    "itemId": "content-1",
    "score": 5,
    "comment": "Very helpful"
  },
  {
    "id": 2,
    "userId": 2,
    "itemId": "content-1",
    "score": 4,
    "comment": "Good"
  }
]
```

---

```topper.top/data/content.json#L1-200
[
  {
    "id": "content-1",
    "title": "Example Content",
    "description": "Short example description"
  }
]
```

---

```topper.top/data/settings.json#L1-200
{
  "siteName": "TOPPER.top",
  "allowRegistration": false
}
```

---

```topper.top/scripts/seed.ts#L1-200
/**
 * Simple seed script that writes the example data files into `data/`.
 *
 * Run with: `npm run seed` (uses ts-node)
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "data");

async function write(name: string, content: string) {
  const file = `${dataDir}/${name}`;
  await writeFile(file, content, "utf-8");
  console.log("Wrote", file);
}

async function main() {
  await write("users.json", `[
  {
    "id": 1,
    "username": "alice",
    "displayName": "Alice Example"
  },
  {
    "id": 2,
    "username": "bob",
    "displayName": "Bob Example"
  }
]`);
  await write("ratings.json", `[
  {
    "id": 1,
    "userId": 1,
    "itemId": "content-1",
    "score": 5,
    "comment": "Very helpful"
  }
]`);
  await write("content.json", `[
  {
    "id": "content-1",
    "title": "Example Content",
    "description": "Short example description"
  }
]`);
  await write("settings.json", `{
  "siteName": "TOPPER.top",
  "allowRegistration": false
}`);
  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error("Seed error", err);
  process.exit(1);
});
```

---

```topper.top/public/docs.html#L1-400
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>TOPPER.top — API Docs (demo)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, Roboto, "Segoe UI", Arial; padding: 2rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>TOPPER.top — Backend demo docs</h1>
  <p>Demo endpoints:</p>
  <ul>
    <li><strong>GET /api/health</strong> — returns {"{status}": "ok"}</li>
    <li><strong>GET /api/version</strong> — returns version from <code>version.txt</code></li>
    <li><strong>GET /api/info</strong> — returns basic info: name, version, description, uptime</li>
  </ul>
  <p>Static files are served from <code>public/</code>. This page is a small demo.</p>
</body>
</html>
```

---

```topper.top/.eslintrc.json#L1-200
{
  "env": {
    "node": true,
    "es2022": true,
    "vitest": true
  },
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off"
  }
}
```

---

```topper.top/.prettierrc#L1-50
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

---

```topper.top/.editorconfig#L1-40
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

---

```topper.top/vitest.config.ts#L1-200
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
});
```

---

```topper.top/tests/health.test.ts#L1-200
import { describe, it, expect } from "vitest";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

describe("health endpoint", () => {
  it("responds with status ok", async () => {
    // For simplicity we import the server source directly in dev mode would be preferred.
    // Here we test the handler by performing a simple HTTP request to the running server.
    // NOTE: This test assumes the dev server is running on port 3000.
    const res = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
      http.get("http://localhost:3000/api/health", (r) => {
        let data = '';
        r.on('data', (chunk) => (data += chunk));
        r.on('end', () => resolve({ statusCode: r.statusCode || 0, body: data }));
      }).on('error', reject);
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).status).toBe("ok");
  });
});
```

---

```topper.top/.github/workflows/ci.yml#L1-300
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Format check
        run: npm run format -- --check || true
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
      - name: NPM audit
        run: npm audit --audit-level=moderate || true
```

---

```topper.top/docker/Dockerfile.dev#L1-200
# Dev Dockerfile for TOPPER.top backend
FROM node:18-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Default command for development; uses ts-node-dev for hot reload
CMD ["npm", "run", "dev"]
```

---

```topper.top/docker/docker-compose.yml#L1-200
version: '3.8'
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ..:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

---

```topper.top/.huskyrc#L1-200
{
  "hooks": {
    "pre-commit": "npx lint-staged"
  }
}
```

---

```topper.top/lint-staged.config.js#L1-200
module.exports = {
  '**/*.{ts,js}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md}': ['prettier --write']
};
```

---

```topper.top/CONTRIBUTING.md#L1-200
# Contributing

Thank you for contributing! For now, please follow these simple steps:

1. Fork the repository.
2. Create a branch: `feature/your-feature` or `fix/your-fix`.
3. Make changes and run tests: `npm test`.
4. Lint & format: `npm run lint && npm run format`.
5. Push and open a Pull Request.

We use Conventional Commits for changelog automation. Example commit message:
```

feat(auth): add session scaffold

```

```

---

```topper.top/CODE_OF_CONDUCT.md#L1-200
# Code of Conduct

Be respectful and helpful. Treat others as you'd like to be treated. Report any unacceptable behavior to repository maintainers.
```

---

```topper.top/CHANGELOG.md#L1-200
# Changelog

All notable changes to this project will be documented here.

## [Unreleased]
- Initial scaffold
```

---

```topper.top/README_example_usage.md#L1-200
# Example usage notes (for beginners)

- Start dev server:
  - `npm install`
  - `npm run seed`
  - `npm run dev`

- Visit:
  - `http://localhost:3000/api/health`
  - `http://localhost:3000/api/version`
  - `http://localhost:3000/info`
  - `http://localhost:3000/docs`
```

---

End of bundle. After you copy these files into your project, run `npm install` and then `npm run dev` to start the server. If you want, I can now generate the actual files in a branch called `setup/initial` (create Git commits, or provide a patch). Say `create branch` or `continue` and I will proceed with exact next steps.
