export const CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH = 200;
export const CONTACT_LOG_WANTED_ITEM_MAX_LENGTH = 200;
export const CONTACT_LOG_MOTIVATION_MAX_LENGTH = 500;
export const CONTACT_LOG_CONTACT_INFO_MAX_LENGTH = 200;

export const CONTACT_LOG_DEFAULT_PAGE_SIZE = 20;
export const CONTACT_LOG_MAX_PAGE_SIZE = 50;

/** 上限只是為了避免 withinDays * 一天的毫秒數溢位 Date 的有效範圍，不是業務限制。 */
export const CONTACT_LOG_MAX_WITHIN_DAYS = 3650;
