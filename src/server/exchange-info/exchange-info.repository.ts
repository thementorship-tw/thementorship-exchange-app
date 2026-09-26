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
  type ExchangeInfoContentInput,
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

/**
 * 兩種分頁模式（見 openspec/changes/search-mechanism-plan/design.md D8）：
 * - chrono：無關鍵字，或關鍵字少於 RELEVANCE_KEYWORD_MIN_LENGTH 字（LIKE fallback）。
 *   排序鍵是 (updatedAt, id)。
 * - relevance：關鍵字達 RELEVANCE_KEYWORD_MIN_LENGTH 字以上，走 FTS5。
 *   排序鍵是 (rank, updatedAt, id)，rank 是 bm25() 分數（越小越相關）。
 */
export type ExchangeInfoCursor =
  | { mode: "chrono"; updatedAt: Date; id: string }
  | { mode: "relevance"; rank: number; updatedAt: Date; id: string };

export type ListExchangeInfoOptions = {
  viewerUserId: string;
  types: ProfileType[];
  /** 比對我能提供、我想找、自由描述三個欄位。 */
  keyword?: string;
  sort: ExchangeInfoSortOrder;
  cursor?: ExchangeInfoCursor;
};

/** trigram tokenizer 固定 3-gram、不可調整（已實測），少於此字數查不到任何結果，改走 LIKE fallback。 */
const RELEVANCE_KEYWORD_MIN_LENGTH = 3;

/** 對應 profiles_fts 宣告順序（offers_text, description, wants_text）的 bm25 權重。 */
const FTS_WEIGHT_OFFERS = 3.0;
const FTS_WEIGHT_DESCRIPTION = 2.0;
const FTS_WEIGHT_WANTS = 1.0;

/** cursor 是把排序鍵欄位用 ":" 接起來，再用 base64url 包起來。 */
export function encodeExchangeInfoCursor(cursor: ExchangeInfoCursor): string {
  const updatedAtSeconds = Math.floor(cursor.updatedAt.getTime() / 1000);
  const payload =
    cursor.mode === "chrono"
      ? `chrono:${updatedAtSeconds}:${cursor.id}`
      : `relevance:${cursor.rank}:${updatedAtSeconds}:${cursor.id}`;
  return Buffer.from(payload).toString("base64url");
}

/**
 * 回傳 null 代表 cursor 無效，或跟目前查詢的模式對不上（例如翻頁途中關鍵字
 * 從有變沒有）。呼叫端遇到 null 一律當作沒有 cursor、回第一頁，而不是回
 * 錯誤，因為使用者自己改變搜尋條件是正常操作，不該讓他們卡住。
 */
export function decodeExchangeInfoCursor(
  raw: string,
): ExchangeInfoCursor | null {
  const decoded = Buffer.from(raw, "base64url").toString();
  const parts = decoded.split(":");

  if (parts[0] === "chrono" && parts.length === 3) {
    const [, secondsRaw, id] = parts;
    if (secondsRaw === "" || !id) return null;
    const seconds = Number(secondsRaw);
    if (!Number.isSafeInteger(seconds)) return null;
    return { mode: "chrono", updatedAt: new Date(seconds * 1000), id };
  }

  if (parts[0] === "relevance" && parts.length === 4) {
    const [, rankRaw, secondsRaw, id] = parts;
    if (rankRaw === "" || secondsRaw === "" || !id) return null;
    const rank = Number(rankRaw);
    const seconds = Number(secondsRaw);
    if (!Number.isFinite(rank) || !Number.isSafeInteger(seconds)) return null;
    return { mode: "relevance", rank, updatedAt: new Date(seconds * 1000), id };
  }

  return null;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * FTS5 的 MATCH 右邊是它自己的查詢語法（引號、AND/OR/NOT、-、*、col:），不是單純
 * 字面比對；把使用者輸入包成一個 phrase（雙引號包起來、內部雙引號 double 跳脫）
 * 關掉語法解析，否則像 "-node" 這種輸入會被解讀成排除語意，帶孤立引號則會直接
 * 讓 SQLite 拋語法錯誤。
 */
function toFtsMatchQuery(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** duplicateLog cooldown 的秒數門檻，chrono／relevance 兩條查詢路徑共用。 */
function getDuplicateCutoffSeconds(): number {
  return Math.floor(
    (Date.now() - CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000) /
      1000,
  );
}

function exchangeInfoListColumns(viewerUserId?: string) {
  // 這段是 raw SQL 子查詢，參數不會經過 Drizzle timestamp 欄位的
  // Date -> Unix seconds encoder，因此明確傳入和 SQLite 欄位相同的秒數。
  const duplicateCutoffSeconds = getDuplicateCutoffSeconds();
  return {
    id: profiles.id,
    type: profiles.type,
    offersText: profiles.offersText,
    wantsText: profiles.wantsText,
    description: profiles.description,
    createdAt: profiles.createdAt,
    updatedAt: profiles.updatedAt,
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
  updatedAt: Date;
  authorNickname: Author["nickname"];
  authorGroup: Author["group"];
  authorAvatarUrl: Author["avatarUrl"];
  appliedWithinCooldown: number;
};

/** updatedAt 只用來組 cursor，不是公開回應欄位，映射時要拿掉，不能外流。 */
function toExchangeInfoListItem({
  updatedAt: _updatedAt,
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
 * 公開的交換資訊列表。
 *
 * 排序邏輯（design.md D4）：
 * - 關鍵字達 3 字以上：依相關性（bm25）排序，忽略 `sort`，交給 listExchangeInfoByRelevance。
 * - 關鍵字少於 3 字，或沒有關鍵字：依 updatedAt 排序（chrono）；
 *   有關鍵字時同樣忽略 `sort`、固定新到舊，交給 listExchangeInfoChrono。
 *
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
  const trimmedKeyword = keyword?.trim();
  const keywordCharLength = trimmedKeyword ? [...trimmedKeyword].length : 0;

  if (trimmedKeyword && keywordCharLength >= RELEVANCE_KEYWORD_MIN_LENGTH) {
    const relevanceCursor = cursor?.mode === "relevance" ? cursor : undefined;
    return listExchangeInfoByRelevance({
      viewerUserId,
      types,
      keyword: trimmedKeyword,
      cursor: relevanceCursor,
    });
  }

  const chronoCursor = cursor?.mode === "chrono" ? cursor : undefined;
  return listExchangeInfoChrono({
    viewerUserId,
    types,
    keyword: trimmedKeyword,
    sort,
    cursor: chronoCursor,
  });
}

/** 無關鍵字，或少於 3 字的關鍵字（LIKE fallback）。排序鍵是 (updatedAt, id)。 */
async function listExchangeInfoChrono({
  viewerUserId,
  types,
  keyword,
  sort,
  cursor,
}: {
  viewerUserId: string;
  types: ProfileType[];
  keyword?: string;
  sort: ExchangeInfoSortOrder;
  cursor?: Extract<ExchangeInfoCursor, { mode: "chrono" }>;
}): Promise<{ items: ExchangeInfoListItem[]; nextCursor: string | null }> {
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

  // 有關鍵字時（即使短到走 LIKE fallback）一律忽略呼叫端的 sort，固定新到舊，
  // 維持「有關鍵字＝相關性邏輯主導排序」在任何查詢字數下的一致行為（design.md D4）。
  const isDescending = keyword ? true : sort === "newest";
  const direction = isDescending ? desc : asc;

  if (cursor) {
    const after = isDescending ? lt : gt;
    conditions.push(
      or(
        after(profiles.updatedAt, cursor.updatedAt),
        and(
          eq(profiles.updatedAt, cursor.updatedAt),
          after(profiles.id, cursor.id),
        ),
      ),
    );
  }

  const rows = await getDb()
    .select(exchangeInfoListColumns(viewerUserId))
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(direction(profiles.updatedAt), direction(profiles.id))
    .limit(EXCHANGE_INFO_PAGE_SIZE + 1);

  const hasMore = rows.length > EXCHANGE_INFO_PAGE_SIZE;
  const pageRows = rows.slice(0, EXCHANGE_INFO_PAGE_SIZE);
  const items = pageRows.map(toExchangeInfoListItem);
  const lastRow = pageRows.at(-1);

  return {
    items,
    nextCursor:
      hasMore && lastRow
        ? encodeExchangeInfoCursor({
            mode: "chrono",
            updatedAt: lastRow.updatedAt,
            id: lastRow.id,
          })
        : null,
  };
}

type RelevanceRow = {
  id: string;
  type: ProfileType;
  offersText: string;
  wantsText: string;
  description: string | null;
  createdAtSeconds: number;
  updatedAtSeconds: number;
  authorNickname: string;
  authorGroup: Author["group"];
  authorAvatarUrl: string | null;
  appliedWithinCooldown: number;
  rank: number;
};

/** 關鍵字達 3 字以上：走 FTS5 + bm25 相關性排序。排序鍵是 (rank, updatedAt, id)。 */
async function listExchangeInfoByRelevance({
  viewerUserId,
  types,
  keyword,
  cursor,
}: {
  viewerUserId: string;
  types: ProfileType[];
  keyword: string;
  cursor?: Extract<ExchangeInfoCursor, { mode: "relevance" }>;
}): Promise<{ items: ExchangeInfoListItem[]; nextCursor: string | null }> {
  const duplicateCutoffSeconds = getDuplicateCutoffSeconds();

  const typeCondition =
    types.length > 0
      ? sql`AND p.type IN (${sql.join(
          types.map((type) => sql`${type}`),
          sql`, `,
        )})`
      : sql``;

  const cursorCondition = cursor
    ? sql`AND (
        t.rank > ${cursor.rank}
        OR (t.rank = ${cursor.rank} AND t."updatedAtSeconds" < ${Math.floor(cursor.updatedAt.getTime() / 1000)})
        OR (
          t.rank = ${cursor.rank}
          AND t."updatedAtSeconds" = ${Math.floor(cursor.updatedAt.getTime() / 1000)}
          AND t.id > ${cursor.id}
        )
      )`
    : sql``;

  const rows = await getDb().all<RelevanceRow>(sql`
    SELECT * FROM (
      SELECT
        p.id AS id,
        p.type AS type,
        p.offers_text AS "offersText",
        p.wants_text AS "wantsText",
        p.description AS description,
        p.created_at AS "createdAtSeconds",
        p.updated_at AS "updatedAtSeconds",
        u.nickname AS "authorNickname",
        u."group" AS "authorGroup",
        u.avatar_url AS "authorAvatarUrl",
        EXISTS (
          SELECT 1 FROM contact_logs
          WHERE contact_logs.profile_id = p.id
            AND contact_logs.from_user_id = ${viewerUserId}
            AND contact_logs.created_at >= ${duplicateCutoffSeconds}
        ) AS "appliedWithinCooldown",
        bm25(profiles_fts, ${FTS_WEIGHT_OFFERS}, ${FTS_WEIGHT_DESCRIPTION}, ${FTS_WEIGHT_WANTS}) AS rank
      FROM profiles p
      JOIN profiles_fts ON profiles_fts.rowid = p.rowid
      JOIN users u ON u.id = p.user_id
      WHERE p.visible = 1 AND p.deleted_at IS NULL AND u.active = 1
        AND profiles_fts MATCH ${toFtsMatchQuery(keyword)}
        ${typeCondition}
    ) t
    WHERE 1 = 1 ${cursorCondition}
    ORDER BY t.rank ASC, t."updatedAtSeconds" DESC, t.id ASC
    LIMIT ${EXCHANGE_INFO_PAGE_SIZE + 1}
  `);

  const hasMore = rows.length > EXCHANGE_INFO_PAGE_SIZE;
  const pageRows = rows.slice(0, EXCHANGE_INFO_PAGE_SIZE);
  const items = pageRows.map((row) =>
    toExchangeInfoListItem({
      id: row.id,
      type: row.type,
      offersText: row.offersText,
      wantsText: row.wantsText,
      description: row.description,
      createdAt: new Date(row.createdAtSeconds * 1000),
      updatedAt: new Date(row.updatedAtSeconds * 1000),
      authorNickname: row.authorNickname,
      authorGroup: row.authorGroup,
      authorAvatarUrl: row.authorAvatarUrl,
      appliedWithinCooldown: row.appliedWithinCooldown,
    }),
  );
  const lastRow = pageRows.at(-1);

  return {
    items,
    nextCursor:
      hasMore && lastRow
        ? encodeExchangeInfoCursor({
            mode: "relevance",
            rank: lastRow.rank,
            updatedAt: new Date(lastRow.updatedAtSeconds * 1000),
            id: lastRow.id,
          })
        : null,
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
}

export async function updateMyExchangeProfile(
  userId: string,
  profileId: string,
  input: ExchangeInfoContentInput,
): Promise<MyExchangeProfileRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(profiles)
    .set({
      type: input.type,
      offersText: input.offersText,
      wantsText: input.wantsText,
      description: input.description,
      updatedBy: userId,
    })
    .where(
      and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId),
        eq(profiles.visible, true),
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
}

/** 目前使用者仍上架中的貼文類型；下架後可再次刊登同類型。 */
export async function listPublishedExchangeInfoTypes(
  userId: string,
): Promise<ProfileType[]> {
  const rows = await getDb()
    .select({ type: profiles.type })
    .from(profiles)
    .where(
      and(
        eq(profiles.userId, userId),
        eq(profiles.visible, true),
        isNull(profiles.deletedAt),
      ),
    );

  return rows.map(({ type }) => type);
}
