/** CHECK: 回報管道網址待確認 */
const CONTACT_URL = "mailto:contact@example.com";

type LoginErrorBodyPart = string | { text: string; href: string };

export type LoginErrorContent = {
  title: string;
  body: LoginErrorBodyPart[];
};

export const LOGIN_ERROR = {
  ACCESS_DENIED: "AccessDenied",
  CONSENT_REQUIRED: "consent_required",
  ACCOUNT_DISABLED: "account_disabled",
  SERVER_ERROR: "server_error",
} as const;

export type LoginErrorCode = (typeof LOGIN_ERROR)[keyof typeof LOGIN_ERROR];

const DEFAULT_LOGIN_ERROR = LOGIN_ERROR.ACCESS_DENIED;

const LOGIN_ERROR_CONTENT: Record<LoginErrorCode, LoginErrorContent> = {
  [LOGIN_ERROR.ACCESS_DENIED]: {
    title: "登入遇到問題了嗎？",
    body: [
      "請先確認你使用報名曼陀號時的帳號登入，如仍無法登入，",
      { text: "請點此回報專案小組", href: CONTACT_URL },
      "，我們將儘快與你聯絡。",
    ],
  },
  // CHECK: 設計稿尚未定義以下狀態
  [LOGIN_ERROR.CONSENT_REQUIRED]: {
    title: "請重新確認同意",
    body: ["登入期間未能取得你的條款同意紀錄，請重新勾選同意後再登入一次。"],
  },
  [LOGIN_ERROR.ACCOUNT_DISABLED]: {
    title: "這個帳號目前無法使用",
    body: ["你的帳號已被停用。若你認為這是誤判，請回報專案小組。"],
  },
  [LOGIN_ERROR.SERVER_ERROR]: {
    title: "登入沒有完成",
    body: ["系統暫時發生問題，請稍後再試；如果持續發生，請回報專案小組。"],
  },
};

export function loginErrorContent(code: string | null): LoginErrorContent {
  if (code && code in LOGIN_ERROR_CONTENT) {
    return LOGIN_ERROR_CONTENT[code as LoginErrorCode];
  }

  return LOGIN_ERROR_CONTENT[DEFAULT_LOGIN_ERROR];
}
