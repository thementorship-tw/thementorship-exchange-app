import { withApiAuth } from "@/server/api/middleware/auth";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  createContactLog,
  listContactLogs,
  type ContactLogView,
} from "@/server/contact-logs/service";
import {
  validateContactLogListQuery,
  validateCreateContactLog,
} from "@/shared/api/contact-logs/schemas";
import type { ContactLogResponse } from "@/shared/api/contact-logs/types";

// 將 Date 物件轉換為 ISO 字串
function serializeContactLog(log: ContactLogView): ContactLogResponse {
  return {
    ...log,
    readAt: log.readAt?.toISOString() ?? null,
    createdAt: log.createdAt.toISOString(),
  };
}

export const POST = withApiAuth(
  "Failed to create contact log",
  async (request, _context, user) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const validation = validateCreateContactLog(body);
    if (!validation.ok) {
      return apiError(
        422,
        "VALIDATION_ERROR",
        "Request validation failed",
        validation.fields,
      );
    }

    const result = await createContactLog({
      ...validation.value,
      fromUser: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    });

    if (result.status === "profile_not_found") {
      return apiError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }
    if (result.status === "self_contact_not_allowed") {
      return apiError(
        409,
        "SELF_CONTACT_NOT_ALLOWED",
        "You cannot contact your own profile",
      );
    }

    return Response.json(
      { data: serializeContactLog(result.log) },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

export const GET = withApiAuth(
  "Failed to list contact logs",
  async (request, _context, user) => {
    const validation = validateContactLogListQuery(
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

    const { direction, page, pageSize, unreadOnly, withinDays } =
      validation.value;
    const result = await listContactLogs({
      userId: user.id,
      direction,
      page,
      pageSize,
      unreadOnly,
      withinDays,
    });

    return Response.json(
      {
        data: result.logs.map(serializeContactLog),
        pagination: {
          page,
          pageSize,
          totalItems: result.totalItems,
          totalPages: Math.ceil(result.totalItems / pageSize),
        },
      },
      { headers: PRIVATE_NO_STORE_HEADERS }, // contactInfo is sensitive, so we don't want it to be cached by any intermediate caches
    );
  },
);
