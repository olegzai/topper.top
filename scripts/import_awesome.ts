#!/usr/bin/env ts-node

/**
 * scripts/import_awesome.ts
 *
 * Simple importer that fetches one or more "awesome" Markdown lists (raw GitHub URLs),
 * extracts list entries (link + optional description) and writes them as items to:
 *   data/items_awesome.json
 *
 * Usage:
 *   # default: uses a small set of curated example URLs (change as needed)
 *   npx ts-node scripts/import_awesome.ts
 *
 *   # or pass raw URLs to markdown files
 *   npx ts-node scripts/import_awesome.ts https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md
 *
 * Notes:
 * - Designed to work with Node 18+ (uses global fetch if available).
 * - Output format loosely follows the project's `items` shape:
 *    { id, title, source, url, authorId, tags, categories, lang, publishedAt, createdAt, score }
 *
 * - Titles are trimmed to 140 characters to match the MVP requirement.
 */

import fs from "fs";
import path from "path";
import { promises as fsp } from "fs";
import crypto from "crypto";
import { URL } from "url";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUT_FILE = path.join(DATA_DIR, "items_awesome.json");
const MAX_TITLE_LEN = 140;

/** Simple logger */
function log(...args: unknown[]) {
  // keep short logs
  console.log(new Date().toISOString(), ...args);
}

function uuid() {
  // Node 18 has crypto.randomUUID
  // fallback to hex if not available
  return (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(16).toString("hex");
}

function safeHostOf(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/** Trim string to max chars, prefer not to break words if possible */
function truncate(s: string, max = MAX_TITLE_LEN) {
  if (s.length <= max) return s;
  // try to cut at last space before max-3
  const cut = s.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(max / 2)) {
    return cut.slice(0, lastSpace) + "...";
  }
  return cut + "...";
}

/** Markdown parsing helpers
 *
 * We consider a line an item if it contains a markdown link:
 *   - [Title](https://example) - optional description
 * or a bare link: https://example (use host as title)
 *
 * The parser will extract title, url and optional description.
 */
type ParsedEntry = { title: string; url: string; description?: string };

function parseMarkdownLines(md: string): ParsedEntry[] {
  const lines = md.split(/\r?\n/);
  const entries: ParsedEntry[] = [];

  // Regex for markdown link with optional trailing dash/description
  const mdLinkRe = /\[([^\]]{1,300})\]\((https?:\/\/[^\s)]+)\)(?:\s*[-–—]\s*(.+))?/;
  // sometimes lists are like: - [Title](url) — desc
  // Also parse HTML anchor fallback: <https://...>
  const angleRe = /<\s*(https?:\/\/[^>]+)\s*>/;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Common patterns start with -, *, or a digit+.
    // But there are many header lines; just attempt to extract links.
    const m = line.match(mdLinkRe);
    if (m) {
      const title = m[1].trim();
      const url = m[2].trim();
      const desc = m[3]?.trim();
      entries.push({ title, url, description: desc });
      continue;
    }

    // Try angle link
    const ma = line.match(angleRe);
    if (ma) {
      const url = ma[1].trim();
      entries.push({ title: safeHostOf(url), url });
      continue;
    }

    // Bare link somewhere in the line
    const bare = line.match(/(https?:\/\/[^\s)]+)/);
    if (bare) {
      const url = bare[1];
      // try to capture a preceding bracketed title if present earlier on the same line
      const pre = line.match(/\[([^\]]+)\]/);
      const title = pre ? pre[1] : safeHostOf(url);
      // try to get trailing description after the URL separated by dash
      const desc = line.split(url)[1]?.replace(/^[\s\-–—:]+/, "")?.trim();
      entries.push({ title: title.trim(), url: url.trim(), description: desc || undefined });
      continue;
    }

    // no link -> skip
  }

  return entries;
}

/** Fetch a raw text URL. Uses global fetch when available, otherwise falls back to https */
async function fetchText(url: string): Promise<string> {
  // prefer global fetch
  if (typeof (globalThis as any).fetch === "function") {
    const res = await (globalThis as any).fetch(url);
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
    return await res.text();
  }

  // fallback to https.get
  return new Promise<string>((resolve, reject) => {
    try {
      // dynamic import of https to avoid bundler issues
      const https = require("https");
      https
        .get(url, (res: any) => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          const parts: Buffer[] = [];
          res.on("data", (chunk: Buffer) => parts.push(chunk));
          res.on("end", () => {
            const txt = Buffer.concat(parts).toString("utf8");
            resolve(txt);
          });
        })
        .on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

/** Build an item object compatible with MVP items */
function buildItemFromParsed(e: ParsedEntry, sourceUrl: string, defaultCategory = "awesome-list") {
  const sourceHost = safeHostOf(sourceUrl);
  const titleBase = e.title || sourceHost;
  // prefer title + short desc if present
  let title = titleBase;
  if (e.description) {
    const combined = `${titleBase} — ${e.description}`;
    title = truncate(combined, MAX_TITLE_LEN);
  } else {
    title = truncate(titleBase, MAX_TITLE_LEN);
  }

  const item = {
    id: uuid(),
    title,
    source: sourceHost,
    url: e.url,
    authorId: null,
    tags: ["awesome", defaultCategory],
    categories: [defaultCategory],
    lang: "en",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    score: 0,
  };

  return item;
}

/** Main runner */
async function main() {
  // CLI args: URLs. If none provided, use a small set of example awesome lists (raw URLs).
  const argv = process.argv.slice(2);
  const urls = argv.length
    ? argv
    : [
        // Example defaults (raw readme links). You can change or pass your own.
        "https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md",
        "https://raw.githubusercontent.com/sindresorhus/awesome-nodejs/master/readme.md",
      ];

  log("Importing awesome lists:", urls);

  const allItems: any[] = [];

  for (const u of urls) {
    try {
      log("Fetching", u);
      const md = await fetchText(u);
      const entries = parseMarkdownLines(md);
      log(`Parsed ${entries.length} candidate entries from ${u}`);

      // Convert parsed entries to items
      for (const e of entries) {
        try {
          const item = buildItemFromParsed(e, u, "awesome");
          allItems.push(item);
        } catch (err) {
          // skip problematic entries
        }
      }
    } catch (err) {
      log("Failed to fetch/parse", u, err instanceof Error ? err.message : err);
    }
  }

  // Deduplicate by URL (keep first)
  const byUrl = new Map<string, any>();
  for (const it of allItems) {
    if (!byUrl.has(it.url)) byUrl.set(it.url, it);
  }
  const uniqueItems = Array.from(byUrl.values());

  // Ensure data directory exists
  await fsp.mkdir(DATA_DIR, { recursive: true });

  // Write out
  const out = {
    generatedAt: new Date().toISOString(),
    sourceCount: urls.length,
    itemCount: uniqueItems.length,
    items: uniqueItems,
  };

  await fsp.writeFile(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  log(`Wrote ${OUT_FILE} (${uniqueItems.length} items)`);
  log("Done.");
}

/** Allow running as script */
if (require.main === module) {
  main().catch((err) => {
    console.error("import_awesome failed:", err);
    process.exit(1);
  });
}
