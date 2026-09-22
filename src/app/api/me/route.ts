import { withApiAuth } from "@/server/api/middleware/auth";
import { parseJsonBody } from "@/server/api/request";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  findSettingsProfileByUserId,
  updateNicknameByUserId,
} from "@/server/auth/user.repository";
import { updateMeSchema } from "@/shared/api/users/schemas";

/** 取得目前登入者的設定中心 Profile 資料。 */
export const GET = withApiAuth(
  "GET /api/me",
  async (_request, _context, user) => {
    const profile = await findSettingsProfileByUserId(user.id);
    if (profile === null) {
      console.error("[api] GET /api/me user missing after auth", user.id);
      return apiError(500, "INTERNAL_ERROR", "Internal server error");
    }

    return Response.json(
      { data: profile },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

/** 更新目前登入者的設定中心 Profile（目前僅支援 nickname）。 */
export const PATCH = withApiAuth(
  "PATCH /api/me",
  async (request, _context, user) => {
    const body = await parseJsonBody(request, updateMeSchema);
    if (!body.ok) return body.response;

    const profile = await updateNicknameByUserId(user.id, body.data.nickname);
    if (profile === null) {
      console.error("[api] PATCH /api/me user missing after auth", user.id);
      return apiError(500, "INTERNAL_ERROR", "Internal server error");
    }

    return Response.json(
      { data: profile },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
