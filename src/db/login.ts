import { eq } from "drizzle-orm";

import type { ConsentReceipt } from "@/consent-receipt";
import { getDb } from "@/db";
import { consentLogs, users } from "@/db/schema";
import { normalizeEmail } from "@/db/whitelist";

export type LoginInput = {
  sub: string;
  email: string;
  googleName: string;
  avatarUrl: string | null;
  session: number;
  receipt: ConsentReceipt;
};

export async function recordLogin(input: LoginInput): Promise<void> {
  const email = normalizeEmail(input.email);
  const now = new Date();

  return getDb().transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: users.id, updatedAt: users.updatedAt })
      .from(users)
      .where(eq(users.sub, input.sub))
      .limit(1);

    let userId: string;

    if (existing === undefined) {
      userId = crypto.randomUUID();

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
    } else {
      userId = existing.id;

      await tx
        .update(users)
        .set({
          lastLoginAt: now,
          updatedAt: existing.updatedAt,
        })
        .where(eq(users.id, userId));
    }

    await tx
      .insert(consentLogs)
      .values({
        userId,
        termsVersion: input.receipt.termsVersion,
        privacyVersion: input.receipt.privacyVersion,
        agreedAt: input.receipt.agreedAt,
      })
      .onConflictDoNothing();
  });
}
