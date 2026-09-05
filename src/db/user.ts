import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";

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
