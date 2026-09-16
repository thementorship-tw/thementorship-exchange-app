/**
 * Firebase Web config — safe to expose to the browser (Firebase docs: this
 * is an identifier, not a secret; access control lives in Security Rules /
 * App Check). Read directly, not via `serverEnv`, so it can be imported from
 * both client components and the `/firebase-messaging-sw.js` route handler.
 */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Web Push certificate key pair, generated in Firebase Console > Cloud Messaging. */
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Firebase project isn't configured yet (see docs/notifications/02). Callers
 * must check this before initializing the client SDK, so the app keeps
 * working without push notifications until the values are filled in.
 */
export function isFirebaseClientConfigured(): boolean {
  return (
    Object.values(firebaseClientConfig).every(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) &&
    typeof firebaseVapidKey === "string" &&
    firebaseVapidKey.trim().length > 0
  );
}
