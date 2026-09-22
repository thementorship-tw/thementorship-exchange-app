import { withApiAuth } from "@/server/api/middleware/auth";
import { PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { getExchangeInfoAvailability } from "@/server/exchange-info/service";

/** 目前使用者已刊登與仍可刊登的貼文類型。 */
export const GET = withApiAuth(
  "GET /api/exchange-info/availability",
  async (_request, _context, user) => {
    const availability = await getExchangeInfoAvailability(user.id);

    return Response.json(
      { data: availability },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
