import { withApiAuth } from "@/server/api/middleware/auth";
import { parseJsonBody } from "@/server/api/request";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { delistMyExchangeProfile } from "@/server/exchange-info/exchange-info.repository";
import { serializeMyProfileItem } from "@/server/exchange-info/my-profiles";
import {
  DuplicateProfileTypeError,
  updateExchangeInfoContent,
} from "@/server/exchange-info/service";
import { patchMyProfileSchema } from "@/shared/api/me-profiles/schemas";

/** 更新設定中心「我的發文」：下架或修改內容（含換分類）。 */
export const PATCH = withApiAuth<RouteContext<"/api/me/profiles/[id]">>(
  "PATCH /api/me/profiles/[id]",
  async (request, context, user) => {
    const body = await parseJsonBody(request, patchMyProfileSchema);
    if (!body.ok) return body.response;

    const { id } = await context.params;

    let updated;
    try {
      updated =
        "visible" in body.data
          ? await delistMyExchangeProfile(user.id, id)
          : await updateExchangeInfoContent(user.id, id, body.data);
    } catch (error) {
      if (error instanceof DuplicateProfileTypeError) {
        return apiError(
          409,
          "DUPLICATE_PROFILE_TYPE",
          "A profile of this type already exists",
        );
      }
      throw error;
    }
    if (updated === null) {
      return apiError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    return Response.json(
      { data: serializeMyProfileItem(updated) },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
