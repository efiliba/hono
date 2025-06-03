/* eslint-disable node/no-process-env */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll } from "vitest";

const testFile = process.env.VITEST_POOL_ID || "default";
const dbPath = `test-${testFile}.db`;

process.env.DATABASE_URL = `file:${dbPath}`;

beforeAll(() => {
  execSync("pnpm drizzle-kit push");
});

afterAll(() => {
  fs.rmSync(dbPath, { force: true });
  fs.rmSync(`${dbPath}-wal`, { force: true });
  fs.rmSync(`${dbPath}-shm`, { force: true });
});
