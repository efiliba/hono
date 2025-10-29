import { sql } from "drizzle-orm";
import { afterEach, beforeEach, vi } from "vitest";

import type { TestDbContext } from "@/db/setup-test-db";

import { createTestDb } from "@/db/setup-test-db";

// Hoisted state to inject the per-test db instance into the '@/db' module mock
const hoisted = vi.hoisted(() => {
  let currentDb: unknown = null;

  const getDb = () => currentDb;
  const setDb = (db: unknown) => {
    currentDb = db;
  };

  // Proxy defers all property/method access to the current db instance
  const dbProxy = new Proxy({}, {
    get(_target, prop) {
      const db = getDb();
      if (!db) {
        throw new ReferenceError("Test DB not initialized yet");
      }
      // @ts-expect-error dynamic property access
      return db[prop];
    },
    apply(_target, thisArg, argArray) {
      const db = getDb();
      if (typeof db !== "function") {
        throw new TypeError("DB is not callable");
      }
      return (db as any).apply(thisArg, argArray);
    },
  });

  return { getDb, setDb, dbProxy };
});

vi.mock("@/db", () => ({
  __esModule: true,
  default: hoisted.dbProxy,
}));

let ctx: TestDbContext;

beforeEach(async () => {
  ctx = await createTestDb();
  hoisted.setDb(ctx.db);

  // Ensure a clean state when reusing a persistent test database
  await ctx.db.execute(sql`TRUNCATE TABLE user_events, events, tasks, users RESTART IDENTITY CASCADE`);
});

afterEach(async () => {
  // Uncomment to drop and recreate per test; for now just close connections
  // await destroyTestDb(ctx);
});
