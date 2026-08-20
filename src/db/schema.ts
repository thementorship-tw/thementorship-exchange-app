import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const profileTypes = ["skill", "career", "interest"] as const;
export type ProfileType = (typeof profileTypes)[number];

const profileTypeSqlValues = sql.raw(profileTypes.map((type) => `'${type}'`).join(", "));

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const timestamp = (name: string) => integer(name, { mode: "timestamp" });
const timestampWithDefault = (name: string) =>
  timestamp(name)
    .notNull()
    .default(sql`(unixepoch())`);
const boolean = (name: string) => integer(name, { mode: "boolean" });

/**
 * Google SSO 登入資格來源。Email 寫入與查詢前必須轉為小寫。
 * 此表與 users 僅在首次登入建檔時複製資料，建立後不會自動同步。
 */
export const whitelist = sqliteTable(
  "whitelist",
  {
    /** 白名單資料主鍵；使用 Drizzle 寫入時自動產生 UUID。 */
    id: id(),
    /** 允許登入的 Google Email；儲存與比對前統一轉為小寫。 */
    email: text("email").notNull().unique(),
    /** 學員屆次。 */
    session: integer("session").notNull(),
    /** 目前是否具備登入資格；false 時拒絕登入。 */
    active: boolean("active").notNull().default(true),
    /** 白名單資料建立或匯入時間；預設為當前時間。 */
    createdAt: timestampWithDefault("created_at"),
    /** 白名單資料最後更新時間；建立時預設為當前時間。 */
    updatedAt: timestampWithDefault("updated_at"),
    /** 白名單資格停用時間；null 代表未停用。 */
    deactivatedAt: timestamp("deactivated_at"),
  },
  (table) => [
    check(
      "whitelist_email_lowercase_check",
      sql`${table.email} = lower(${table.email})`,
    ),
  ],
);

/**
 * 通過 whitelist 驗證且至少成功登入一次的平台使用者。
 * 平台內所有關聯皆使用 id；sub 只負責識別 Google OIDC 身分。
 */
export const users = sqliteTable(
  "users",
  {
    /** 平台內部使用者主鍵。 */
    id: id(),
    /** Google OIDC 提供的穩定唯一識別。 */
    sub: text("sub").notNull().unique(),
    /** Google SSO 驗證後的 Email；平台內不可重複。 */
    email: text("email").notNull().unique(),
    /** 首次建檔時由 whitelist 複製的學員屆次。 */
    session: integer("session").notNull(),
    /** Google 帳號提供的原始姓名。 */
    googleName: text("google_name").notNull(),
    /** 平台顯示暱稱；首次建檔時預設為 googleName，之後可修改。 */
    nickname: text("nickname").notNull(),
    /** Google 帳號頭像 URL。 */
    avatarUrl: text("avatar_url"),
    /** 平台帳號是否可使用；與 whitelist.active 是不同概念。 */
    active: boolean("active").notNull().default(true),
    /** 最近一次成功登入時間。 */
    lastLoginAt: timestamp("last_login_at"),
    /** 第一次成功登入並建立平台帳號的時間。 */
    createdAt: timestampWithDefault("created_at"),
    /** 建立資料的使用者；系統操作時可為 null。 */
    createdBy: text("created_by").references((): AnySQLiteColumn => users.id),
    /** 使用者資料最後更新時間。 */
    updatedAt: timestampWithDefault("updated_at"),
    /** 最後修改資料的使用者；系統操作時可為 null。 */
    updatedBy: text("updated_by").references((): AnySQLiteColumn => users.id),
    /** 平台帳號停用時間；null 代表未停用。 */
    deactivatedAt: timestamp("deactivated_at"),
    /** 停用平台帳號的使用者；系統操作時可為 null。 */
    deactivatedBy: text("deactivated_by").references(
      (): AnySQLiteColumn => users.id,
    ),
  },
  (table) => [
    check(
      "users_email_lowercase_check",
      sql`${table.email} = lower(${table.email})`,
    ),
  ],
);

/** Append-only 的條款同意歷史；建立後不可修改。 */
export const consentLogs = sqliteTable(
  "consent_logs",
  {
    /** 條款同意紀錄主鍵。 */
    id: id(),
    /** 同意條款的平台使用者。 */
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    /** 使用條款／互惠條款版本。 */
    termsVersion: text("terms_version").notNull(),
    /** 隱私權政策版本。 */
    privacyVersion: text("privacy_version").notNull(),
    /** 使用者主動同意條款的時間，同時也是紀錄建立時間。 */
    agreedAt: timestamp("agreed_at").notNull(),
  },
  (table) => [
    uniqueIndex("uq_consent_user_versions").on(
      table.userId,
      table.termsVersion,
      table.privacyVersion,
    ),
  ],
);

/**
 * 使用者刊登的技能、職涯或興趣交流檔案。
 */
export const profiles = sqliteTable(
  "profiles",
  {
    /** 交流檔案主鍵。 */
    id: id(),
    /** 刊登交流檔案的平台使用者。 */
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    /** 交流檔案類型：skill、career 或 interest。 */
    type: text("type", { enum: profileTypes }).notNull(),
    /** 刊登者能提供或擅長的內容。 */
    offersText: text("offers_text").notNull(),
    /** 刊登者想找、想學或想交流的內容。 */
    wantsText: text("wants_text").notNull(),
    /** 交流檔案自由描述。 */
    description: text("description"),
    /** 是否公開顯示；false 代表下架但資料仍存在。 */
    visible: boolean("visible").notNull().default(true),
    /** 交流檔案首次建立時間。 */
    createdAt: timestampWithDefault("created_at"),
    /** 建立交流檔案的平台使用者。 */
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    /** 交流檔案最後修改時間。 */
    updatedAt: timestampWithDefault("updated_at"),
    /** 最後修改交流檔案的使用者；系統操作時可為 null。 */
    updatedBy: text("updated_by").references(() => users.id),
    /** 軟刪除時間；null 代表未刪除。 */
    deletedAt: timestamp("deleted_at"),
    /** 執行軟刪除的使用者；系統操作時可為 null。 */
    deletedBy: text("deleted_by").references(() => users.id),
  },
  (table) => [
    index("idx_profile_user").on(table.userId),
    check(
      "profiles_type_check",
      sql`${table.type} IN (${profileTypeSqlValues})`,
    ),
  ],
);

/**
 * 「我想聊」Application 與送出當下的交流檔案快照。
 * Application 內容為 immutable，送出後不可修改。
 */
export const contactLogs = sqliteTable(
  "contact_logs",
  {
    /** 「我想聊」Application 主鍵。 */
    id: id(),
    /** Application 送出時所對應的交流檔案。 */
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id),
    /** 發起 Application 的平台使用者。 */
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id),
    /** 接收 Application 的平台使用者。 */
    toUserId: text("to_user_id")
      .notNull()
      .references(() => users.id),
    /** 發起人預計提供給對方的交換資源。 */
    offeredResource: text("offered_resource").notNull(),
    /** 發起人希望交換、學習或交流的項目。 */
    wantedItem: text("wanted_item").notNull(),
    /** 發起此次聯絡的動機。 */
    motivation: text("motivation").notNull(),
    /** 發起人的站外聯絡資訊；僅接收者可查看。 */
    contactInfo: text("contact_info").notNull(),
    /** Application 送出當下的交流檔案類型。 */
    profileTypeSnapshot: text("profile_type_snapshot", {
      enum: profileTypes,
    }).notNull(),
    /** Application 送出當下的「能提供」內容。 */
    profileOffersSnapshot: text("profile_offers_snapshot").notNull(),
    /** Application 送出當下的「想找或想學」內容。 */
    profileWantsSnapshot: text("profile_wants_snapshot").notNull(),
    /** Application 送出當下的交流檔案自由描述。 */
    profileDescriptionSnapshot: text("profile_description_snapshot"),
    /** 接收者第一次開啟詳情的時間；null 代表未讀。 */
    readAt: timestamp("read_at"),
    /** Application 送出時間。 */
    createdAt: timestampWithDefault("created_at"),
  },
  (table) => [
    index("idx_contact_profile").on(table.profileId),
    check(
      "contact_logs_profile_type_snapshot_check",
      sql`${table.profileTypeSnapshot} IN (${profileTypeSqlValues})`,
    ),
    index("idx_contact_from_created").on(table.fromUserId, table.createdAt),
    index("idx_contact_to_created").on(table.toUserId, table.createdAt),
    index("idx_contact_to_read_created").on(
      table.toUserId,
      table.readAt,
      table.createdAt,
    ),
  ],
);

/**
 * 使用者與瀏覽器／裝置 FCM Token 的對應。
 * 一位使用者可同時擁有多個裝置 Token。
 */
export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    /** Push subscription 主鍵。 */
    id: id(),
    /** 此 FCM Token 所屬的平台使用者。 */
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    /** Firebase Cloud Messaging registration token。 */
    fcmToken: text("fcm_token").notNull().unique(),
    /** Token 是否仍有效。 */
    active: boolean("active").notNull().default(true),
    /** 註冊 Token 時的瀏覽器與裝置資訊，用於除錯。 */
    userAgent: text("user_agent"),
    /** Token 第一次註冊時間。 */
    createdAt: timestampWithDefault("created_at"),
    /** Token 失效或取消訂閱時間；null 代表仍有效。 */
    deactivatedAt: timestamp("deactivated_at"),
  },
  (table) => [index("idx_push_user_active").on(table.userId, table.active)],
);

export type WhitelistEntry = typeof whitelist.$inferSelect;
export type NewWhitelistEntry = typeof whitelist.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ConsentLog = typeof consentLogs.$inferSelect;
export type NewConsentLog = typeof consentLogs.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ContactLog = typeof contactLogs.$inferSelect;
export type NewContactLog = typeof contactLogs.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
