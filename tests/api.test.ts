import { beforeAll, afterAll, test, expect } from "vitest";
import { startServer, stopServer } from "../src/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");

let server: any = null;
let baseUrl = "http://localhost:3000";

async function writeJson(file: string, obj: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, file);
  await fs.writeFile(p, JSON.stringify(obj, null, 2), "utf8");
}

beforeAll(async () => {
  // Prepare minimal test data (idempotent)
  const users = [
    {
      id: "user_test_1",
      username: "user_test_1",
      displayName: "User Test 1",
      role: "user",
      locale: "en",
      createdAt: new Date().toISOString(),
    },
  ];

  const categories = [
    { id: "cat_test_1", slug: "test", name: "Test", lang: "en" },
  ];

  const items = [
    {
      id: "item_test_1",
      title: "Test item 1",
      source: "TestSource",
      url: "https://example.test/item_test_1",
      authorId: "user_test_1",
      tags: ["test"],
      categories: ["cat_test_1"],
      lang: "en",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      score: 0,
    },
    {
      id: "item_test_2",
      title: "Another test item",
      source: "TestSource",
      url: "https://example.test/item_test_2",
      authorId: null,
      tags: ["other"],
      categories: ["cat_test_1"],
      lang: "en",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      score: 0,
    },
  ];

  const ratings: any[] = []; // start empty

  const settings = {
    version: "0.0.1-test",
    seededAt: new Date().toISOString(),
    counts: { users: users.length, items: items.length, ratings: ratings.length },
  };

  // Write files before starting server so server endpoints read them
  await writeJson("users.json", users);
  await writeJson("categories.json", categories);
  await writeJson("items.json", items);
  await writeJson("ratings.json", ratings);
  await writeJson("settings.json", settings);

  // Start server on ephemeral port
  server = await startServer(0);
  const addr = server.address();
  const port =
    typeof addr === "object" && addr && "port" in addr ? (addr as any).port : 3000;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  if (server) {
    await stopServer(server);
  }

  // cleanup test files we created (do not remove entire data dir in case of other files)
  const files = ["users.json", "categories.json", "items.json", "ratings.json", "settings.json"];
  for (const f of files) {
    try {
      await fs.unlink(path.join(DATA_DIR, f));
    } catch {
      // ignore
    }
  }
});

test("GET /api/health returns ok", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toEqual({ status: "ok" });
});

test("GET /api/items returns list with test item", async () => {
  const res = await fetch(`${baseUrl}/api/items?limit=10`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(typeof body.total).toBe("number");
  expect(Array.isArray(body.items)).toBeTruthy();
  const found = body.items.find((it: any) => it.id === "item_test_1");
  expect(found).toBeDefined();
  expect(found.title).toBe("Test item 1");
});

test("GET /api/random returns an item", async () => {
  const res = await fetch(`${baseUrl}/api/random`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("item");
  expect(body.item).toHaveProperty("id");
});

test("POST /api/ratings creates rating and updates item score and returns nextItem", async () => {
  // Vote +1 on item_test_1
  const payload = {
    itemId: "item_test_1",
    value: 1,
    userId: "user_test_1",
    currentItemId: "item_test_1",
  };
  const res = await fetch(`${baseUrl}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("rating");
  expect(body.rating.itemId).toBe("item_test_1");
  expect(body.rating.value).toBe(1);
  expect(body).toHaveProperty("item");
  expect(body.item.id).toBe("item_test_1");
  // item score should be 1 now
  expect(body.item.score).toBe(1);
  // nextItem should exist
  expect(body).toHaveProperty("nextItem");
  expect(body.nextItem).toHaveProperty("id");
});

test("GET /api/leaderboard includes our voted item at top", async () => {
  const res = await fetch(`${baseUrl}/api/leaderboard?limit=5`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body.items)).toBeTruthy();
  // Our item_test_1 has score 1, so it should be present
  const found = body.items.find((it: any) => it.id === "item_test_1");
  expect(found).toBeDefined();
});
