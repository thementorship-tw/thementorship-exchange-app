import { apiError } from "@/server/api/response";
import { resolveActiveUser } from "@/auth";
import type { SessionUser } from "@/server/auth/user.repository";

type AuthenticatedApiHandler<TContext> = (
  request: Request,
  context: TContext,
  user: SessionUser,
) => Promise<Response>;

/**
 * Route Handler 的共通身分驗證與錯誤邊界。
 * 資源層級的授權（例如紀錄是否屬於使用者）仍由各功能自行處理。
 */
export function withApiAuth<TContext = unknown>(
  logLabel: string,
  handler: AuthenticatedApiHandler<TContext>,
): (request: Request, context: TContext) => Promise<Response> {
  return async (request, context) => {
    try {
      const auth = await resolveActiveUser();
      if (!auth.ok) {
        switch (auth.reason) {
          case "account_inactive":
            return apiError(403, "ACCOUNT_INACTIVE", "Account is inactive");
          case "consent_required":
            return apiError(
              403,
              "CONSENT_REQUIRED",
              "Current consent is required",
            );
          case "unauthenticated":
          case "user_not_found":
            return apiError(401, "UNAUTHENTICATED", "Authentication required");
        }
      }

      return await handler(request, context, auth.user);
    } catch (error) {
      console.error(`[api] ${logLabel}`, error);
      return apiError(500, "INTERNAL_ERROR", "Internal server error");
    }
  };
}
