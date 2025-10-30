import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { env } from "node:process";
import { Pool } from "pg";

import * as schema from "./schemas";

const testDbBaseUrl = env.DATABASE_URL;

// View all test databases
// psql "postgres://username:password@localhost:5432/postgres" \
// -c "SELECT datname FROM pg_database WHERE datname LIKE 'test_db%' ORDER BY datname;"

// Drop all test databases
// ADMIN_URL="postgres://username:password@localhost:5432/postgres"
// for db in $(psql "$ADMIN_URL" -t -A -c "SELECT datname FROM pg_database WHERE datname LIKE 'test_db%'"); do
//   psql "$ADMIN_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$db' AND pid <> pg_backend_pid();"
//   psql "$ADMIN_URL" -c "DROP DATABASE IF EXISTS \"$db\";"
// done

export interface TestDbContext {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  testDbName: string;
}

export const createTestDb = async (): Promise<TestDbContext> => {
  const testDbName = `test_db_${randomUUID().replace(/-/g, "")}`;
  const testDbUrl = `${testDbBaseUrl}/${testDbName}`;

  const adminPool = new Pool({ connectionString: `${testDbBaseUrl}/postgres` });
  await adminPool.query(`CREATE DATABASE ${testDbName}`);
  await adminPool.end();

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

  const adminPool = new Pool({ connectionString: `${testDbBaseUrl}/postgres` });
  await adminPool.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid();
  `, [testDbName]);

  await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await adminPool.end();
};
