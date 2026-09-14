import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import type {
  ContactLogDirection,
  ContactLogResponse,
  ContactLogUser,
} from "@/shared/api/contact-logs/types";
import { getDb } from "@/server/db";
import { contactLogs, profiles, users } from "@/server/db/schema";
import type { CreateContactLogValues } from "@/shared/api/contact-logs/schemas";

const fromUsers = alias(users, "from_users");
const toUsers = alias(users, "to_users");

export type ContactLogView = Omit<
  ContactLogResponse,
  "readAt" | "createdAt"
> & {
  readAt: Date | null;
  createdAt: Date;
};

export type CreateContactLogInput = CreateContactLogValues & {
  fromUser: ContactLogUser;
};

export type CreateContactLogResult =
  | { status: "created"; log: ContactLogView }
  | { status: "profile_not_found" }
  | { status: "self_contact_not_allowed" };

export type ListContactLogsInput = {
  userId: string;
  direction: ContactLogDirection;
  page: number;
  pageSize: number;
  unreadOnly: boolean;
  /** 只回傳 createdAt 在過去 N 天內的紀錄；不帶則不限制。 */
  withinDays?: number;
};

export type ListContactLogsResult = {
  logs: ContactLogView[];
  totalItems: number;
};

export type MarkContactLogReadResult =
  { status: "updated"; readAt: Date } | { status: "not_found" };

export async function createContactLog(
  input: CreateContactLogInput,
): Promise<CreateContactLogResult> {
  return getDb().transaction(async (tx) => {
    const [profile] = await tx
      .select({
        id: profiles.id,
        userId: profiles.userId,
        type: profiles.type,
        offersText: profiles.offersText,
        wantsText: profiles.wantsText,
        description: profiles.description,
        toNickname: users.nickname,
        toAvatarUrl: users.avatarUrl,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          eq(profiles.id, input.profileId),
          eq(profiles.visible, true),
          isNull(profiles.deletedAt),
          eq(users.active, true),
        ),
      )
      .limit(1);

    if (profile === undefined) return { status: "profile_not_found" };
    if (profile.userId === input.fromUser.id) {
      return { status: "self_contact_not_allowed" };
    }

    const id = crypto.randomUUID();
    const [created] = await tx
      .insert(contactLogs)
      .values({
        id,
        profileId: profile.id,
        fromUserId: input.fromUser.id,
        toUserId: profile.userId,
        offeredResource: input.offeredResource,
        wantedItem: input.wantedItem,
        motivation: input.motivation,
        contactInfo: input.contactInfo,
        profileTypeSnapshot: profile.type,
        profileOffersSnapshot: profile.offersText,
        profileWantsSnapshot: profile.wantsText,
        profileDescriptionSnapshot: profile.description,
      })
      .returning({ createdAt: contactLogs.createdAt });

    if (created === undefined) {
      throw new Error("Contact log insert did not return the created row");
    }

    return {
      status: "created",
      log: {
        id,
        profileId: profile.id,
        direction: "sent",
        fromUser: input.fromUser,
        toUser: {
          id: profile.userId,
          nickname: profile.toNickname,
          avatarUrl: profile.toAvatarUrl,
        },
        offeredResource: input.offeredResource,
        wantedItem: input.wantedItem,
        motivation: input.motivation,
        contactInfo: input.contactInfo,
        profile: {
          type: profile.type,
          offersText: profile.offersText,
          wantsText: profile.wantsText,
          description: profile.description,
        },
        readAt: null,
        createdAt: created.createdAt,
      },
    };
  });
}

export async function listContactLogs(
  input: ListContactLogsInput,
): Promise<ListContactLogsResult> {
  const ownerCondition =
    input.direction === "sent"
      ? eq(contactLogs.fromUserId, input.userId)
      : eq(contactLogs.toUserId, input.userId);
  const conditions = [ownerCondition];
  if (input.direction === "received" && input.unreadOnly) {
    conditions.push(isNull(contactLogs.readAt));
  }
  if (input.withinDays !== undefined) {
    const cutoff = new Date(
      Date.now() - input.withinDays * 24 * 60 * 60 * 1000,
    );
    conditions.push(gte(contactLogs.createdAt, cutoff));
  }
  const where = and(...conditions);
  const db = getDb();

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: contactLogs.id,
        profileId: contactLogs.profileId,
        fromUserId: fromUsers.id,
        fromNickname: fromUsers.nickname,
        fromAvatarUrl: fromUsers.avatarUrl,
        toUserId: toUsers.id,
        toNickname: toUsers.nickname,
        toAvatarUrl: toUsers.avatarUrl,
        offeredResource: contactLogs.offeredResource,
        wantedItem: contactLogs.wantedItem,
        motivation: contactLogs.motivation,
        contactInfo: contactLogs.contactInfo,
        profileType: contactLogs.profileTypeSnapshot,
        profileOffersText: contactLogs.profileOffersSnapshot,
        profileWantsText: contactLogs.profileWantsSnapshot,
        profileDescription: contactLogs.profileDescriptionSnapshot,
        readAt: contactLogs.readAt,
        createdAt: contactLogs.createdAt,
      })
      .from(contactLogs)
      .innerJoin(fromUsers, eq(contactLogs.fromUserId, fromUsers.id))
      .innerJoin(toUsers, eq(contactLogs.toUserId, toUsers.id))
      .where(where)
      .orderBy(desc(contactLogs.createdAt), desc(contactLogs.id))
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize),
    db.select({ value: count() }).from(contactLogs).where(where),
  ]);

  return {
    logs: rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      direction: input.direction,
      fromUser: {
        id: row.fromUserId,
        nickname: row.fromNickname,
        avatarUrl: row.fromAvatarUrl,
      },
      toUser: {
        id: row.toUserId,
        nickname: row.toNickname,
        avatarUrl: row.toAvatarUrl,
      },
      offeredResource: row.offeredResource,
      wantedItem: row.wantedItem,
      motivation: row.motivation,
      contactInfo: row.contactInfo,
      profile: {
        type: row.profileType,
        offersText: row.profileOffersText,
        wantsText: row.profileWantsText,
        description: row.profileDescription,
      },
      readAt: row.readAt,
      createdAt: row.createdAt,
    })),
    totalItems: totals[0]?.value ?? 0,
  };
}

export async function markContactLogRead(
  id: string,
  toUserId: string,
): Promise<MarkContactLogReadResult> {
  return getDb().transaction(async (tx) => {
    const now = new Date();
    // 1. 這筆資料「還沒讀」→ 要真的 UPDATE
    const [updated] = await tx
      .update(contactLogs)
      .set({ readAt: now })
      .where(
        and(
          eq(contactLogs.id, id),
          eq(contactLogs.toUserId, toUserId),
          isNull(contactLogs.readAt),
        ),
      )
      .returning({ readAt: contactLogs.readAt });

    if (updated?.readAt !== null && updated?.readAt !== undefined) {
      return { status: "updated", readAt: updated.readAt };
    }

    // 2. 這筆資料「早就讀過」→ 不用 UPDATE，但仍然要算成功
    const [existing] = await tx
      .select({ readAt: contactLogs.readAt })
      .from(contactLogs)
      .where(and(eq(contactLogs.id, id), eq(contactLogs.toUserId, toUserId)))
      .limit(1);

    if (existing?.readAt !== null && existing?.readAt !== undefined) {
      return { status: "updated", readAt: existing.readAt };
    }

    return { status: "not_found" };
  });
}

export type MarkAllContactLogsReadResult = {
  updatedCount: number;
  readAt: Date;
};

export async function markAllContactLogsRead(
  toUserId: string,
  withinDays?: number,
): Promise<MarkAllContactLogsReadResult> {
  const now = new Date();
  const conditions = [
    eq(contactLogs.toUserId, toUserId),
    isNull(contactLogs.readAt),
  ];
  if (withinDays !== undefined) {
    const cutoff = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);
    conditions.push(gte(contactLogs.createdAt, cutoff));
  }

  const updated = await getDb()
    .update(contactLogs)
    .set({ readAt: now })
    .where(and(...conditions))
    .returning({ id: contactLogs.id });

  return { updatedCount: updated.length, readAt: now };
}
