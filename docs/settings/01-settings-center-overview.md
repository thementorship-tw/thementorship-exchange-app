# 設定中心（Settings Center）現況文件

> **文件版本：** v2（精簡版，記錄關鍵邏輯）
> **對象：** RD
> **實作位置：** `src/app/(authenticated)/(platform)/settings/`、`src/app/api/me/`、`src/app/api/contact-logs/`
> **記錄日期：** 2026-09-22

---

## 1. 範圍

`/settings` 提供三塊功能：個人資料（暱稱編輯）、我的發文（列表／下架／收到的申請）、我送出的申請。Contact Logs API 完整規格見 [`../notifications/01-contact-logs-spec.md`](../notifications/01-contact-logs-spec.md)，本文件只記錄設定中心特有的邏輯。

## 2. 關鍵邏輯

**個人資料**：`GET/PATCH /api/me`，暱稱行內編輯（Enter／blur 送出，Esc 取消）。

**我的發文**（`GET /api/me/profiles` → `listMyExchangeProfiles`，含已下架、不含已刪除）：

- 下架：`PATCH /api/me/profiles/:id` body `{ visible: false }`，不可復原、也不能編輯貼文內容。
- **下架後可重新刊登同類型貼文**：`profiles` 的 unique index（`uq_profiles_user_type_visible_not_deleted`）只擋「同一使用者、同類型、`visible=true` 且未刪除」的重複，已下架的貼文不算數；`listPublishedExchangeInfoTypes` 也只統計上架中的類型。所以下架後，首頁的「發布交流」流程會把該類型視為可用，使用者可以直接發一篇新的頂替，而不是「復原」舊貼文。
- 收到的申請採**每篇貼文各自分頁**：初始各抓最新 20 筆（`role=received&profileId=<id>`），超過時 `MyPostRow` 顯示「載入更多申請」，沒有更多時按鈕自動隱藏；已下架的貼文不查詢、也不顯示申請。

**我送出的申請**（`role=sent`）：無天數限制，捲到底部自動載入下一頁。

「載入更多」與「捲動載入」共用同一個 hook `use-contact-log-pagination.ts`（`useContactLogPagination`），差別只在觸發方式（按鈕 vs. 捲動）與是否帶 `profileId`。

## 3. 從通知點擊進來的深連結

通知中心每一筆通知對應一筆 `contact_logs`，點擊行為：

- **已讀邏輯不變**：click 當下呼叫 `markAsRead(id)`（`PATCH /api/contact-logs/:id/read`），只標記「這一筆」已讀。已讀狀態掛在每筆 `contact_logs.read_at`，不是掛在貼文或使用者身上，所以同一貼文其他人的申請不會被連帶標成已讀——這是刻意如此，跟信箱點開一封信不會連帶已讀其他信一樣。
- **導航目標**：`targetHref` 組成 `/settings?tab=posts&profileId=<profileId>&applicationId=<contactLogId>`（見 `contact-log-target.ts`），站內通知與系統推播都不再固定回 `/home`。
- **落地行為**：`SettingsPage` 讀這三個 query 參數 → 切到「我的發文」tab → 對應的 `MyPostRow` 掛載時捲到「目標那筆申請」本身（不是整篇貼文，貼文若申請很多筆會太長），並把 `expandedApplicationId` 預設成目標 id（展開那筆申請）；目標那筆會短暫高亮（`target-highlight` keyframe，2 秒淡出）幫助使用者確認捲到的是哪一筆。
- **已知邊界情況**：如果目標申請剛好不在該貼文最新 20 筆內（要同貼文短時間湧入 20 筆以上更新申請才會發生，機率低），只會捲到貼文本身、不會自動翻頁去找，使用者要自己點「載入更多申請」。不影響已讀狀態，純粹是展開動畫不會自動觸發。

## 4. API 一覽

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` / `PATCH` | `/api/me` | 設定中心 Profile／更新暱稱 |
| `GET` | `/api/me/profiles` | 我的發文（含已下架） |
| `PATCH` | `/api/me/profiles/:id` | 下架貼文 |
| `GET` | `/api/contact-logs?role=sent` | 送出的申請，page-based 分頁 |
| `GET` | `/api/contact-logs?role=received&profileId=<uuid>` | 指定貼文收到的申請，page-based 分頁 |

`profileId` 只能搭配 `role=received`，且仍強制 `toUserId = currentUser.id`，無法讀取他人收到的申請（見 [Contact Logs API 規格 §8](../notifications/01-contact-logs-spec.md#8-查詢交流紀錄--get-apicontact-logs)）。

## 5. 已知限制

- 下架動作本身不可復原；要「復刊」得走發布流程重新建立同類型貼文。
- 「我送出的申請」與「我的發文」收到的申請都沒有天數限制，理論上會隨使用時間持續增長，尚未評估長期資料量的效能。
