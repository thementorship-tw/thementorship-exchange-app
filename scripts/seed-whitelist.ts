import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

import { whitelist } from "../src/db/schema";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const configuredDatabaseUrl = process.env.TURSO_DATABASE_URL;

if (!configuredDatabaseUrl) {
  throw new Error("TURSO_DATABASE_URL is required. See .env.example.");
}

if (!configuredDatabaseUrl.startsWith("file:")) {
  throw new Error(
    "Whitelist seed is for local development only. TURSO_DATABASE_URL must use a file: URL.",
  );
}

const databaseUrl: string = configuredDatabaseUrl;

const session = Number.parseInt(process.env.DEV_WHITELIST_SESSION ?? "", 10);
const emails = [
  ...new Set(
    (process.env.DEV_WHITELIST_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ),
];

if (!Number.isSafeInteger(session) || session <= 0) {
  throw new Error("DEV_WHITELIST_SESSION must be a positive integer. See .env.example.");
}

if (emails.length === 0) {
  throw new Error(
    "DEV_WHITELIST_EMAILS must contain at least one comma-separated email. See .env.example.",
  );
}

async function main(): Promise<void> {
  const client = createClient({ url: databaseUrl });
  const db = drizzle(client);
  const now = new Date();

  try {
    await db
      .insert(whitelist)
      .values(
        emails.map((email) => ({
          email,
          session,
          active: true,
        })),
      )
      .onConflictDoUpdate({
        target: whitelist.email,
        set: {
          session,
          active: true,
          updatedAt: now,
          deactivatedAt: null,
        },
      });

    console.log(
      `Seeded ${emails.length} active whitelist entries for development session ${session}.`,
    );
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error("Failed to seed the local whitelist.", error);
  process.exitCode = 1;
});
