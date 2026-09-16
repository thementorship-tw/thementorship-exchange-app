export const CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH = 200;
export const CONTACT_LOG_WANTED_ITEM_MAX_LENGTH = 200;
export const CONTACT_LOG_MOTIVATION_MAX_LENGTH = 500;
export const CONTACT_LOG_CONTACT_INFO_MAX_LENGTH = 200;

export const CONTACT_LOG_DEFAULT_PAGE_SIZE = 20;
/**
 * 純防禦性上限，避免單一 request 被要求撈出不受控筆數；跟目前資料量無關。
 * 目前唯一的呼叫端（通知中心）一次抓一整頁、不做分批載入，
 * 100 只是給它足夠餘裕，不代表業務上真的預期會用到這麼多。
 */
export const CONTACT_LOG_MAX_PAGE_SIZE = 100;

/** 保守的技術安全上限，避免過大的 withinDays 產生無效日期；不是業務限制。 */
export const CONTACT_LOG_MAX_WITHIN_DAYS = 3650;

/** 通知中心的保留期限；GET 列表跟批次已讀都要帶這個值 */
export const NOTIFICATION_RETENTION_DAYS = 30;
