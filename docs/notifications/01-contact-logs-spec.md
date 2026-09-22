# Contact Logs API 規格

> **文件版本：** v2（現行規格，已實作）
> **對象：** RD
> **實作位置：** `src/server/contact-logs/`、`src/app/api/contact-logs/`
> **原始決議日期：** 2026-09-11

---

## 1. 目標與範圍

Contact Logs 記錄使用者透過交流檔案發出的「我想聊」申請：

```text
A 對 B 的交流檔案按「我想聊」
  -> 建立一筆 Contact Log
  -> A 從 sent 查看自己發出的紀錄
  -> B 從 received 查看自己收到的紀錄
  -> B 第一次看見紀錄時寫入 readAt
```

本期範圍：建立交流紀錄、查詢 sent／received、記錄接收者首次閱讀時間、保存建立當下的 Profile snapshot。

不處理：修改／取消／刪除、獨立 Detail API、Firebase 推播與送達追蹤、Swagger／OpenAPI 文件。

## 2. 名詞與角色

| 名稱 | 定義 |
| --- | --- |
| `fromUser` | 按下「我想聊」並建立申請的發起者 |
| `toUser` | 目標交流檔案的擁有者，也是申請接收者 |
| `sent` | 目前登入者是 `fromUser` |
| `received` | 目前登入者是 `toUser` |
| Profile snapshot | 建立 Contact Log 當下保存的交流檔案內容 |

## 3. API 一覽

| Method | Path | 說明 |
| --- | --- | --- |
| `POST` | `/api/contact-logs` | 建立「我想聊」交流紀錄 |
| `GET` | `/api/contact-logs` | 取得 sent 或 received 紀錄列表 |
| `PATCH` | `/api/contact-logs/:id/read` | 記錄接收者第一次閱讀時間 |
| `PATCH` | `/api/contact-logs/read-all` | 將目前登入者收到且未讀的紀錄全部標記已讀 |

不提供 `:id` 的單筆查詢／修改／刪除；列表直接回傳完整內容。不支援的 HTTP method 回傳 `405 Method Not Allowed`。

## 4. 共通規則

| 規則 | 內容 |
| --- | --- |
| 認證 | 所有 API 通過 `withApiAuth`：需有效 session、對應平台使用者、`users.active = true`、已同意目前版本條款。驗證失敗回傳 JSON，不 redirect 到登入頁 |
| 資料權限 | 一筆 Contact Log 只有 `fromUserId` 或 `toUserId` 等於當前使用者才可讀取；`contactInfo` 對雙方皆可見，其他使用者無法取得任何欄位 |
| 不可變性 | `profileId`、`fromUserId`、`toUserId`、`offeredResource`、`wantedItem`、`motivation`、`contactInfo`、Profile snapshot、`createdAt` 建立後不可修改；唯一允許更新的欄位是 `readAt`，只能從 `null` 設成首次閱讀時間，不得覆寫 |
| 日期格式 | DB 用 timestamp；API response 一律 ISO 8601 UTC 字串 |
| 快取 | 回應一律 `Cache-Control: private, no-store`，不得公開或靜態快取 |

## 5. 共用常數

定義於 `src/shared/api/contact-logs/constants.ts`：

```ts
export const CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH = 200;
export const CONTACT_LOG_WANTED_ITEM_MAX_LENGTH = 200;
export const CONTACT_LOG_MOTIVATION_MAX_LENGTH = 500;
export const CONTACT_LOG_CONTACT_INFO_MAX_LENGTH = 200;

export const CONTACT_LOG_DEFAULT_PAGE_SIZE = 20;
export const CONTACT_LOG_MAX_PAGE_SIZE = 100;

export const CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS = 1;
```

字數上限以 `string.length`（UTF-16 code unit）計算，與 Zod `.min()`／`.max()` 一致；部分 emoji 可能計為兩個單位，第一版不做 grapheme cluster 計算。

## 6. 共通回傳資料結構

```ts
type ContactLogResponse = {
  id: string;
  profileId: string;
  direction: "sent" | "received";
  fromUser: { id: string; nickname: string; avatarUrl: string | null };
  toUser: { id: string; nickname: string; avatarUrl: string | null };
  offeredResource: string;
  wantedItem: string;
  motivation: string;
  contactInfo: string;
  profile: {
    type: "skillAndInterest" | "career";
    offersText: string;
    wantsText: string;
    description: string | null;
  };
  profileAvailability: "available" | "unavailable";
  readAt: string | null;
  createdAt: string;
};
```

- `direction` 由後端依當前登入者產生，不儲存在資料庫。
- `profile` 來自 Contact Log 內的 snapshot，不讀取目前的 Profile 內容。
- `profileAvailability` 是目前狀態；Profile 公開、未刪除且擁有者帳號有效時為 `available`，其餘情況統一為 `unavailable`，不揭露不可用的詳細原因。
- `fromUser`／`toUser` 的 `nickname`、`avatarUrl` 使用目前的 User 資料，不保存快照。
- sent 與 received 使用完全相同的 response shape。

## 7. 建立交流紀錄 — `POST /api/contact-logs`

```ts
type CreateContactLogRequest = {
  profileId: string;
  offeredResource: string;
  wantedItem: string;
  motivation: string;
  contactInfo: string;
};
```

`fromUserId`、`toUserId`、`readAt`、`createdAt`、Profile snapshot 全部由後端決定；前端不得傳入，未定義的額外欄位不寫入資料庫。

| 欄位 | 規則 |
| --- | --- |
| `profileId` | 必填、trim 後非空、合法 UUID |
| `offeredResource` | 必填、trim 後 1～200 字 |
| `wantedItem` | 必填、trim 後 1～200 字 |
| `motivation` | 必填、trim 後 1～500 字 |
| `contactInfo` | 必填、trim 後 1～200 字 |

驗證失敗回傳 `422 VALIDATION_ERROR`；字串以 trim 後內容驗證並儲存。

**Profile 驗證**：目標 Profile 必須存在、`visible = true`、`deletedAt = null`、擁有者 `users.active = true`，否則統一回傳 `404 PROFILE_NOT_FOUND`（不揭露非公開 Profile 是否存在）。Profile 查詢、狀態驗證與 insert 須在同一 transaction 完成。

**禁止聯絡自己**：`currentUser.id === profile.userId` 時回傳 `409 SELF_CONTACT_NOT_ALLOWED`。

**重複建立**：同一發起者對同一 Profile，過去 `CONTACT_LOG_DUPLICATE_COOLDOWN_DAYS`（預設 1）天內已建立過紀錄時，回傳 `409 DUPLICATE_CONTACT_TODAY`，不寫入新紀錄。判斷不使用 unique constraint，而是在建立交易內查詢 `fromUserId + profileId` 於冷卻期內是否已有紀錄——因為 Profile 內容可被擁有者編輯，舊申請的 snapshot 會過期，冷卻期過後使用者針對新內容再次申請仍是合理行為，不能永久擋死。

成功回傳 `201`，body 為 §6 定義的 `ContactLogResponse`，建立者的 `direction` 固定為 `sent`。

## 8. 查詢交流紀錄 — `GET /api/contact-logs`

| 參數 | 必填 | 規則 |
| --- | --- | --- |
| `role` | 是 | `sent` 或 `received` |
| `page` | 否 | 預設 `1`，正整數 |
| `pageSize` | 否 | 預設 `20`，正整數，最大 `100` |
| `unread` | 否 | `true`／`false`；只有 received 可用 `true`（`role=sent&unread=true` 回傳 `422`） |
| `profileId` | 否 | Profile UUID；只有 received 可用，用於取得指定貼文收到的申請 |
| `withinDays` | 否 | 正整數；只回傳 `createdAt` 在過去 N 天內的紀錄，sent／received 皆可用；判斷一律由後端保證，前端不得自行依 `createdAt` 過濾 |

查詢條件：sent 為 `fromUserId = currentUser.id`；received 為 `toUserId = currentUser.id`（加 `unread=true` 則再加 `readAt IS NULL`；加 `profileId` 則只查該 Profile）。即使指定 `profileId`，仍須同時符合 `toUserId = currentUser.id`，不可讀取他人收到的申請。

排序固定 `createdAt DESC, id DESC`，採 page/offset pagination（非 cursor）——單一使用者的紀錄量不多、UI 是一般分頁而非高頻訊息流或無限滾動，offset 較容易開發與除錯；未來若改為高頻即時資料或無限滾動，再評估 cursor。

成功回傳 `200`，`data` 為 §6 型別陣列，`pagination` 含 `page`／`pageSize`／`totalItems`／`totalPages`；空列表回傳 `200` 與空陣列。

## 9. 標記已讀

### 9.1 `PATCH /api/contact-logs/:id/read`

`readAt` 定義為**接收者第一次實際看見該交流紀錄的時間**；`null` 代表未讀。它不是 Firebase 推播的送達、顯示或點擊狀態（見 §13）。

- 只有接收者（`currentUser.id === toUserId`）可標記；ID 不存在、發起者呼叫、或無關第三人呼叫，統一回傳 `404 CONTACT_LOG_NOT_FOUND`，避免洩漏紀錄是否存在。
- 不需 request body。

原子更新（第一次寫入現在時間，已有 `readAt` 時不覆寫，多裝置同時呼叫仍保留第一次寫入時間）：

```sql
UPDATE contact_logs
SET read_at = current_time
WHERE id = :id AND to_user_id = :currentUserId AND read_at IS NULL;
```

前端觸發時機：received 列表載入 → 紀錄實際顯示在畫面上 → `readAt === null` → 呼叫本 API。**GET 不得自動更新 `readAt`**，避免預載或未顯示的資料被誤判為已讀。

### 9.2 `PATCH /api/contact-logs/read-all`

供通知中心「已讀全部」按鈕使用；只影響目前登入者身為 `toUser` 且未讀的紀錄，可選 `withinDays` 只標記過去 N 天內的紀錄（通知中心固定帶 `withinDays=30`，避免把使用者從未看過的舊紀錄也標成已讀）。

```sql
UPDATE contact_logs
SET read_at = current_time
WHERE to_user_id = :currentUserId AND read_at IS NULL [AND created_at >= :cutoff];
```

單一 UPDATE，同批次共用同一 `readAt`；已有 `readAt` 的紀錄不受影響；沒有未讀紀錄時回傳 `200` 與 `updatedCount: 0`（非錯誤）。

## 10. 錯誤格式

```ts
type ApiErrorResponse = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
```

| HTTP | Code | 情境 |
| --- | --- | --- |
| `400` | `INVALID_JSON` | POST body 不是合法 JSON |
| `401` | `UNAUTHENTICATED` | 未登入、session 無效或找不到對應平台使用者 |
| `403` | `ACCOUNT_INACTIVE` | 登入者帳號已停用 |
| `403` | `CONSENT_REQUIRED` | 尚未同意目前版本條款 |
| `404` | `PROFILE_NOT_FOUND` | Profile 不存在、不可見、已刪除或擁有者失效 |
| `404` | `CONTACT_LOG_NOT_FOUND` | Contact Log 不存在或使用者沒有 read 權限 |
| `409` | `SELF_CONTACT_NOT_ALLOWED` | 對自己的 Profile 發起聯絡 |
| `409` | `DUPLICATE_CONTACT_TODAY` | 對同一 Profile 在冷卻期內已建立過紀錄 |
| `422` | `VALIDATION_ERROR` | Request 或 query 驗證失敗 |
| `500` | `INTERNAL_ERROR` | 未預期的伺服器錯誤 |

錯誤 response 不得包含 SQL、Database URL、stack trace、Auth token、使用者 Email 或其他內部資訊。

## 11. 資料庫規格

`contact_logs` table：

| 欄位 | 型別／規則 | 說明 |
| --- | --- | --- |
| `id` | UUID primary key | Contact Log ID |
| `profile_id` | FK, not null | 建立時對應的 Profile |
| `from_user_id` | FK, not null | 發起者 |
| `to_user_id` | FK, not null | 接收者／Profile owner |
| `offered_resource` | text, not null | 發起者可提供的資源 |
| `wanted_item` | text, not null | 發起者希望交流的項目 |
| `motivation` | text, not null | 發起動機 |
| `contact_info` | text, not null | 發起者的站外聯絡資訊，雙方可見 |
| `profile_type_snapshot` | text, not null | 建立時的 Profile type |
| `profile_offers_snapshot` | text, not null | 建立時的 offersText |
| `profile_wants_snapshot` | text, not null | 建立時的 wantsText |
| `profile_description_snapshot` | text, nullable | 建立時的 description |
| `read_at` | timestamp, nullable | 接收者第一次閱讀時間 |
| `created_at` | timestamp, not null | 建立時間 |

索引：`idx_contact_profile(profile_id)`、`idx_contact_from_created(from_user_id, created_at)`、`idx_contact_to_created(to_user_id, created_at)`、`idx_contact_to_read_created(to_user_id, read_at, created_at)`。不建立重複申請的 unique index。

## 12. 驗收條件摘要

- Client 無法偽造 `fromUserId`／`toUserId`／snapshot／`readAt`／`createdAt`；皆由後端決定。
- 不可對自己的 Profile、或下架／已刪除／owner 已失效的 Profile 建立紀錄。
- 同一人對同一 Profile 在冷卻期內重複申請會被擋下（`409 DUPLICATE_CONTACT_TODAY`）；冷卻期過後可再次申請。
- Profile 修改或下架後，舊紀錄仍顯示建立時的 snapshot（不讀取目前 Profile）。
- 發起者與接收者都能看到 `contactInfo`；第三人無法取得整筆紀錄任何欄位。
- 只有接收者能設定 `readAt`，且僅能設定一次；多裝置同時 PATCH 仍保留第一次閱讀時間。
- `read-all` 只影響當前登入者收到且未讀的紀錄，已有 `readAt` 的不受影響。
- 不提供一般 Update／Delete API；不支援的 method 回傳 `405`。

## 13. Firebase 邊界

Firebase 推播與 Contact Log 閱讀狀態是兩件不同的事：

| 狀態 | 意義 | 儲存位置 |
| --- | --- | --- |
| Contact Log 已讀 | 接收者在平台中實際看見交流內容 | `contact_logs.read_at` |
| 推播已送出／送達 | 後端或 FCM 的傳送狀態 | 未來的通知系統或系統 log |
| 推播已點擊 | 使用者點擊系統通知 | 未來獨立的 notification tracking |

導入 Firebase 時，不得使用 `contact_logs.read_at` 表示推播送達或點擊。推播機制的方案選擇見 [`02-realtime-notification-architecture.md`](./02-realtime-notification-architecture.md)。

## 14. 通知中心（Notifications）初步決議

| 項目 | 決議 |
| --- | --- |
| 觸發事件 | 使用者對某 Profile 建立 Contact Log 時，對該 Profile 的 `toUser` 產生一筆通知 |
| 保留期限 | 30 天，已透過 `GET /api/contact-logs` 的 `withinDays` 實作（§8），通知中心呼叫 `role=received&withinDays=30` |
| 已讀全部 | 已透過 `PATCH /api/contact-logs/read-all` 實作（§9.2），通知中心呼叫時帶 `withinDays=30` |

是否新增獨立 `notifications` table、推播節流規則等，見 [`02-realtime-notification-architecture.md`](./02-realtime-notification-architecture.md)。
