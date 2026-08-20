// 匯出名稱必須是 proxy 或 default，否則 Next 16 build 會失敗。
// 擋人的判斷在 auth.ts 的 callbacks.authorized；少了它這裡只會附加 session 而不阻擋。
export { auth as proxy } from "@/auth";

export const config = {
  /**
   * 排除項：
   *   api/auth   OAuth callback 擋了會無限重導
   *   login      自訂登入頁
   *   _next      打包後的 CSS / JS（_next/static）與圖片最佳化（_next/image）
   *   $          根路由 /（公開 landing）
   *   *.副檔名    favicon、robots.txt、sitemap.xml、manifest 及 public/ 內的靜態檔案
   *
   * 新增公開路由時記得補進這份清單
   */
  matcher: [
    "/((?!api/auth|login|_next|$|.*\\.(?:ico|png|jpe?g|gif|svg|webp|txt|xml|webmanifest|json)$).*)",
  ],
};
