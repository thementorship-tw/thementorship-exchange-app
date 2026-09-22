import { cert, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

import { serverEnv } from "@/env";

// Reuse the app across hot reloads in dev and across warm invocations in
// serverless, same rationale as getDb() in @/server/db.
const globalForFirebase = globalThis as unknown as {
  __firebaseAdminApp?: App;
};

function getFirebaseAdminApp(): App {
  globalForFirebase.__firebaseAdminApp ??= initializeApp({
    credential: cert({
      projectId: serverEnv.firebaseProjectId,
      clientEmail: serverEnv.firebaseClientEmail,
      privateKey: serverEnv.firebasePrivateKey,
    }),
  });
  return globalForFirebase.__firebaseAdminApp;
}

/**
 * Lazily-constructed Messaging client. Only call once
 * `isFirebaseAdminConfigured()` is true — callers are expected to check
 * that first so push sending can no-op instead of throwing.
 */
export function getFirebaseMessaging(): Messaging {
  return getMessaging(getFirebaseAdminApp());
}
