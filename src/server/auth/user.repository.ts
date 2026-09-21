import { eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import { type MemberGroup, users } from "@/server/db/schema";
import type { SettingsProfile } from "@/shared/api/users/schemas";

export type SessionUser = {
  id: string;
  active: boolean;
  email: string;
  nickname: string;
  avatarUrl: string | null;
};

export async function findUserBySub(sub: string): Promise<SessionUser | null> {
  if (!sub) return null;

  const [user] = await getDb()
    .select({
      id: users.id,
      active: users.active,
      email: users.email,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.sub, sub))
    .limit(1);

  return user ?? null;
}

export async function findMemberGroupByUserId(
  userId: string,
): Promise<MemberGroup | null> {
  const [row] = await getDb()
    .select({ group: users.group })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.group ?? null;
}

/** 設定中心 Profile 區塊：Google 原名、組別、暱稱與頭像。 */
export async function findSettingsProfileByUserId(
  userId: string,
): Promise<SettingsProfile | null> {
  const [profile] = await getDb()
    .select({
      googleName: users.googleName,
      group: users.group,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (profile === undefined) return null;

  return {
    ...profile,
    avatarUrl: profile.avatarUrl ?? null,
  };
}

export async function updateNicknameByUserId(
  userId: string,
  nickname: string,
): Promise<SettingsProfile | null> {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({ nickname, updatedBy: userId })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (updated === undefined) return null;

  return findSettingsProfileByUserId(userId);
}
