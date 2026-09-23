type ApiErrorBody = {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
};

/**
 * 錯誤回應不保證是 JSON（例如路由不存在時 Next.js 會回 HTML 404 頁面），
 * 直接 `response.json()` 會丟錯並讓真正的失敗原因消失。解析不到結構化錯誤
 * 時回傳空物件，並把狀態碼留在 console 方便追查。
 */
export async function readApiError(response: Response): Promise<ApiErrorBody> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (body.error?.message === undefined) {
    console.error("[settings] 非預期的錯誤回應", response.status, response.url);
  }

  return body;
}
