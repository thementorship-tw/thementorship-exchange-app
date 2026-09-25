import { isFirebaseAdminConfigured } from "@/env";
import { getFirebaseMessaging } from "@/server/firebase/admin";
import {
  deactivateTokens,
  listActiveTokensForUser,
} from "@/server/push-subscriptions/service";
import { PROFILE_TYPE_LABELS, type ProfileType } from "@/shared/profile-types";

const INVALID_TOKEN_ERROR_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

export type ContactLogPushInput = {
  toUserId: string;
  fromUserNickname: string;
  profileType: ProfileType;
  targetHref: string;
};

/**
 * Fire-and-forget: never throws, so a Firebase outage can't break contact
 * log creation (see docs/notifications/02-realtime-notification-architecture.md
 * §2.1). Data-only payload (no top-level `notification` field) so the
 * service worker's `onBackgroundMessage` always controls how it's
 * displayed, and so payload never carries `contactInfo`/`motivation`.
 */
// 當 A 對 B 送出「我想聊」後，Server 找出 B 所有有效的 FCM Token → 透過 Firebase Admin 發 Push → 如果 Firebase 回報某些 Token 已失效，就把它們停用；整個 Push 流程失敗也不能影響原本 contact log 的建立。
export async function sendContactLogPushNotification(
  input: ContactLogPushInput,
): Promise<void> {
  if (!isFirebaseAdminConfigured()) return;

  try {
    // 找出這個 User 目前還有效、應該嘗試發送的所有裝置 Token
    const tokens = await listActiveTokensForUser(input.toUserId);
    if (tokens.length === 0) return;

    // Server-side Firebase Admin SDK
    const response = await getFirebaseMessaging().sendEachForMulticast({
      tokens,
      data: {
        title: `${input.fromUserNickname} 想和你交換「${PROFILE_TYPE_LABELS[input.profileType]}」`,
        body: "快去看看他的申請。",
        targetHref: input.targetHref,
      }, // data-only + SW 工程上的控制權與後續擴充性
    });

    console.log(
      `[push] sent to ${tokens.length} token(s): ${response.successCount} succeeded, ${response.failureCount} failed`,
    );
    for (const [index, result] of response.responses.entries()) {
      if (!result.success) {
        console.error(
          `[push] token #${index} failed: ${result.error?.code} ${result.error?.message}`,
        );
      }
    }

    const invalidTokens = response.responses
      .map((result, index) => ({ result, token: tokens[index] }))
      .filter(
        (entry): entry is { result: typeof entry.result; token: string } =>
          entry.token !== undefined &&
          !entry.result.success &&
          entry.result.error !== undefined &&
          INVALID_TOKEN_ERROR_CODES.has(entry.result.error.code),
      )
      .map(({ token }) => token);

    await deactivateTokens(invalidTokens);
  } catch (error: unknown) {
    // Push notification 是 secondary side effect，不能讓主要 transaction / request 因此失敗
    console.error("[push] Failed to send contact log push notification", error);
  }
}
