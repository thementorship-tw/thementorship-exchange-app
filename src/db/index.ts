import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { serverEnv } from "@/env";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

// Reuse the client across hot reloads in dev and across warm invocations in
// serverless, so we don't leak a new connection per module evaluation.
const globalForDb = globalThis as unknown as {
  __libsqlClient?: Client;
  __db?: Database;
};

/**
 * Lazily-constructed Drizzle client.
 *
 * Prefer calling this inside a request handler rather than at module scope, so
 * builds without database credentials (e.g. CI) don't fail at import time.
 */
export function getDb(): Database {
  if (!globalForDb.__db) {
    globalForDb.__libsqlClient ??= createClient({
      url: serverEnv.databaseUrl,
      authToken: serverEnv.databaseAuthToken,
    });
    globalForDb.__db = drizzle(globalForDb.__libsqlClient, { schema });
  }
  return globalForDb.__db;
}

export { schema };
