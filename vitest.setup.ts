import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll } from "vitest";

beforeAll(() => {
  execSync("pnpm drizzle-kit push");
});

afterAll(() => {
  fs.rmSync("test.db", { force: true });
});
