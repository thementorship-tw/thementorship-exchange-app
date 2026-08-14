/**
 * Server-side environment variables.
 *
 * Values are read lazily so that `next build` (and CI) can run without database
 * credentials present — validation only fires when something actually needs the
 * value at request time.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export const serverEnv = {
  /** libsql://<db>.turso.io for Turso, or file:local.db for a local SQLite file. */
  get databaseUrl(): string {
    return required("TURSO_DATABASE_URL");
  },
  /** Not needed when TURSO_DATABASE_URL points at a local file: database. */
  get databaseAuthToken(): string | undefined {
    return process.env.TURSO_AUTH_TOKEN;
  },
};
