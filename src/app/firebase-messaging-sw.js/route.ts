// Next.js 動態產生 JS，Browser 把它註冊成 Service Worker

import { BASE_PATH } from "@/shared/base-path";
import {
  firebaseClientConfig,
  isFirebaseClientConfigured,
} from "@/shared/firebase/client-config";

/**
 * Serves the app's one and only service worker at
 * `/exchange/firebase-messaging-sw.js` (basePath included) so its scope
 * covers the whole app, not just `/public`. It bundles two unrelated jobs
 * into a single script only because a given scope can have exactly one
 * active service worker — registering a second script at the same scope
 * would silently replace this one rather than run alongside it:
 *
 *   1. FCM background push notifications (skipped if Firebase isn't
 *      configured).
 *   2. Falling back to `offline.html` when a full-page navigation fails
 *      with no network, instead of the browser/OS's own offline screen.
 *      It only ever caches that one static page — never JS bundles or API
 *      responses — so there's no stale-data risk from it.
 *
 * A plain static file under `public/` can't read env vars for the FCM
 * config, so this is a route handler instead — see
 * docs/notifications/02-realtime-notification-architecture.md.
 *
 * The Firebase Web config is not a secret (see client-config.ts), so it's
 * safe to inline into this script's response body.
 */
export async function GET(): Promise<Response> {
  const messagingScript = isFirebaseClientConfigured()
    ? backgroundMessagingScript(firebaseClientConfig)
    : "// Firebase not configured yet\n";

  const body = `const BASE_PATH = ${JSON.stringify(BASE_PATH)};

${messagingScript}
${offlineFallbackScript()}`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // 沒有這行的話瀏覽器／CDN 可能沿用舊版腳本內容去比對「有沒有更新」，
      // 導致部署新版之後裝置端一直裝不到新的 SW。
      "Cache-Control": "no-cache",
    },
  });
}

function backgroundMessagingScript(
  config: typeof firebaseClientConfig,
): string {
  return `importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

// push payload 的 targetHref 是不含 basePath 的 app 內部路徑（跟站內 <Link> 共用），
// 所以在 SW 這裡組成完整網址時要補上。
const DEFAULT_TARGET_HREF = BASE_PATH + "/home";

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Data-only payload (no top-level "notification") so this handler is
  // always the one in control of how it's displayed — see push.ts.
  const data = payload.data || {};
  const title = data.title || "The Mentorship Exchange";
  const body = data.body || "";
  const targetHref = data.targetHref ? BASE_PATH + data.targetHref : DEFAULT_TARGET_HREF;

  self.registration.showNotification(title, {
    body,
    icon: BASE_PATH + "/images/logo.png",
    data: { targetHref },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetHref = (event.notification.data && event.notification.data.targetHref) || DEFAULT_TARGET_HREF;
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

/**
 * 離線時整頁導覽（開啟 App、重新整理）會直接失敗，沒有這段的話使用者看到的
 * 會是系統或瀏覽器原生的斷線畫面。這裡只快取固定的一支靜態頁面
 * （public/offline.html），完全不碰 JS bundle 或 API 回應，所以不會有版本
 * 錯位或吃到舊資料的風險——只有在 fetch 真的失敗時才 fallback 顯示。
 */
function offlineFallbackScript(): string {
  return `const OFFLINE_CACHE_PREFIX = "exchange-offline-fallback-";
const OFFLINE_CACHE_NAME = OFFLINE_CACHE_PREFIX + "v3";
const OFFLINE_URL = new URL(BASE_PATH + "/offline.html", self.location.origin).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      // offline.html 是純靜態頁、不引用任何圖片，只快取這一支就夠了——
      // 之前連帶快取的裝飾用圖片，離線時瀏覽器對它們的請求不會經過這裡的
      // fetch handler（只攔截 navigate），快取了也用不到，反而看起來像圖片壞了。
      await cache.add(OFFLINE_URL);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(OFFLINE_CACHE_PREFIX) && key !== OFFLINE_CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(OFFLINE_CACHE_NAME);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      }
    })(),
  );
});
`;
}
