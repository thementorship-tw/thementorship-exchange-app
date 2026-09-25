// callbackUrl 本來是為了改善 UX，但它來自 request/query string，先 normalize/parse，再驗證最後的 origin。防 Open Redirect
import { stripBasePath } from "@/shared/base-path";

const DEFAULT_CALLBACK_URL = "/home";

/** Accept only same-origin paths. Query-string values are always untrusted. */
export function getSafeCallbackUrl(
  value: string | string[] | FormDataEntryValue | null | undefined, // callback URL 可能來自不同來源
  allowedOrigin?: string,
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") {
    return DEFAULT_CALLBACK_URL;
  }

  // WHATWG URL parsing treats backslashes as slashes, so `/\\evil.test` can
  // otherwise become a cross-origin URL in browsers.
  if (candidate.includes("\\")) return DEFAULT_CALLBACK_URL;

  try {
    const isRelative = candidate.startsWith("/"); // 相對路徑
    if (!isRelative && allowedOrigin === undefined) return DEFAULT_CALLBACK_URL; // 絕對路徑但沒有指定 allowedOrigin，直接拒絕

    const base = new URL(allowedOrigin ?? "https://callback.invalid"); // 基準 URL
    const url = isRelative ? new URL(candidate, base) : new URL(candidate);
    if (url.origin !== base.origin) return DEFAULT_CALLBACK_URL;
    // 回傳「不含 basePath」的 app 內部路徑。Auth.js 導回登入頁時帶的 callbackUrl
    // 是含 /exchange 的完整網址，這裡要剝掉，否則 redirect() 會變成 /exchange/exchange/...
    return stripBasePath(`${url.pathname}${url.search}${url.hash}`); // 不需要假的 origin
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
}
