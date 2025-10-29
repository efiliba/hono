import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { Pool } from "pg";

import * as schema from "./schemas";

const adminDbUrl = process.env.ADMIN_DATABASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

export interface TestDbContext {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  testDbName: string;
}

export const createTestDb = async (): Promise<TestDbContext> => {
  // const testDbName = `test_db_${randomUUID().replace(/-/g, "")}`;
  const testDbName = `test_db`;

  const testDbUrl = `${testDatabaseUrl}/${testDbName}`;

  // const adminPool = new Pool({ connectionString: `${testDatabaseUrl}/postgres` });
  // await adminPool.query(`CREATE DATABASE ${testDbName}`);
  // await adminPool.end();

  const pool = new Pool({
    connectionString: testDbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await migrate(db, { migrationsFolder: join(process.cwd(), "src/db/migrations") });

  return { pool, db, testDbName };
};

export const destroyTestDb = async ({ pool, testDbName }: TestDbContext) => {
  await pool.end();

  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid();`, [testDbName]);

  await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await adminPool.end();
};
