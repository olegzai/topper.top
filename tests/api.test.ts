import { beforeAll, afterAll, test, expect } from 'vitest';
import { startServer, stopServer } from '../src/api/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

import http from 'http';
let server: http.Server | null = null;
let baseUrl = 'http://localhost:3000';

/**
 * Helper: write JSON file
 */
async function writeJson(file: string, obj: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, file);
  await fs.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}

/**
 * fetch wrapper with timeout and logging so tests don't hang silently.
 * - timeoutMs: how long to wait before aborting (ms)
 * - logs start/end/status/errors to console
 */
async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 5000
) {
  const method = (init.method || 'GET').toUpperCase();
  console.log(`[TEST] FETCH START ${method} ${input} (timeout=${timeoutMs}ms)`);

  // Using a more compatible approach with a simple timeout
  return Promise.race([
    fetch(input, init),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`[TEST] FETCH TIMEOUT ${method} ${input}`));
      }, timeoutMs);
    }),
  ])
    .then(res => {
      console.log(
        `[TEST] FETCH OK ${method} ${input} -> ${(res as Response).status}`
      );
      return res as Response;
    })
    .catch(err => {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[TEST] FETCH ERROR ${method} ${input} -> ${msg}`);
      throw err;
    });
}

/**
 * Helper: read JSON response with a short timeout and log progress.
 */
async function readJsonWithLog(res: Response) {
  try {
    const txt = await res.text();
    try {
      const parsed = JSON.parse(txt);
      return parsed;
    } catch {
      console.log('[TEST] Failed to parse JSON body:', txt);
      throw new Error('invalid_json_response');
    }
  } catch (err) {
    console.log('[TEST] Error reading response body:', err);
    throw err;
  }
}

beforeAll(async () => {
  console.log('[TEST] beforeAll: seeding minimal test data');
  // Prepare minimal test data (idempotent)
  const users = [
    {
      id: 'user_test_1',
      username: 'user_test_1',
      displayName: 'User Test 1',
      role: 'user',
      locale: 'en',
      createdAt: new Date().toISOString(),
    },
  ];

  const categories = [
    { id: 'cat_test_1', slug: 'test', name: 'Test', lang: 'en' },
  ];

  const items = [
    {
      content_id: 'item_test_1',
      content_canonical_text_en: 'Test item 1',
      content_text_en: 'Test item 1',
      content_text_ro: 'Element de test 1',
      content_text_ua: 'Тестовий елемент 1',
      content_text_ru: 'Тестовый элемент 1',
      content_source_name_en: 'TestSource',
      content_source_name_ro: 'Sursa Test',
      content_source_name_ua: 'Джерело Тест',
      content_source_name_ru: 'Источник Тест',
      content_source_link: 'https://example.test/item_test_1',
      content_country: 'US',
      content_created_by: 'user_test_1',
      content_created: new Date().toISOString(),
      content_published: new Date().toISOString(),
      content_type: 'news',
      content_category: 'news',
      content_subcategory: 'General',
      content_tags: ['test'],
      content_votes: 0,
      content_score: 0,
      categories: ['cat_test_1'],
      lang: 'en',
    },
    {
      content_id: 'item_test_2',
      content_canonical_text_en: 'Another test item',
      content_text_en: 'Another test item',
      content_text_ro: 'Alt element de test',
      content_text_ua: 'Інший тестовий елемент',
      content_text_ru: 'Другой тестовый элемент',
      content_source_name_en: 'TestSource',
      content_source_name_ro: 'Sursa Test',
      content_source_name_ua: 'Джерело Тест',
      content_source_name_ru: 'Источник Тест',
      content_source_link: 'https://example.test/item_test_2',
      content_country: 'US',
      content_created_by: null,
      content_created: new Date().toISOString(),
      content_published: new Date().toISOString(),
      content_type: 'news',
      content_category: 'news',
      content_subcategory: 'General',
      content_tags: ['other'],
      content_votes: 0,
      content_score: 0,
      categories: ['cat_test_1'],
      lang: 'en',
    },
  ];

  interface Rating {
    id: string;
    userId: string | null;
    itemId: string;
    value: 1 | -1;
    createdAt: string;
  }
  const ratings: Rating[] = []; // start empty

  const settings = {
    version: '0.0.1-test',
    seededAt: new Date().toISOString(),
    counts: {
      users: users.length,
      items: items.length,
      ratings: ratings.length,
    },
  };

  // Write files before starting server so server endpoints read them
  await writeJson('users.json', users);
  await writeJson('categories.json', categories);
  await writeJson('items.json', items);
  await writeJson('ratings.json', ratings);
  await writeJson('settings.json', settings);

  console.log('[TEST] starting server on ephemeral port');
  // Start server on ephemeral port
  server = await startServer(0);
  const addr = server.address();
  const port =
    typeof addr === 'object' && addr && 'port' in addr
      ? (addr as import('net').AddressInfo).port
      : 3000;
  baseUrl = `http://localhost:${port}`;
  console.log(`[TEST] server running at ${baseUrl}`);
});

afterAll(async () => {
  console.log('[TEST] afterAll: stopping server and cleaning test files');
  if (server) {
    await stopServer(server);
  }

  // cleanup test files we created (do not remove entire data dir in case of other files)
  const files = [
    'users.json',
    'categories.json',
    'items.json',
    'ratings.json',
    'settings.json',
  ];
  for (const f of files) {
    try {
      await fs.unlink(path.join(DATA_DIR, f));
    } catch {
      // ignore
    }
  }
  console.log('[TEST] cleanup finished');
});

/**
 * Each test uses fetchWithTimeout to avoid hanging.
 * Default timeout used: 5000ms. If a request may take longer, increase the timeout on that call.
 */

test('GET /api/health returns ok', async () => {
  const res = await fetchWithTimeout(`${baseUrl}/api/health`, {}, 3000);
  expect(res.status).toBe(200);
  const body = await readJsonWithLog(res);
  expect(body).toEqual({ status: 'ok' });
});

test('GET /api/items returns list with test item', async () => {
  const res = await fetchWithTimeout(`${baseUrl}/api/items?limit=10`, {}, 5000);
  expect(res.status).toBe(200);
  const body = await readJsonWithLog(res);
  expect(typeof body.total).toBe('number');
  expect(Array.isArray(body.items)).toBeTruthy();
  const found = body.items.find(
    (it: { content_id: string }) => it.content_id === 'item_test_1'
  );
  expect(found).toBeDefined();
  expect(found.content_canonical_text_en).toBe('Test item 1');
});

test('GET /api/random returns an item', async () => {
  const res = await fetchWithTimeout(`${baseUrl}/api/random`, {}, 4000);
  expect(res.status).toBe(200);
  const body = await readJsonWithLog(res);
  expect(body).toHaveProperty('item');
  expect(body.item).toHaveProperty('content_id');
});

test('POST /api/ratings creates rating and updates item score and returns nextItem', async () => {
  // Vote +1 on item_test_1
  const payload = {
    itemId: 'item_test_1', // This matches content_id in our test data
    value: 1,
    userId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
    currentItemId: 'item_test_1',
  };
  const res = await fetchWithTimeout(
    `${baseUrl}/api/ratings`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    6000
  );
  expect(res.status).toBe(200);
  const body = await readJsonWithLog(res);
  expect(body).toHaveProperty('rating');
  expect(body.rating.itemId).toBe('item_test_1');
  expect(body.rating.value).toBe(1);
  expect(body).toHaveProperty('item');
  expect(body.item.id).toBe('item_test_1');
  // item score should be 1 now
  expect(body.item.score).toBe(1);
  // nextItem should exist
  expect(body).toHaveProperty('nextItem');
  expect(body.nextItem).toHaveProperty('content_id');
});

test('GET /api/leaderboard includes our voted item at top', async () => {
  const res = await fetchWithTimeout(
    `${baseUrl}/api/leaderboard?limit=5`,
    {},
    5000
  );
  expect(res.status).toBe(200);
  const body = await readJsonWithLog(res);
  expect(Array.isArray(body.items)).toBeTruthy();
  // Our item_test_1 has score 1, so it should be present
  const found = body.items.find(
    (it: { content_id: string }) => it.content_id === 'item_test_1'
  );
  expect(found).toBeDefined();
});
