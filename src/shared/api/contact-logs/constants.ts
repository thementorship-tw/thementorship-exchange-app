/** 申請表單四個欄位的設計上限皆為 100 字。 */
export const CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH = 100;
export const CONTACT_LOG_WANTED_ITEM_MAX_LENGTH = 100;
export const CONTACT_LOG_MOTIVATION_MAX_LENGTH = 100;
export const CONTACT_LOG_CONTACT_INFO_MAX_LENGTH = 100;

export const CONTACT_LOG_DEFAULT_PAGE_SIZE = 20;
/**
 * 需求條件：通知中心一次抓一整頁、不做分批載入，上限 100 筆。
 */
export const CONTACT_LOG_MAX_PAGE_SIZE = 100;

/** 保守的技術安全上限，避免過大的 withinDays 產生無效日期；不是業務限制。 */
export const CONTACT_LOG_MAX_WITHIN_DAYS = 3650;

/** 通知中心的保留期限；GET 列表跟批次已讀都要帶這個值 */
export const NOTIFICATION_RETENTION_DAYS = 30;

/** 同一人對同一份 Profile，過去 N 天內已建立過紀錄就擋下重複申請。 */
export const CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS = 1;
