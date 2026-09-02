export type LoginErrorContent = {
  title: string;
  body: string;
};

export const CONSENT_REQUIRED_ERROR = "consent_required";
export const ACCOUNT_DISABLED_ERROR = "account_disabled";
export const SERVER_ERROR = "server_error";
const LOGIN_ERROR_CONTENT: Record<string, LoginErrorContent> = {
  AccessDenied: {
    title: "登入遇到問題了嗎？",
    body: "請先確認你使用報名曼陀號時的帳號登入，如仍無法登入，請點此回報專案小組，我們將儘快與你聯絡。",
  },
  // CHECK: 設計稿尚未定義以下狀態
  // [ACCOUNT_DISABLED_ERROR]: {
  //   title: "這個帳號目前無法使用",
  //   body: "你的帳號已被停用，因此無法登入平台。若你認為這是誤判，請點此回報專案小組。",
  // },
  // [SERVER_ERROR]: {
  //   title: "登入沒有完成",
  //   body: "你的帳號沒有問題，是我們這邊暫時出了狀況，這次登入沒有記錄成功。請稍後再試一次；如果持續發生，請點此回報專案小組。",
  // },
};

export function loginErrorContent(code: string | null): LoginErrorContent {
  const content = code ? LOGIN_ERROR_CONTENT[code] : undefined;
  return content ?? LOGIN_ERROR_CONTENT.AccessDenied;
}
