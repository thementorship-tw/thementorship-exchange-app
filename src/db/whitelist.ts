import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { whitelist, type WhitelistEntry } from "@/db/schema";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findActiveWhitelistEntry(
  email: string,
): Promise<WhitelistEntry | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const [entry] = await getDb()
    .select()
    .from(whitelist)
    .where(
      and(eq(whitelist.email, normalizedEmail), eq(whitelist.active, true)),
    )
    .limit(1);

  return entry ?? null;
}
