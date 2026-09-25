import { NextRequest } from "next/server";

import { handlers } from "@/auth";
import { stripBasePath, withBasePath } from "@/shared/base-path";

/**
 * Next.js 交給 route handler 的 request 網址不含 basePath（例如是
 * `/api/auth/callback/google`，而不是 `/exchange/api/auth/callback/google`），
 * 但 Auth.js 會拿 pathname 跟 auth.ts 設定的 basePath（`/exchange/api/auth`）
 * 比對來判斷是哪個動作，對不上就直接回 400 "Bad request."。
 *
 * 這裡先把路徑正規化成「一定含 basePath」再交給 Auth.js。先 strip 再加回去，
 * 不管 Next.js 之後的版本會不會自己保留 basePath，結果都一致，不會變成
 * `/exchange/exchange/...`。見 src/shared/base-path.ts。
 */
function toAuthRequest(request: NextRequest): NextRequest {
  const url = new URL(request.url);
  url.pathname = withBasePath(stripBasePath(url.pathname));
  return new NextRequest(url, request);
}

export function GET(request: NextRequest): Promise<Response> {
  return handlers.GET(toAuthRequest(request));
}

export function POST(request: NextRequest): Promise<Response> {
  return handlers.POST(toAuthRequest(request));
}
