import { withApiAuth } from "@/server/api/middleware/auth";
import { parseJsonBody } from "@/server/api/request";
import { apiError, PRIVATE_NO_STORE_HEADERS } from "@/server/api/response";
import {
  deactivatePushSubscription,
  upsertPushSubscription,
} from "@/server/push-subscriptions/service";
import { pushSubscriptionSchema } from "@/shared/api/push-subscriptions/schemas";

export const POST = withApiAuth(
  "POST /api/push-subscriptions",
  async (request, _context, user) => {
    const body = await parseJsonBody(request, pushSubscriptionSchema);
    if (!body.ok) return body.response;

    await upsertPushSubscription({
      userId: user.id,
      fcmToken: body.data.fcmToken,
      userAgent: request.headers.get("user-agent"),
    });

    return Response.json(
      { data: { registered: true } },
      { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
    );
  },
);

export const DELETE = withApiAuth(
  "DELETE /api/push-subscriptions",
  async (request, _context, user) => {
    const body = await parseJsonBody(request, pushSubscriptionSchema);
    if (!body.ok) return body.response;

    const result = await deactivatePushSubscription(
      user.id,
      body.data.fcmToken,
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
