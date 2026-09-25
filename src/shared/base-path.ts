/**
 * 這個 app 透過官網（www.thementorship.tw）的 rewrite 掛在 `/exchange` 底下，
 * 並用 next.config.ts 的 `basePath` 讓 Next.js 知道自己住在這個子路徑。
 *
 * Next.js 會自動幫這些加上 basePath，不需要用 withBasePath()：
 *   - `<Link href>`、`router.push()`、`redirect()`
 *   - `/_next/*` 靜態資源
 *
 * 這些 Next.js 管不到，必須用 withBasePath()：
 *   - `fetch("/api/...")`
 *   - `next/image`、`<img>` 的字串 src（例如 `/images/logo.png`）
 *   - 交給 Auth.js 的網址（`redirectTo`、`pages`、signIn callback 回傳值）
 *   - Service Worker 註冊路徑、SW 內的跳轉網址、manifest 相關設定
 *
 * 路徑前綴要改名時，只改這裡的 BASE_PATH（以及 public/manifest.json）。
 */
export const BASE_PATH = "/exchange";

/** 把 app 內的絕對路徑（以 `/` 開頭）加上 basePath。 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

/**
 * 移除路徑開頭的 basePath，還原成 app 內部使用的路徑。
 * 用在讀回 Auth.js 寫入的 callback-url cookie（它存的是含 basePath 的完整路徑）。
 */
export function stripBasePath(path: string): string {
  if (path === BASE_PATH) return "/";
  if (path.startsWith(`${BASE_PATH}/`)) return path.slice(BASE_PATH.length);
  if (path.startsWith(`${BASE_PATH}?`) || path.startsWith(`${BASE_PATH}#`)) {
    return `/${path.slice(BASE_PATH.length)}`;
  }
  return path;
}
