// 把前端所有 Firebase Messaging 操作集中起來
import type { FirebaseApp } from "firebase/app";
import type { Messaging } from "firebase/messaging";

import {
  firebaseClientConfig,
  firebaseVapidKey,
  isFirebaseClientConfigured,
} from "@/shared/firebase/client-config";

/**
 * `firebase/app` and `firebase/messaging` touch browser globals at import
 * time, so they're dynamically imported inside these functions rather than
 * at module scope. That keeps this module safe to import from a Client
 * Component that still gets executed once during SSR — the dynamic
 * `import()` itself only runs when a function here is actually called,
 * which only happens client-side (inside a `useEffect`).
 */
async function getFirebaseMessagingClient(): Promise<Messaging | null> {
  if (!isFirebaseClientConfigured()) return null;

  const [{ initializeApp, getApps }, { getMessaging, isSupported }] =
    await Promise.all([import("firebase/app"), import("firebase/messaging")]);

  if (!(await isSupported())) return null;

  const app: FirebaseApp =
    getApps()[0] ??
    initializeApp(firebaseClientConfig as Record<string, string>);
  return getMessaging(app);
}

/**
 * Idempotent — calling this again with the same script URL returns the
 * existing registration instead of re-registering, so it's safe to call
 * both eagerly on mount and again inside `enablePushNotifications`.
 */
export async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !isFirebaseClientConfigured()) {
    return null;
  }
  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

/**
 * Requests Notification permission (no-op if already granted/denied — the
 * browser only prompts once per origin) and registers the resulting FCM
 * token with the backend. Returns whether push is now active.
 */
export async function enablePushNotifications(): Promise<boolean> {
  const messaging = await getFirebaseMessagingClient();
  if (messaging === null) return false;

  const registration = await registerFirebaseServiceWorker();
  if (registration === null) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const { getToken } = await import("firebase/messaging");
  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token) return false;

  const response = await fetch("/api/push-subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: token }),
  });
  return response.ok;
}

/**
 * Re-registers silently if the user already granted permission in a
 * previous session (e.g. the FCM token rotated). Never prompts.
 */
export async function reregisterPushTokenIfGranted(): Promise<void> {
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return;
  }
  await enablePushNotifications();
}

/** Resolves to a no-op unsubscribe if Firebase isn't configured/supported. */
export async function listenForForegroundMessages(
  onMessageReceived: () => void,
): Promise<() => void> {
  const messaging = await getFirebaseMessagingClient();
  if (messaging === null) return () => {};

  const { onMessage } = await import("firebase/messaging");
  return onMessage(messaging, () => {
    onMessageReceived();
  });
}
