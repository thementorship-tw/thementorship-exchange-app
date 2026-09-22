import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { getDb } from "@/server/db";
import { contactLogs, profiles, users } from "@/server/db/schema";
import { CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS } from "@/shared/api/contact-logs/constants";
import {
  EXCHANGE_INFO_PAGE_SIZE,
  type CreateExchangeInfoInput,
  type ExchangeInfoListResponseItem,
  type ExchangeInfoSortOrder,
} from "@/shared/api/exchange-info/schemas";
import type { ProfileType } from "@/shared/profile-types";

/** 與 API 回傳的單筆資料相同，只是 createdAt 在 server 端還是 Date。 */
export type ExchangeInfoListItem = Omit<
  ExchangeInfoListResponseItem,
  "createdAt"
> & {
  createdAt: Date;
};

type Author = ExchangeInfoListItem["author"];

export type ExchangeInfoCursor = { createdAt: Date; id: string };

export type ListExchangeInfoOptions = {
  viewerUserId: string;
  types: ProfileType[];
  /** 比對標題（我能提供、我想找）與展開後的內文。 */
  keyword?: string;
  sort: ExchangeInfoSortOrder;
  cursor?: ExchangeInfoCursor;
};

/** cursor 是拿最後一筆的 createdAt（單位：秒）與 id，用 base64url 包起來。 */
export function encodeExchangeInfoCursor({
  createdAt,
  id,
}: ExchangeInfoCursor): string {
  const seconds = Math.floor(createdAt.getTime() / 1000);
  return Buffer.from(`${seconds}:${id}`).toString("base64url");
}

export function decodeExchangeInfoCursor(
  raw: string,
): ExchangeInfoCursor | null {
  const decoded = Buffer.from(raw, "base64url").toString();
  const separator = decoded.indexOf(":");
  if (separator <= 0) return null;

  const seconds = Number(decoded.slice(0, separator));
  const id = decoded.slice(separator + 1);
  if (!Number.isSafeInteger(seconds) || !id) return null;

  return { createdAt: new Date(seconds * 1000), id };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function exchangeInfoListColumns(viewerUserId?: string) {
  // 這段是 raw SQL 子查詢，參數不會經過 Drizzle timestamp 欄位的
  // Date -> Unix seconds encoder，因此明確傳入和 SQLite 欄位相同的秒數。
  const duplicateCutoffSeconds = Math.floor(
    (Date.now() - CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000) /
      1000,
  );
  return {
    id: profiles.id,
    type: profiles.type,
    offersText: profiles.offersText,
    wantsText: profiles.wantsText,
    description: profiles.description,
    createdAt: profiles.createdAt,
    authorNickname: users.nickname,
    authorGroup: users.group,
    authorAvatarUrl: users.avatarUrl,
    appliedWithinCooldown:
      viewerUserId === undefined
        ? sql<number>`0`
        : sql<number>`EXISTS (
          SELECT 1 FROM ${contactLogs}
          WHERE ${contactLogs.profileId} = ${profiles.id}
            AND ${contactLogs.fromUserId} = ${viewerUserId}
            AND ${contactLogs.createdAt} >= ${duplicateCutoffSeconds}
        )`,
  };
}

type ExchangeInfoListRow = Omit<
  ExchangeInfoListItem,
  "author" | "appliedWithinCooldown"
> & {
  authorNickname: Author["nickname"];
  authorGroup: Author["group"];
  authorAvatarUrl: Author["avatarUrl"];
  appliedWithinCooldown: number;
};

function toExchangeInfoListItem({
  authorNickname,
  authorGroup,
  authorAvatarUrl,
  appliedWithinCooldown,
  ...row
}: ExchangeInfoListRow): ExchangeInfoListItem {
  return {
    ...row,
    appliedWithinCooldown: Boolean(appliedWithinCooldown),
    author: {
      nickname: authorNickname,
      group: authorGroup,
      avatarUrl: authorAvatarUrl,
    },
  };
}

/**
 * 公開的交換資訊列表，以 (createdAt, id) 做 keyset 分頁。
 * 已下架、已刪除或刊登者帳號停用的交換資訊不會出現。
 */
export async function listExchangeInfo({
  viewerUserId,
  types,
  keyword,
  sort,
  cursor,
}: ListExchangeInfoOptions): Promise<{
  items: ExchangeInfoListItem[];
  nextCursor: string | null;
}> {
  const conditions: (SQL | undefined)[] = [
    eq(profiles.visible, true),
    isNull(profiles.deletedAt),
    eq(users.active, true),
  ];

  if (types.length > 0) conditions.push(inArray(profiles.type, types));

  if (keyword) {
    const pattern = `%${escapeLike(keyword)}%`;
    conditions.push(
      or(
        sql`${profiles.offersText} LIKE ${pattern} ESCAPE '\\'`,
        sql`${profiles.wantsText} LIKE ${pattern} ESCAPE '\\'`,
        sql`${profiles.description} LIKE ${pattern} ESCAPE '\\'`,
      ),
    );
  }

  if (cursor) {
    const after = sort === "newest" ? lt : gt;
    conditions.push(
      or(
        after(profiles.createdAt, cursor.createdAt),
        and(
          eq(profiles.createdAt, cursor.createdAt),
          after(profiles.id, cursor.id),
        ),
      ),
    );
  }

  const direction = sort === "newest" ? desc : asc;

  const rows = await getDb()
    .select(exchangeInfoListColumns(viewerUserId))
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(direction(profiles.createdAt), direction(profiles.id))
    .limit(EXCHANGE_INFO_PAGE_SIZE + 1);

  const hasMore = rows.length > EXCHANGE_INFO_PAGE_SIZE;
  const items = rows
    .slice(0, EXCHANGE_INFO_PAGE_SIZE)
    .map(toExchangeInfoListItem);
  const last = items.at(-1);

  return {
    items,
    nextCursor: hasMore && last ? encodeExchangeInfoCursor(last) : null,
  };
}

export async function createExchangeInfo(
  userId: string,
  input: CreateExchangeInfoInput,
): Promise<ExchangeInfoListItem> {
  const db = getDb();

  const [created] = await db
    .insert(profiles)
    .values({ ...input, userId, createdBy: userId })
    .returning({ id: profiles.id });

  const [row] = await db
    .select(exchangeInfoListColumns())
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.id, created.id))
    .limit(1);

  return toExchangeInfoListItem(row);
}

export type MyExchangeProfileRow = {
  id: string;
  type: ProfileType;
  visible: boolean;
  offersText: string;
  wantsText: string;
  description: string | null;
  createdAt: Date;
};

/** 設定中心「我的發文」：含已下架、不含已刪除。 */
export async function listMyExchangeProfiles(
  userId: string,
): Promise<MyExchangeProfileRow[]> {
  return getDb()
    .select({
      id: profiles.id,
      type: profiles.type,
      visible: profiles.visible,
      offersText: profiles.offersText,
      wantsText: profiles.wantsText,
      description: profiles.description,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .orderBy(desc(profiles.createdAt), desc(profiles.id));
}

export async function delistMyExchangeProfile(
  userId: string,
  profileId: string,
): Promise<MyExchangeProfileRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(profiles)
    .set({ visible: false, updatedBy: userId })
    .where(
      and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId),
        isNull(profiles.deletedAt),
      ),
    )
    .returning({
      id: profiles.id,
      type: profiles.type,
      visible: profiles.visible,
      offersText: profiles.offersText,
      wantsText: profiles.wantsText,
      description: profiles.description,
      createdAt: profiles.createdAt,
    });

  return updated ?? null;
/** 目前使用者尚未刪除的貼文類型；下架貼文仍占用該類型。 */
export async function listPublishedExchangeInfoTypes(
  userId: string,
): Promise<ProfileType[]> {
  const rows = await getDb()
    .select({ type: profiles.type })
    .from(profiles)
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)));

  return rows.map(({ type }) => type);
}
