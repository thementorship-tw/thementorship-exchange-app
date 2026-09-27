import { withBasePath } from "@/shared/base-path";

/** Register the single service worker shared by offline fallback and FCM. */
export async function registerAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  return navigator.serviceWorker.register(
    withBasePath("/firebase-messaging-sw.js"),
    { scope: withBasePath("/") },
  );
}
