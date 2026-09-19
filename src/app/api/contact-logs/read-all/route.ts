import { withApiAuth } from "@/server/api/middleware/auth";
import { parseQuery } from "@/server/api/request";
import { PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { markAllContactLogsRead } from "@/server/contact-logs/service";
import { markAllContactLogsReadQuerySchema } from "@/shared/api/contact-logs/schemas";

export const PATCH = withApiAuth(
  "PATCH /api/contact-logs/read-all",
  async (request, _context, user) => {
    const { searchParams } = new URL(request.url);
    const validation = parseQuery(markAllContactLogsReadQuerySchema, {
      withinDays: searchParams.get("withinDays") ?? undefined,
    });
    if (!validation.ok) return validation.response;

    const result = await markAllContactLogsRead(
      user.id,
      validation.data.withinDays,
    );

    return Response.json(
      {
        data: {
          updatedCount: result.updatedCount,
          readAt: result.readAt.toISOString(),
        },
      },
      { headers: PRIVATE_NO_STORE_HEADERS }, // contactInfo is sensitive, so we don't want it to be cached by any intermediate caches
    );
  },
);
