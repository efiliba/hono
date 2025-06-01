import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as schema from "./schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

// Enable Write-Ahead Logging mode - improve write performance
await client.execute("PRAGMA journal_mode=WAL;");

export default drizzle(client, {
  schema,
});
