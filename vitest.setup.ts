import { sql } from "drizzle-orm";
import { beforeAll } from "vitest";

import db from "@/db";
import { tasks, users } from "@/db/schemas";

beforeAll(async () => {
  // Clear database before running tests and reset task::id serial sequence
  await Promise.all([db.delete(tasks), db.delete(users)]);
  await db.execute(sql`ALTER SEQUENCE tasks_id_seq RESTART`);
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART`);
});
