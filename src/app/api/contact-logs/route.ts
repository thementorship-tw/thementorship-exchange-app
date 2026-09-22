import { after } from "next/server";

import { findMemberGroupByUserId } from "@/server/auth/user.repository";
import { withApiAuth } from "@/server/api/middleware/auth";
import { parseJsonBody, parseQuery } from "@/server/api/request";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  createContactLog,
  listContactLogs,
  type ContactLogView,
} from "@/server/contact-logs/service";
import { sendContactLogPushNotification } from "@/server/notifications/push";
import {
  contactLogListQuerySchema,
  createContactLogSchema,
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
  "POST /api/contact-logs",
  async (request, _context, user) => {
    const body = await parseJsonBody(request, createContactLogSchema);
    if (!body.ok) return body.response;

    const group = await findMemberGroupByUserId(user.id);
    if (group === null) {
      throw new Error(`Member group missing for user ${user.id}`);
    }

    const result = await createContactLog({
      ...body.data,
      fromUser: {
        id: user.id,
        nickname: user.nickname,
        group,
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
    if (result.status === "duplicate_contact_today") {
      return apiError(
        409,
        "DUPLICATE_CONTACT_TODAY",
        "You already applied to this profile today",
      );
    }

    after(() =>
      sendContactLogPushNotification({
        toUserId: result.log.toUser.id,
        fromUserNickname: result.log.fromUser.nickname,
        targetHref: "/home",
      }),
    );

    return Response.json(
      { data: serializeContactLog(result.log) },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

export const GET = withApiAuth(
  "GET /api/contact-logs",
  async (request, _context, user) => {
    const { searchParams } = new URL(request.url);
    const validation = parseQuery(contactLogListQuerySchema, {
      role: searchParams.get("role") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      unread: searchParams.get("unread") ?? undefined,
      profileId: searchParams.get("profileId") ?? undefined,
      withinDays: searchParams.get("withinDays") ?? undefined,
    });
    if (!validation.ok) return validation.response;

    const { direction, page, pageSize, unreadOnly, profileId, withinDays } =
      validation.data;
    const result = await listContactLogs({
      userId: user.id,
      direction,
      page,
      pageSize,
      unreadOnly,
      profileId,
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
