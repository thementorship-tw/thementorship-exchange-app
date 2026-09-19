import { withApiAuth } from "@/server/api/middleware/auth";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { markContactLogRead } from "@/server/contact-logs/service";

export const PATCH = withApiAuth<RouteContext<"/api/contact-logs/[id]/read">>(
  "PATCH /api/contact-logs/[id]/read",
  async (_request, context, user) => {
    const { id } = await context.params;
    const result = await markContactLogRead(id, user.id);
    if (result.status === "not_found") {
      return apiError(404, "CONTACT_LOG_NOT_FOUND", "Contact log not found");
    }

    return Response.json(
      { data: { id, readAt: result.readAt.toISOString() } },
      { headers: PRIVATE_NO_STORE_HEADERS }, // contactInfo is sensitive, so we don't want it to be cached by any intermediate caches
    );
  },
);
