import { and, eq, ne } from "drizzle-orm";

import type { ConsentReceipt } from "@/consent-receipt";
import { getDb } from "@/db";
import { insertConsentLog } from "@/db/consent";
import { users } from "@/db/schema";
import { normalizeEmail } from "@/db/whitelist";

export type LoginInput = {
  sub: string;
  email: string;
  googleName: string;
  avatarUrl: string | null;
  session: number;
  receipt: ConsentReceipt;
};

export type ReturningLoginInput = {
  userId: string;
  email: string;
  googleName: string;
  avatarUrl: string | null;
  receipt: ConsentReceipt;
};

export type ReturningLoginResult = {
  /** true 代表此 Google 信箱已被其他帳號占用，`users.email` 保留原值。 */
  emailConflict: boolean;
};

/**
 * 首次登入：建立平台帳號並寫入同意紀錄。
 */
export async function createUserOnFirstLogin(input: LoginInput): Promise<void> {
  const email = normalizeEmail(input.email);
  const now = new Date();
  const userId = crypto.randomUUID();

  return getDb().transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      sub: input.sub,
      email,
      session: input.session,
      googleName: input.googleName,
      // 暱稱首次建檔時預設為 Google 姓名，之後由使用者自行修改。
      nickname: input.googleName,
      avatarUrl: input.avatarUrl,
      lastLoginAt: now,
      createdBy: userId,
    });

    await insertConsentLog(tx, { userId, ...input.receipt });
  });
}

/**
 * 既有帳號登入：同步 Google 端資料、更新最後登入時間，並補上這次勾選的同意紀錄。
 */
export async function recordReturningLogin(
  input: ReturningLoginInput,
): Promise<ReturningLoginResult> {
  const email = normalizeEmail(input.email);
  const now = new Date();

  return getDb().transaction(async (tx) => {
    const [conflictingUser] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, input.userId)))
      .limit(1);
    const emailConflict = conflictingUser !== undefined;

    await tx
      .update(users)
      .set({
        ...(emailConflict ? {} : { email }),
        googleName: input.googleName,
        avatarUrl: input.avatarUrl,
        lastLoginAt: now,
      })
      .where(eq(users.id, input.userId));

    await insertConsentLog(tx, { userId: input.userId, ...input.receipt });

    return { emailConflict };
  });
}
