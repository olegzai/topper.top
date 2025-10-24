/// <reference types="node" />

import { IncomingMessage, ServerResponse } from 'http';
import * as fsp from 'fs/promises';
import * as path from 'path';

const VERSION_FILE = path.resolve(process.cwd(), 'version.txt');
const PACKAGE_JSON = path.resolve(process.cwd(), 'package.json');

// Cache for version to avoid reading file multiple times
let cachedVersion: string | null = null;

/** Read version from version.txt or fallback to package.json -> version */
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
      return cachedVersion!;
    }
  } catch {
    // ignore
  }

  cachedVersion = '0.0.0-dev';
  return cachedVersion!;
}

export async function handleHealth(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return true;
  }
  return false;
}

export async function handleVersion(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/version' && req.method === 'GET') {
    const version = await readVersion();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ version }));
    return true;
  }
  return false;
}

export async function handleInfo(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/info' && req.method === 'GET') {
    let name = 'topper.top';
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
    const version = await readVersion();
    const uptime = process.uptime();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({ name, version, uptimeSeconds: Math.floor(uptime) })
    );
    return true;
  }
  return false;
}
