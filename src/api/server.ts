/// <reference types="node" />

/**
 * Modular HTTP server + exported helpers
 *
 * - No external dependencies (uses Node built-ins)
 * - Endpoints split across multiple route modules
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
import { promises as fsp } from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { apiLimiter } from '../utils/rate-limiter';

// Import route handlers
import { handleHealth, handleVersion, handleInfo } from './routes/health';
import { handleItems } from './routes/items';
import { handleRankings } from './routes/rankings';
import { handleLeaderboard } from './routes/leaderboard';

type ServerInstance = Server;

const DEFAULT_PORT = 3000;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

/** simple logger helper */
function log(...args: unknown[]) {
  // keep logs short and usable in CI/dev
  // prefix with timestamp
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(ts, ...args);
}

/** Try to serve static files from public directory */
async function tryServeStatic(
  pathname: string,
  res: ServerResponse
): Promise<boolean> {
  // normalize path to prevent directory traversal
  const normalizedPath = path
    .normalize(pathname)
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/\\/g, '/');
  let filePath = path.join(PUBLIC_DIR, normalizedPath);

  // if pathname is / or /index.html, serve index.html
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Ensure the resolved path is within the public directory
  const publicDirRealPath = await fsp
    .realpath(PUBLIC_DIR)
    .catch(() => PUBLIC_DIR);
  const filePathRealPath = await fsp.realpath(filePath).catch(() => filePath);
  if (!filePathRealPath.startsWith(publicDirRealPath)) {
    return false;
  }

  try {
    // Check if file exists
    await fsp.access(filePath);
  } catch {
    // File does not exist
    return false;
  }

  // Try to infer content-type from file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentTypeMap: { [key: string]: string } = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.ts': 'application/javascript', // note: might want to compile ts on the fly
    '.json': 'application/json',
    '.css': 'text/css',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'font/eot',
  };
  const contentType = contentTypeMap[ext] || 'application/octet-stream';
  const content = await fsp.readFile(filePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  // Security: prevent mime-type sniffing attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(content);
  return true;
}

/** Send JSON response with proper headers */
function respondJson(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  // Security: prevent mime-type sniffing attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}

/** Basic router/handler */
async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Basic rate limiting for API endpoints (excluding health)
    if (pathname.startsWith('/api/') && pathname !== '/api/health') {
      const clientIP =
        (req.headers['x-forwarded-for'] as string) ||
        (req.connection && req.connection.remoteAddress) ||
        (req.socket && req.socket.remoteAddress) ||
        'unknown';
      const rateLimitKey = `api_${clientIP}`;

      const rateLimitResult = apiLimiter.check(rateLimitKey, 100); // 100 requests per minute
      if (!rateLimitResult.allowed) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'rate_limit_exceeded',
            retryAfter: (rateLimitResult.resetTime - Date.now()) / 1000,
          })
        );
        return;
      }
    }

    // Route to appropriate handler
    // Health routes
    if (await handleHealth(req, res)) return;
    if (await handleVersion(req, res)) return;
    if (await handleInfo(req, res)) return;

    // Items routes
    if (await handleItems(req, res, pathname)) return;

    // Rankings routes
    if (await handleRankings(req, res, pathname)) return;

    // Leaderboard routes
    if (await handleLeaderboard(req, res, pathname)) return;

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

/** Start the server on the given port */
export async function startServer(
  port: number = DEFAULT_PORT
): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    const srv = http.createServer(requestHandler);
    srv.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });
    srv.listen(port, () => {
      log(`Server running on port ${port} (http://localhost:${port})`);
      log(`Data directory: ${path.resolve(process.cwd(), 'data')}`);
      log(`Public directory: ${PUBLIC_DIR}`);
      resolve(srv);
    });
  });
}

/** Stop the given server instance */
export async function stopServer(srv: ServerInstance): Promise<void> {
  return new Promise((resolve, reject) => {
    srv.close(err => {
      if (err) {
        reject(err);
      } else {
        log('Server stopped');
        resolve();
      }
    });
  });
}

// When run directly, start the server
if (require.main === module) {
  startServer(DEFAULT_PORT).catch((err: Error) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
