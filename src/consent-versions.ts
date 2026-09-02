export type ConsentVersions = {
  /** 使用條款／互惠條款版本。 */
  termsVersion: string;
  /** 隱私權政策版本。 */
  privacyVersion: string;
};

/**
 * 版本號格式為文件最後修訂日 `YYYYMMDD`（例：`20260831`）。
 *
 * 目前規範與隱私政策合寫為同一份文件（登入頁「規範與隱私政策」），所以兩個版本號一律同步升版。
 * 之後若兩份文件拆開各自維護，把下面兩行改成各自的字面值即可，
 * schema 與 `consent_logs` 的寫入規則都不用動。
 */
const CURRENT_DOCUMENT_VERSION = "20260831";

export const CURRENT_CONSENT_VERSIONS: ConsentVersions = {
  termsVersion: CURRENT_DOCUMENT_VERSION,
  privacyVersion: CURRENT_DOCUMENT_VERSION,
};

/** null 沒有紀錄 */
export function isCurrentConsent(versions: ConsentVersions | null): boolean {
  return (
    versions !== null &&
    versions.termsVersion === CURRENT_CONSENT_VERSIONS.termsVersion &&
    versions.privacyVersion === CURRENT_CONSENT_VERSIONS.privacyVersion
  );
}
