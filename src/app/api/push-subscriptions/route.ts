import { withApiAuth } from "@/server/api/middleware/auth";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  deactivatePushSubscription,
  upsertPushSubscription,
} from "@/server/push-subscriptions/service";
import {
  validateDeactivatePushSubscription,
  validateRegisterPushSubscription,
} from "@/shared/api/push-subscriptions/schemas";

export const POST = withApiAuth(
  "Failed to register push subscription",
  async (request, _context, user) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const validation = validateRegisterPushSubscription(body);
    if (!validation.ok) {
      return apiError(
        422,
        "VALIDATION_ERROR",
        "Request validation failed",
        validation.fields,
      );
    }

    await upsertPushSubscription({
      userId: user.id,
      fcmToken: validation.value.fcmToken,
      userAgent: request.headers.get("user-agent"),
    });

    return Response.json(
      { data: { registered: true } },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

export const DELETE = withApiAuth(
  "Failed to deactivate push subscription",
  async (request, _context, user) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const validation = validateDeactivatePushSubscription(body);
    if (!validation.ok) {
      return apiError(
        422,
        "VALIDATION_ERROR",
        "Request validation failed",
        validation.fields,
      );
    }

    const result = await deactivatePushSubscription(
      user.id,
      validation.value.fcmToken,
    );
    if (result.status === "not_found") {
      return apiError(
        404,
        "PUSH_SUBSCRIPTION_NOT_FOUND",
        "Push subscription not found",
      );
    }

    return Response.json(
      { data: { deactivated: true } },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);
