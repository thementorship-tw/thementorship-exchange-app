import { withApiAuth } from "@/server/api/middleware/auth";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import { markAllContactLogsRead } from "@/server/contact-logs/service";
import { validateMarkAllContactLogsReadQuery } from "@/shared/api/contact-logs/schemas";

export const PATCH = withApiAuth(
  "Failed to mark all contact logs as read",
  async (request, _context, user) => {
    const validation = validateMarkAllContactLogsReadQuery(
      new URL(request.url).searchParams,
    );
    if (!validation.ok) {
      return apiError(
        422,
        "VALIDATION_ERROR",
        "Request validation failed",
        validation.fields,
      );
    }

    const result = await markAllContactLogsRead(
      user.id,
      validation.value.withinDays,
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
