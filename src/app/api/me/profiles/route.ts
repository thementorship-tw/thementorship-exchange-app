import { withApiAuth } from "@/server/api/middleware/auth";
import { PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { listMyExchangeProfiles } from "@/server/exchange-info/exchange-info.repository";
import { serializeMyProfileItem } from "@/server/exchange-info/my-profiles";

/** 設定中心「我的發文」列表（含已下架）。 */
export const GET = withApiAuth(
  "GET /api/me/profiles",
  async (_request, _context, user) => {
    const rows = await listMyExchangeProfiles(user.id);

    return Response.json(
      { data: rows.map(serializeMyProfileItem) },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
