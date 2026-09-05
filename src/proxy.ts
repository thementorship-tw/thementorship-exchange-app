// 匯出名稱必須是 proxy 或 default，否則 Next 16 build 會失敗。
export { auth as proxy } from "@/auth";

export const config = {
  /**
   * 只列出需要登入的 URL 前綴，不要使用「除了公開頁以外全擋」的規則。
   * 否則未知路由會在 Next.js 判斷 404 之前被導回登入頁。
   * 新增受保護的頂層路由時，請在這裡加入對應前綴。
   */
  matcher: ["/home/:path*"],
};
