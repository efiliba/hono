import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import env from "@/env";

import * as schema from "./schemas";

const client = postgres(env.DATABASE_URL, {
  max: 1,
  ssl: "require",
});

export default drizzle(client, {
  schema,
});
