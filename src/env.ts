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
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

export const serverEnv = {
  /** libsql://<db>.turso.io for Turso, or file:local.db for a local SQLite file. */
  get databaseUrl(): string {
    return required("TURSO_DATABASE_URL");
  },
  get authSecret(): string {
    return required("AUTH_SECRET");
  },
  /** Not needed when TURSO_DATABASE_URL points at a local file: database. */
  get databaseAuthToken(): string | undefined {
    return process.env.TURSO_AUTH_TOKEN;
  },
  /** Firebase Admin service account — used to send push notifications via FCM. */
  get firebaseProjectId(): string {
    return required("FIREBASE_PROJECT_ID");
  },
  get firebaseClientEmail(): string {
    return required("FIREBASE_CLIENT_EMAIL");
  },
  /** Vercel env vars store this as a single line; `\n` needs unescaping. */
  get firebasePrivateKey(): string {
    return required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  },
};

/**
 * Firebase Admin credentials aren't set up yet (see docs/notifications/02).
 * Callers must check this before touching `serverEnv.firebase*`, so push
 * sending can no-op instead of throwing until the project is configured.
 */
export function isFirebaseAdminConfigured(): boolean {
  return [
    process.env.FIREBASE_PROJECT_ID,
    process.env.FIREBASE_CLIENT_EMAIL,
    process.env.FIREBASE_PRIVATE_KEY,
  ].every((value) => typeof value === "string" && value.trim().length > 0);
}
