import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/server/db";
import { pushSubscriptions } from "@/server/db/schema";

/**
 * 同一個 fcmToken 可能因為裝置換人登入（例如共用電腦）而重新綁定到不同
 * userId；`fcmToken` 是 unique，衝突時直接改綁到目前使用者並重新啟用。
 */
export async function upsertPushSubscription(input: {
  userId: string;
  fcmToken: string;
  userAgent: string | null;
}): Promise<void> {
  await getDb()
    .insert(pushSubscriptions)
    .values({
      userId: input.userId,
      fcmToken: input.fcmToken,
      userAgent: input.userAgent,
      active: true,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.fcmToken,
      set: {
        userId: input.userId,
        userAgent: input.userAgent,
        active: true,
        deactivatedAt: null,
      },
    });
}

export type DeactivatePushSubscriptionResult =
  { status: "deactivated" } | { status: "not_found" };

/** 只允許使用者停用自己名下的 token。 */
export async function deactivatePushSubscription(
  userId: string,
  fcmToken: string,
): Promise<DeactivatePushSubscriptionResult> {
  const updated = await getDb()
    .update(pushSubscriptions)
    .set({ active: false, deactivatedAt: new Date() })
    .where(
      and(
        eq(pushSubscriptions.fcmToken, fcmToken),
        eq(pushSubscriptions.userId, userId),
      ),
    )
    .returning({ id: pushSubscriptions.id });

  return updated.length > 0
    ? { status: "deactivated" }
    : { status: "not_found" };
}

export async function listActiveTokensForUser(
  userId: string,
): Promise<string[]> {
  const rows = await getDb()
    .select({ fcmToken: pushSubscriptions.fcmToken })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.active, true),
      ),
    );
  return rows.map((row) => row.fcmToken);
}

/** FCM 回報無效（unregistered/invalid）的 token 一律停用，避免下次還嘗試發送。 */
export async function deactivateTokens(fcmTokens: string[]): Promise<void> {
  if (fcmTokens.length === 0) return;
  await getDb()
    .update(pushSubscriptions)
    .set({ active: false, deactivatedAt: new Date() })
    .where(inArray(pushSubscriptions.fcmToken, fcmTokens));
}
