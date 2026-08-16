// 匯出名稱必須是 proxy 或 default，否則 Next 16 build 會失敗。
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/home/:path*"],
};
