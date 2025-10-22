/// <reference types="node" />

/**
 * Minimal HTTP server + exported helpers
 *
 * - No external dependencies (uses Node built-ins)
 * - Endpoints:
 *   - GET  /api/health   -> { status: 'ok' }
 *   - GET  /api/version  -> { version: 'x.y.z' } (reads version.txt or package.json)
 *   - GET  /api/info     -> { name, version, uptime }
 *   - GET  /docs/*       -> serves static files from ./public (fallback to public/docs.html)
 *
 * Usage:
 *   import { startServer, stopServer } from './server'
 *   const srv = await startServer(3000)
 *   await stopServer(srv)
 *
 * When executed directly (node dist/server.js or ts-node src/server.ts) it starts on port 3000.
 */

import http, { IncomingMessage, Server, ServerResponse } from "http";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { URL } from "url";

type ServerInstance = Server;

const DEFAULT_PORT = 3000;
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const VERSION_FILE = path.resolve(process.cwd(), "version.txt");
const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");

/** simple logger helper */
function log(...args: unknown[]) {
  // keep logs short and usable in CI/dev
  // prefix with timestamp
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(ts, ...args);
}

/** Read version from version.txt or fallback to package.json -> version */
let cachedVersion: string | null = null;
async function readVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  try {
    const content = await fsp.readFile(VERSION_FILE, "utf8");
    cachedVersion = content.trim();
    if (cachedVersion) return cachedVersion;
  } catch {
    // ignore and fallback
  }

  try {
    const pj = await fsp.readFile(PACKAGE_JSON, "utf8");
    const parsed = JSON.parse(pj) as { version?: string };
    cachedVersion = parsed.version ?? "0.0.0";
    return cachedVersion;
  } catch {
    cachedVersion = "0.0.0";
    return cachedVersion;
  }
}

/** simple content type map */
function contentTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

/** Serve a static file from the public directory safely (prevents path traversal) */
async function tryServeStatic(
  reqUrl: string,
  res: ServerResponse
): Promise<boolean> {
  // map /docs -> /docs/index.html or /docs or /docs/ -> docs.html fallback
  // Normalize and decode
  let pathname = reqUrl;
  // if URL contains query string, strip it (we expect reqUrl to be pathname only when passed)
  try {
    pathname = new URL(reqUrl, "http://localhost").pathname;
  } catch {
    // fallback to raw
  }

  // map /docs to /docs.html (simple fallback)
  if (pathname === "/docs" || pathname === "/docs/") {
    pathname = "/docs.html";
  }

  // allow serving /docs/* and files in public root
  const rel = pathname.replace(/^\/+/, ""); // remove leading slash
  const targetPath = path.resolve(PUBLIC_DIR, rel || "docs.html");

  // security: ensure targetPath is inside PUBLIC_DIR
  if (!targetPath.startsWith(PUBLIC_DIR)) {
    return false;
  }

  try {
    const stat = await fsp.stat(targetPath);
    if (stat.isDirectory()) {
      // try index.html inside directory
      const indexPath = path.join(targetPath, "index.html");
      const idxStat = await fsp.stat(indexPath).catch(() => null);
      if (idxStat && idxStat.isFile()) {
        await streamFile(indexPath, res);
        return true;
      }
      return false;
    } else if (stat.isFile()) {
      await streamFile(targetPath, res);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function streamFile(filePath: string, res: ServerResponse) {
  return new Promise<void>((resolve, reject) => {
    const ext = path.extname(filePath);
    const ct = contentTypeFromExt(ext);
    res.statusCode = 200;
    res.setHeader("Content-Type", ct);
    const stream = fs.createReadStream(filePath);
    stream.on("open", () => {
      stream.pipe(res);
    });
    stream.on("error", (err: unknown) => {
      // if stream error, respond 500
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Internal Server Error");
      } else {
        res.end();
      }
      // cast to Error for reject where needed
      reject(err as Error);
    });
    stream.on("end", () => resolve());
    res.on("close", () => {
      stream.destroy();
      resolve();
    });
  });
}

/** JSON helper */
function respondJson(res: ServerResponse, obj: unknown, status = 200) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body).toString());
  res.end(body);
}

/** Basic router/handler */
async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  // simple CORS for local dev/testing
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`
  );
  const pathname = parsedUrl.pathname;

  // Simple file-backed data helpers scoped to the request handler.
  const DATA_DIR = path.resolve(process.cwd(), "data");
  async function readData<T = any>(name: string): Promise<T | null> {
    try {
      const p = path.join(DATA_DIR, name);
      const txt = await fsp.readFile(p, "utf8");
      return JSON.parse(txt) as T;
    } catch {
      return null;
    }
  }

  async function writeData(name: string, obj: unknown) {
    try {
      await fsp.mkdir(DATA_DIR, { recursive: true });
      const p = path.join(DATA_DIR, name);
      await fsp.writeFile(p, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      throw err;
    }
  }

  async function readJsonBody(): Promise<any> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (ch: Buffer) => chunks.push(ch));
      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8").trim();
        if (!raw) return resolve(null);
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error("invalid_json"));
        }
      });
      req.on("error", (err) => reject(err));
    });
  }

  // pick a random item
  function pickRandom<T>(arr: T[]) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  try {
    // Basic status/info endpoints
    if (pathname === "/api/health" && req.method === "GET") {
      respondJson(res, { status: "ok" });
      return;
    }

    if (pathname === "/api/version" && req.method === "GET") {
      const version = await readVersion();
      respondJson(res, { version });
      return;
    }

    if (pathname === "/api/info" && req.method === "GET") {
      const version = await readVersion();
      // try to get name from package.json
      let name = "app";
      try {
        const pj = await fsp.readFile(PACKAGE_JSON, "utf8");
        const parsed = JSON.parse(pj) as { name?: string };
        name = parsed.name ?? name;
      } catch {
        // ignore
      }
      const uptime = process.uptime();
      respondJson(res, { name, version, uptimeSeconds: Math.floor(uptime) });
      return;
    }

    // New API endpoints (file-backed)
    // GET /api/items?limit=20&offset=0&lang=ru&sort=top
    if (pathname === "/api/items" && req.method === "GET") {
      const qp = parsedUrl.searchParams;
      const limit = Math.min(Number(qp.get("limit") ?? 20), 100);
      const offset = Math.max(Number(qp.get("offset") ?? 0), 0);
      const lang = qp.get("lang") || undefined;
      const sort = qp.get("sort") || "new";

      const items = (await readData<any[]>("items.json")) ?? [];
      let filtered = items;
      if (lang) filtered = filtered.filter((i) => i.lang === lang);
      if (sort === "top") {
        filtered = filtered.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      } else {
        filtered = filtered.sort(
          (a, b) =>
            (b.publishedAt ? Date.parse(b.publishedAt) : 0) -
            (a.publishedAt ? Date.parse(a.publishedAt) : 0)
        );
      }
      const slice = filtered.slice(offset, offset + limit);
      respondJson(res, { total: filtered.length, items: slice });
      return;
    }

    // GET /api/items/:id
    if (pathname.startsWith("/api/items/") && req.method === "GET") {
      const id = pathname.replace("/api/items/", "");
      const items = (await readData<any[]>("items.json")) ?? [];
      const it = items.find((x) => String(x.id) === id);
      if (!it) {
        respondJson(res, { error: "not_found" }, 404);
        return;
      }
      respondJson(res, { item: it });
      return;
    }

    // GET /api/random
    if (pathname === "/api/random" && req.method === "GET") {
      const items = (await readData<any[]>("items.json")) ?? [];
      const pick = pickRandom(items);
      if (!pick) {
        respondJson(res, { error: "no_items" }, 404);
        return;
      }
      respondJson(res, { item: pick });
      return;
    }

    // POST /api/ratings
    // body: { itemId, value: 1|-1, userId? }
    if (pathname === "/api/ratings" && req.method === "POST") {
      let body: any;
      try {
        body = await readJsonBody();
      } catch (e) {
        respondJson(res, { error: "invalid_json" }, 400);
        return;
      }
      if (!body || !body.itemId || (body.value !== 1 && body.value !== -1)) {
        respondJson(res, { error: "invalid_payload" }, 400);
        return;
      }

      // load data
      const [items, ratings] = await Promise.all([
        readData<any[]>("items.json").then((v) => v ?? []),
        readData<any[]>("ratings.json").then((v) => v ?? []),
      ]);

      const item = items.find((x) => String(x.id) === String(body.itemId));
      if (!item) {
        respondJson(res, { error: "item_not_found" }, 404);
        return;
      }

      // append rating
      const newRating = {
        id: `rating_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: body.userId ?? null,
        itemId: item.id,
        value: body.value,
        createdAt: new Date().toISOString(),
      };
      ratings.push(newRating);

      // recompute score for item
      let itemScore = (item.score ?? 0) + body.value;
      item.score = itemScore;

      // persist both files (best-effort)
      try {
        await writeData("ratings.json", ratings);
        await writeData("items.json", items);
      } catch (err) {
        log("failed to persist rating", err);
        // still continue, but warn client
        respondJson(res, { error: "persist_failed" }, 500);
        return;
      }

      // Determine next item to show based on simple similarity: share any tag -> similar
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const similar = items.find(
        (it) =>
          it.id !== item.id &&
          Array.isArray(it.tags) &&
          it.tags.some((t: string) => tags.includes(t))
      );
      const notSimilar = items.find(
        (it) =>
          it.id !== item.id &&
          Array.isArray(it.tags) &&
          !it.tags.some((t: string) => tags.includes(t))
      );
      const nextItem =
        body.value === 1
          ? similar ?? pickRandom(items)
          : notSimilar ?? pickRandom(items);

      respondJson(res, {
        rating: newRating,
        item: { id: item.id, score: item.score },
        nextItem,
      });
      return;
    }

    // GET /api/leaderboard?limit=10&lang=ru
    if (pathname === "/api/leaderboard" && req.method === "GET") {
      const qp = parsedUrl.searchParams;
      const limit = Math.min(Number(qp.get("limit") ?? 10), 100);
      const lang = qp.get("lang") || undefined;
      const items = (await readData<any[]>("items.json")) ?? [];
      let list = items.slice();
      if (lang) list = list.filter((i) => i.lang === lang);
      list = list
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, limit);
      respondJson(res, { items: list });
      return;
    }

    // static files under /docs
    if (
      pathname.startsWith("/docs") ||
      pathname === "/" ||
      pathname === "/index.html"
    ) {
      const served = await tryServeStatic(pathname, res);
      if (served) return;
      // fallback to basic index payload if public/docs.html missing
      if (!res.headersSent) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          `<html><head><meta charset="utf-8"><title>Docs</title></head><body><h1>Docs</h1><p>Create <code>public/docs.html</code> to customize this page.</p></body></html>`
        );
        return;
      }
    }

    // not found
    respondJson(res, { error: "not_found" }, 404);
  } catch (err: unknown) {
    log("request-handler-error", err);
    if (!res.headersSent) {
      respondJson(res, { error: "internal_error" }, 500);
    } else {
      try {
        res.end();
      } catch {
        // noop
      }
    }
  }
}

/** Create an HTTP server instance (does not start listening) */
export function createServer(): ServerInstance {
  const srv = http.createServer(requestHandler);
  // optional: capture basic errors
  srv.on("error", (err: unknown) => {
    log("server error", err);
  });
  return srv;
}

/** Start server and return the Server instance once listening */
export function startServer(port = DEFAULT_PORT): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(port, () => {
      log(`Server listening on http://localhost:${port}`);
      resolve(srv);
    });
    srv.on("error", (err: unknown) => {
      reject(err as Error);
    });
  });
}

/** Stop server (graceful) */
export function stopServer(srv: ServerInstance): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      srv.close((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    } catch (err: unknown) {
      reject(err as Error);
    }
  });
}

/** convenience: get info object */
export async function getInfo() {
  const version = await readVersion();
  let name = "app";
  try {
    const pj = await fsp.readFile(PACKAGE_JSON, "utf8");
    const parsed = JSON.parse(pj) as { name?: string };
    name = parsed.name ?? name;
  } catch {
    // ignore
  }
  return { name, version, uptimeSeconds: Math.floor(process.uptime()) };
}

/** If executed directly, start the server on default port */
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const portEnv = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;
    const port =
      Number.isFinite(portEnv) && portEnv > 0 ? portEnv : DEFAULT_PORT;
    try {
      const srv = await startServer(port);
      // graceful shutdown
      const shutdown = async () => {
        log("Shutting down server...");
        await stopServer(srv);
        log("Server stopped");
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    } catch (err: unknown) {
      log("Failed to start server", err);
      process.exit(1);
    }
  })();
}
