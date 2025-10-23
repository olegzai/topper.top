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

import { IncomingMessage, Server, ServerResponse } from 'http';
import * as http from 'http';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { ratingLimiter, apiLimiter } from '../utils/rate-limiter';

type ServerInstance = Server;

interface Item {
  content_id: string;
  content_canonical_text_en: string;
  content_text_en: string;
  content_text_ro: string;
  content_text_ua: string;
  content_text_ru: string;
  content_source_name_en: string;
  content_source_name_ro: string;
  content_source_name_ua: string;
  content_source_name_ru: string;
  content_source_link: string;
  content_country?: string;
  content_created_by?: string | null;
  content_created: string;
  content_published: string;
  content_edited?: string;
  content_type: string;
  content_category: string;
  content_subcategory?: string;
  content_tags: string[];
  content_votes: number;
  content_score: number;
  categories?: string[];
  lang: string;
  // Properties added dynamically by the API
  [key: string]: unknown;
}

interface Rating {
  id: string;
  userId: string | null;
  itemId: string;
  value: 1 | -1;
  createdAt: string;
}

const DEFAULT_PORT = 3000;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const VERSION_FILE = path.resolve(process.cwd(), 'version.txt');
const PACKAGE_JSON = path.resolve(process.cwd(), 'package.json');

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
  if (cachedVersion) return cachedVersion!;
  try {
    const content = await fsp.readFile(VERSION_FILE, 'utf8');
    const trimmedContent = content.trim();
    if (trimmedContent) {
      cachedVersion = trimmedContent;
      return cachedVersion!;
    }
  } catch {
    // ignore and fallback
  }

  try {
    const pj = await fsp.readFile(PACKAGE_JSON, 'utf8');
    const parsed = JSON.parse(pj);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      typeof parsed.version === 'string'
    ) {
      cachedVersion = parsed.version;
    } else {
      cachedVersion = '0.0.0';
    }
    return cachedVersion!;
  } catch {
    cachedVersion = '0.0.0';
    return cachedVersion!;
  }
}

/** simple content type map */
function contentTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
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
    pathname = new URL(reqUrl, 'http://localhost').pathname;
  } catch {
    // fallback to raw
  }

  // map /docs to /docs.html (simple fallback)
  if (pathname === '/docs' || pathname === '/docs/') {
    pathname = '/docs.html';
  }

  // allow serving /docs/* and files in public root
  const rel = pathname.replace(/^\/+/, ''); // remove leading slash
  const targetPath = path.resolve(PUBLIC_DIR, rel || 'index.html');

  // security: ensure targetPath is inside PUBLIC_DIR
  if (!targetPath.startsWith(PUBLIC_DIR)) {
    return false;
  }

  try {
    const stat = await fsp.stat(targetPath);
    if (stat.isDirectory()) {
      // try index.html inside directory
      const indexPath = path.join(targetPath, 'index.html');
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

/** Convert unknown error to Error object */
function toError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  const error = new Error(typeof err === 'string' ? err : 'Unknown error');
  delete error.stack; // Remove stack to avoid confusion
  return error;
}

function streamFile(filePath: string, res: ServerResponse) {
  return new Promise<void>((resolve, reject) => {
    const ext = path.extname(filePath);
    const ct = contentTypeFromExt(ext);
    res.statusCode = 200;
    res.setHeader('Content-Type', ct);
    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      stream.pipe(res);
    });
    stream.on('error', (err: unknown) => {
      // if stream error, respond 500
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Internal Server Error');
      } else {
        res.end();
      }
      reject(toError(err));
    });
    stream.on('end', () => resolve());
    res.on('close', () => {
      stream.destroy();
      resolve();
    });
  });
}

/** JSON helper */
function respondJson(res: ServerResponse, obj: unknown, status = 200) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(body).toString());
  res.end(body);
}

/** Basic router/handler */
async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  // CORS headers - in production, specify exact origin instead of '*'
  const origin = req.headers.origin;
  if (
    origin &&
    (origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      process.env.NODE_ENV === 'production')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001'); // Default for development
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const urlPath = req.url || '/';
  const host = req.headers.host || 'localhost';
  const parsedUrl = new URL(urlPath, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // Simple file-backed data helpers scoped to the request handler.
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  async function readData<T>(name: string): Promise<T | null> {
    try {
      const p = path.join(DATA_DIR, name);
      const txt = await fsp.readFile(p, 'utf8');
      return JSON.parse(txt) as T;
    } catch {
      return null;
    }
  }

  async function writeData(name: string, obj: unknown) {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    const p = path.join(DATA_DIR, name);
    await fsp.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
  }

  async function readJsonBody(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (ch: Buffer) => chunks.push(ch));
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        if (!raw) return resolve(null);
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error('invalid_json'));
        }
      });
      req.on('error', err => reject(err));
    });
  }

  // pick a random item
  function pickRandom<T>(arr: T[]) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  try {
    // Apply general API rate limiting (except for health checks)
    if (pathname.startsWith('/api/') && pathname !== '/api/health') {
      const clientIP =
        (req.headers['x-forwarded-for'] as string) ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';
      const rateLimitKey = `api_${clientIP}`;

      const rateLimitResult = apiLimiter.check(rateLimitKey, 100); // 100 requests per minute
      if (!rateLimitResult.allowed) {
        respondJson(
          res,
          {
            error: 'rate_limit_exceeded',
            message: `Too many API requests. Try again in ${Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            )} seconds.`,
          },
          429
        );
        return;
      }
    }

    // Basic status/info endpoints
    if (pathname === '/api/health' && req.method === 'GET') {
      respondJson(res, { status: 'ok' });
      return;
    }

    if (pathname === '/api/version' && req.method === 'GET') {
      const version = await readVersion();
      respondJson(res, { version });
      return;
    }

    if (pathname === '/api/info' && req.method === 'GET') {
      const version = await readVersion();
      // try to get name from package.json
      let name = 'app';
      try {
        const pj = await fsp.readFile(PACKAGE_JSON, 'utf8');
        const parsed = JSON.parse(pj);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'name' in parsed &&
          typeof parsed.name === 'string'
        ) {
          name = parsed.name;
        }
      } catch {
        // ignore
      }
      const uptime = process.uptime();
      respondJson(res, { name, version, uptimeSeconds: Math.floor(uptime) });
      return;
    }

    // New API endpoints (file-backed)
    // GET /api/items?limit=20&offset=0&lang=ru&sort=top
    if (pathname === '/api/items' && req.method === 'GET') {
      const qp = parsedUrl.searchParams;
      const limitParam = qp.get('limit');
      const offsetParam = qp.get('offset');

      // Validate and sanitize limit
      let limit = 20; // default
      if (limitParam !== null) {
        const parsedLimit = Number(limitParam);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
          limit = Math.min(parsedLimit, 100);
        }
      }

      // Validate and sanitize offset
      let offset = 0; // default
      if (offsetParam !== null) {
        const parsedOffset = Number(offsetParam);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          offset = Math.max(parsedOffset, 0);
        }
      }
      const langParam = qp.get('lang');
      const langFilter = langParam || undefined;
      const sort = qp.get('sort') || 'new';

      const items = (await readData<Item[]>('items.json')) ?? [];
      let filtered = items;
      if (langFilter) filtered = filtered.filter(i => i.lang === langFilter);
      if (sort === 'top') {
        filtered = filtered.sort((a, b) => b.content_score - a.content_score);
      } else {
        filtered = filtered.sort((a, b) => {
          const aTime = a.content_published
            ? Date.parse(a.content_published)
            : 0;
          const bTime = b.content_published
            ? Date.parse(b.content_published)
            : 0;
          // Validate that dates are valid
          const aValid = !isNaN(aTime);
          const bValid = !isNaN(bTime);
          if (!aValid && !bValid) return 0;
          if (!aValid) return 1;
          if (!bValid) return -1;
          return bTime - aTime;
        });
      }
      // Process items to select appropriate content based on language
      const processedSlice = filtered
        .slice(offset, offset + limit)
        .map(item => {
          const processedItem = { ...item };
          // Set contentText and sourceName based on requested language
          switch (langParam || processedItem.lang) {
            case 'en':
              processedItem['contentText'] = processedItem.content_text_en;
              processedItem['sourceName'] =
                processedItem.content_source_name_en;
              break;
            case 'ro':
              processedItem['contentText'] = processedItem.content_text_ro;
              processedItem['sourceName'] =
                processedItem.content_source_name_ro;
              break;
            case 'ua':
              processedItem['contentText'] = processedItem.content_text_ua;
              processedItem['sourceName'] =
                processedItem.content_source_name_ua;
              break;
            case 'ru':
              processedItem['contentText'] = processedItem.content_text_ru;
              processedItem['sourceName'] =
                processedItem.content_source_name_ru;
              break;
            default:
              processedItem['contentText'] = processedItem.content_text_en;
              processedItem['sourceName'] =
                processedItem.content_source_name_en;
          }
          return processedItem;
        });
      respondJson(res, { total: filtered.length, items: processedSlice });
      return;
    }

    // GET /api/items/:id
    if (pathname.startsWith('/api/items/') && req.method === 'GET') {
      const rawId = pathname.replace('/api/items/', '');
      // Validate the ID to prevent potential injection
      if (!/^[a-zA-Z0-9\-_]+$/.test(rawId)) {
        respondJson(res, { error: 'invalid_id_format' }, 400);
        return;
      }
      const id = rawId;
      const items = (await readData<Item[]>('items.json')) ?? [];
      const it = items.find(x => String(x.content_id) === id);
      if (!it) {
        respondJson(res, { error: 'not_found' }, 404);
        return;
      }
      // Process the item to include appropriate content based on language from query params if available
      const langParam = parsedUrl.searchParams.get('lang');
      const processedItem = { ...it };
      // Set contentText and sourceName based on requested language
      switch (langParam || processedItem.lang) {
        case 'en':
          processedItem['contentText'] = processedItem.content_text_en;
          processedItem['sourceName'] = processedItem.content_source_name_en;
          break;
        case 'ro':
          processedItem['contentText'] = processedItem.content_text_ro;
          processedItem['sourceName'] = processedItem.content_source_name_ro;
          break;
        case 'ua':
          processedItem['contentText'] = processedItem.content_text_ua;
          processedItem['sourceName'] = processedItem.content_source_name_ua;
          break;
        case 'ru':
          processedItem['contentText'] = processedItem.content_text_ru;
          processedItem['sourceName'] = processedItem.content_source_name_ru;
          break;
        default:
          processedItem['contentText'] = processedItem.content_text_en;
          processedItem['sourceName'] = processedItem.content_source_name_en;
      }
      respondJson(res, { item: processedItem });
      return;
    }

    // GET /api/random
    if (pathname === '/api/random' && req.method === 'GET') {
      const items = (await readData<Item[]>('items.json')) ?? [];
      const pick = pickRandom(items);
      if (!pick) {
        respondJson(res, { error: 'no_items' }, 404);
        return;
      }
      // Process the item to include appropriate content
      const langParam = parsedUrl.searchParams.get('lang');
      const processedItem = { ...pick };
      // Set contentText and sourceName based on requested language
      switch (langParam || processedItem.lang) {
        case 'en':
          processedItem['contentText'] = processedItem.content_text_en;
          processedItem['sourceName'] = processedItem.content_source_name_en;
          break;
        case 'ro':
          processedItem['contentText'] = processedItem.content_text_ro;
          processedItem['sourceName'] = processedItem.content_source_name_ro;
          break;
        case 'ua':
          processedItem['contentText'] = processedItem.content_text_ua;
          processedItem['sourceName'] = processedItem.content_source_name_ua;
          break;
        case 'ru':
          processedItem['contentText'] = processedItem.content_text_ru;
          processedItem['sourceName'] = processedItem.content_source_name_ru;
          break;
        default:
          processedItem['contentText'] = processedItem.content_text_en;
          processedItem['sourceName'] = processedItem.content_source_name_en;
      }
      respondJson(res, { item: processedItem });
      return;
    }

    // POST /api/ratings
    // body: { itemId, value: 1|-1, userId? }
    if (pathname === '/api/ratings' && req.method === 'POST') {
      // Rate limiting for ratings - max 10 requests per minute per IP
      const clientIP =
        (req.headers['x-forwarded-for'] as string) ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown';
      const rateLimitKey = `rating_${clientIP}`;

      const rateLimitResult = ratingLimiter.check(rateLimitKey, 10);
      if (!rateLimitResult.allowed) {
        respondJson(
          res,
          {
            error: 'rate_limit_exceeded',
            message: `Too many rating requests. Try again in ${Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            )} seconds.`,
          },
          429
        );
        return;
      }
      let body: unknown;
      try {
        body = await readJsonBody();
      } catch (e) {
        respondJson(res, { error: 'invalid_json' }, 400);
        return;
      }
      if (
        typeof body !== 'object' ||
        body === null ||
        !('itemId' in body) ||
        !('value' in body) ||
        (body.value !== 1 && body.value !== -1) ||
        typeof (body as { itemId: unknown }).itemId !== 'string' ||
        (body as { itemId: string }).itemId.length === 0
      ) {
        respondJson(res, { error: 'invalid_payload' }, 400);
        return;
      }

      // Validate that the item exists before proceeding
      const [items, ratings] = await Promise.all([
        readData<Item[]>('items.json').then(v => v ?? []),
        readData<Rating[]>('ratings.json').then(v => v ?? []),
      ]);

      // Find the item among the loaded items
      const item = items.find(
        x =>
          String(x.content_id) === String((body as { itemId: string }).itemId)
      );
      if (!item) {
        respondJson(res, { error: 'item_not_found' }, 404);
        return;
      }

      // Generate a more secure ID
      const generateSecureId = (): string => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const additionalRandom = Math.random().toString(36).substring(2, 15);
        return `rating_${timestamp}_${randomPart}_${additionalRandom}`;
      };

      // Validate userId if provided
      let validatedUserId: string | null = null;
      if (
        'userId' in body &&
        (body as { userId?: string }).userId !== undefined
      ) {
        const userId = (body as { userId: string }).userId;
        // Validate UUID format if provided
        if (
          typeof userId === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            userId
          )
        ) {
          validatedUserId = userId;
        } else {
          respondJson(res, { error: 'invalid_user_id_format' }, 400);
          return;
        }
      }

      // append rating
      const newRating: Rating = {
        id: generateSecureId(),
        userId: validatedUserId,
        itemId: (body as { itemId: string }).itemId,
        value: body.value as 1 | -1,
        createdAt: new Date().toISOString(),
      };
      ratings.push(newRating);

      // recompute score for item - using current values to prevent race conditions
      item.content_score = (item.content_score || 0) + body.value;
      // increment vote count
      item.content_votes = (item.content_votes || 0) + 1;

      // persist both files (best-effort)
      try {
        await writeData('ratings.json', ratings);
        await writeData('items.json', items);
      } catch (err) {
        log('failed to persist rating', err);
        // still continue, but warn client
        respondJson(res, { error: 'persist_failed' }, 500);
        return;
      }

      // Determine next item to show based on simple similarity: share any tag -> similar
      const tags = Array.isArray(item.content_tags) ? item.content_tags : [];
      const similar = items.find(
        it =>
          it.content_id !== item.content_id &&
          Array.isArray(it.content_tags) &&
          it.content_tags.length > 0 &&
          it.content_tags.some((t: string) => tags.includes(t))
      );
      const notSimilar = items.find(
        it =>
          it.content_id !== item.content_id &&
          Array.isArray(it.content_tags) &&
          it.content_tags.length > 0 &&
          !it.content_tags.some((t: string) => tags.includes(t))
      );
      let nextItem =
        body.value === 1
          ? similar ?? pickRandom(items)
          : notSimilar ?? pickRandom(items);

      // Process nextItem to include appropriate content
      if (nextItem) {
        const langParam = parsedUrl.searchParams.get('lang');
        const processedNextItem = { ...nextItem };
        // Set contentText and sourceName based on requested language
        switch (langParam || processedNextItem.lang) {
          case 'en':
            processedNextItem['contentText'] =
              processedNextItem.content_text_en;
            processedNextItem['sourceName'] =
              processedNextItem.content_source_name_en;
            break;
          case 'ro':
            processedNextItem['contentText'] =
              processedNextItem.content_text_ro;
            processedNextItem['sourceName'] =
              processedNextItem.content_source_name_ro;
            break;
          case 'ua':
            processedNextItem['contentText'] =
              processedNextItem.content_text_ua;
            processedNextItem['sourceName'] =
              processedNextItem.content_source_name_ua;
            break;
          case 'ru':
            processedNextItem['contentText'] =
              processedNextItem.content_text_ru;
            processedNextItem['sourceName'] =
              processedNextItem.content_source_name_ru;
            break;
          default:
            processedNextItem['contentText'] =
              processedNextItem.content_text_en;
            processedNextItem['sourceName'] =
              processedNextItem.content_source_name_en;
        }
        nextItem = processedNextItem;
      }

      respondJson(res, {
        rating: newRating,
        item: { id: item.content_id, score: item.content_score },
        nextItem,
      });
      return;
    }

    // GET /api/leaderboard?limit=10&lang=ru
    if (pathname === '/api/leaderboard' && req.method === 'GET') {
      const qp = parsedUrl.searchParams;
      const limit = Math.min(Number(qp.get('limit') ?? 10), 100);
      const langParam = qp.get('lang');
      const langFilterLeaderboard = langParam || undefined;
      const items = (await readData<Item[]>('items.json')) ?? [];
      let list = items.slice();
      if (langFilterLeaderboard)
        list = list.filter(i => i.lang === langFilterLeaderboard);
      list = list
        .sort((a, b) => b.content_score - a.content_score)
        .slice(0, limit);
      // Process items to select appropriate content based on language
      const processedList = list.map(item => {
        const processedItem = { ...item };
        // Set contentText and sourceName based on requested language
        switch (langParam || processedItem.lang) {
          case 'en':
            processedItem['contentText'] = processedItem.content_text_en;
            processedItem['sourceName'] = processedItem.content_source_name_en;
            break;
          case 'ro':
            processedItem['contentText'] = processedItem.content_text_ro;
            processedItem['sourceName'] = processedItem.content_source_name_ro;
            break;
          case 'ua':
            processedItem['contentText'] = processedItem.content_text_ua;
            processedItem['sourceName'] = processedItem.content_source_name_ua;
            break;
          case 'ru':
            processedItem['contentText'] = processedItem.content_text_ru;
            processedItem['sourceName'] = processedItem.content_source_name_ru;
            break;
          default:
            processedItem['contentText'] = processedItem.content_text_en;
            processedItem['sourceName'] = processedItem.content_source_name_en;
        }
        return processedItem;
      });
      respondJson(res, { items: processedList });
      return;
    }

    // static files under /docs and root files from public/
    if (
      pathname.startsWith('/docs') ||
      pathname === '/' ||
      pathname === '/index.html' ||
      pathname.match(/\.[a-zA-Z0-9]+$/) // if pathname has file extension (like .html, .js, .css, etc.)
    ) {
      const served = await tryServeStatic(pathname, res);
      if (served) return;
      // fallback to basic index payload if public/docs.html missing
      if (!res.headersSent) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(
          `<html><head><meta charset="utf-8"><title>Docs</title></head><body><h1>Docs</h1><p>Create <code>public/docs.html</code> to customize this page.</p></body></html>`
        );
        return;
      }
    }

    // not found
    respondJson(res, { error: 'not_found' }, 404);
  } catch (err: unknown) {
    log('request-handler-error', err);
    if (!res.headersSent) {
      respondJson(res, { error: 'internal_error' }, 500);
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
  srv.on('error', (err: unknown) => {
    log('server error', err);
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
    srv.on('error', (err: unknown) => {
      reject(toError(err));
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
      reject(toError(err));
    }
  });
}

/** convenience: get info object */
export async function getInfo() {
  const version = await readVersion();
  let name = 'app';
  try {
    const pj = await fsp.readFile(PACKAGE_JSON, 'utf8');
    const parsed = JSON.parse(pj);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'name' in parsed &&
      typeof parsed.name === 'string'
    ) {
      name = parsed.name;
    }
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
        log('Shutting down server...');
        await stopServer(srv);
        log('Server stopped');
        process.exit(0);
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    } catch (err: unknown) {
      log('Failed to start server', err);
      process.exit(1);
    }
  })();
}
