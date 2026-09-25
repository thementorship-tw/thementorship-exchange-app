// Next.js 動態產生 JS，Browser 把它註冊成 Service Worker

import {
  firebaseClientConfig,
  isFirebaseClientConfigured,
} from "@/shared/firebase/client-config";

/**
 * Serves the FCM service worker at the site root (`/firebase-messaging-sw.js`)
 * so its default scope covers the whole app, not just `/public`. A plain
 * static file under `public/` can't read env vars, so this is a route
 * handler instead — see docs/notifications/02-realtime-notification-architecture.md.
 *
 * The Firebase Web config is not a secret (see client-config.ts), so it's
 * safe to inline into this script's response body.
 */
export async function GET(): Promise<Response> {
  const body = isFirebaseClientConfigured()
    ? backgroundMessagingScript(firebaseClientConfig)
    : NOOP_SCRIPT;

  return new Response(body, {
    headers: { "Content-Type": "application/javascript; charset=utf-8" },
  });
}

const NOOP_SCRIPT = "// Firebase not configured yet\n";

function backgroundMessagingScript(
  config: typeof firebaseClientConfig,
): string {
  return `importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Data-only payload (no top-level "notification") so this handler is
  // always the one in control of how it's displayed — see push.ts.
  const data = payload.data || {};
  const title = data.title || "The Mentorship Exchange";
  const body = data.body || "";
  const targetHref = data.targetHref || "/home";

  self.registration.showNotification(title, {
    body,
    icon: "/images/logo.png",
    data: { targetHref },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetHref = (event.notification.data && event.notification.data.targetHref) || "/home";
  const targetUrl = new URL(targetHref, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = clientsList.find((client) => client.url === targetUrl);
      if (existing) {
        return existing.focus();
      }
      if (clientsList.length > 0) {
        const client = clientsList[0];
        await client.focus();
        return "navigate" in client ? client.navigate(targetUrl) : undefined;
      }
      const openedClient = await self.clients.openWindow(targetUrl);
      return openedClient ? openedClient.focus() : undefined;
    })(),
  );
});
`;
}
