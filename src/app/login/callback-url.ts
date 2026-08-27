// callbackUrl 本來是為了改善 UX，但它來自 request/query string，先 normalize/parse，再驗證最後的 origin。防 Open Redirect
const DEFAULT_CALLBACK_URL = "/home";

/** Accept only same-origin paths. Query-string values are always untrusted. */
export function getSafeCallbackUrl(
  value: string | string[] | FormDataEntryValue | null | undefined, // callback URL 可能來自不同來源
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string" || !candidate.startsWith("/")) {
    return DEFAULT_CALLBACK_URL;
  }

  // WHATWG URL parsing treats backslashes as slashes, so `/\\evil.test` can
  // otherwise become a cross-origin URL in browsers.
  if (candidate.includes("\\")) return DEFAULT_CALLBACK_URL;

  try {
    const base = new URL("https://callback.invalid"); // 基準 URL
    const url = new URL(candidate, base);
    if (url.origin !== base.origin) return DEFAULT_CALLBACK_URL;
    return `${url.pathname}${url.search}${url.hash}`; // 不需要假的 origin
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
}
