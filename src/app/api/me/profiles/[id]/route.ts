import { withApiAuth } from "@/server/api/middleware/auth";
import { parseJsonBody } from "@/server/api/request";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  delistMyExchangeProfile,
  updateMyExchangeProfile,
} from "@/server/exchange-info/exchange-info.repository";
import { serializeMyProfileItem } from "@/server/exchange-info/my-profiles";
import { patchMyProfileSchema } from "@/shared/api/me-profiles/schemas";

/** 更新設定中心「我的發文」：下架或修改內容。 */
export const PATCH = withApiAuth<RouteContext<"/api/me/profiles/[id]">>(
  "PATCH /api/me/profiles/[id]",
  async (request, context, user) => {
    const body = await parseJsonBody(request, patchMyProfileSchema);
    if (!body.ok) return body.response;

    const { id } = await context.params;
    const updated =
      "visible" in body.data
        ? await delistMyExchangeProfile(user.id, id)
        : await updateMyExchangeProfile(user.id, id, body.data);
    if (updated === null) {
      return apiError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    return Response.json(
      { data: serializeMyProfileItem(updated) },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
