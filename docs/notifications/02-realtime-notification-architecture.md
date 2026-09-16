# 推播通知前景即時機制：方案決策與實作

> **文件版本：** v3（已確認，已實作）
> **對象：** RD / PM
> **使用階段：** 已完成實作（見 `src/app/(authenticated)/(platform)/_providers/`）
> **前置：** [`01-contact-logs-spec.md`](./01-contact-logs-spec.md) §13／§14（Firebase 推播邊界已預留）

---

## 1. 背景與已知條件

- [`01-contact-logs-spec.md`](./01-contact-logs-spec.md) §13／§14 已預留 Firebase 推播邊界，本文件決定並記錄「前景如何得知最新通知」的方案與實作。
- 規模：約 100 人白名單學員，每人約 2 篇 Profile；`POST /api/contact-logs` 對同一 Profile 有 1 天冷卻期（見前置文件 §7），不是完全無限制。
- 部署於 Vercel serverless，無長駐 process，推播只能掛在 API request 內同步觸發。
- `push_subscriptions` table 已存在於 Turso（Drizzle 已 migrate）。
- 背景通知兩方案皆走 FCM + service worker，無分歧；差異僅在**前景**如何得知更新。

## 2. 兩個方案

- **方案一**（採用）：FCM foreground `onMessage()` + focus/visibilitychange 時打既有 REST API 補資料，不新增資料庫。
- **方案二**：另建 Firestore 存通知狀態，前端 `onSnapshot()` 即時訂閱；Turso 仍是權威來源，每次 mutation 需雙寫。

### 2.1 核心原理差異

| | 方案一：FCM | 方案二：Firestore |
| --- | --- | --- |
| 資料變化偵測 | 無監看機制；`createContactLog()` 成功後由程式碼**主動呼叫**推播 | Firestore 內建 watch，write 自動觸發廣播 |
| 傳輸 | 瀏覽器 Push API，OS 層常駐連線，與分頁無關 | WebChannel（類 WebSocket），僅頁面存活時有效 |
| 權限門檻 | 需 Notification `granted`；拒絕則前景也失效 | 不受通知權限限制 |
| 斷線補送 | 無，靠 REST fallback 補 | 內建 resume token 自動補送 |
| 正確性保證 | 依賴每個寫入路徑都記得呼叫推播 | 資料庫結構保證，無需人為記得 |

## 3. 綜合比較

| 面向 | 方案一 | 方案二 |
| --- | --- | --- |
| 真相來源 | 單一（Turso） | 雙重（Turso + Firestore，需雙寫） |
| 身份系統 | 沿用 NextAuth | 需額外橋接 Firebase Auth（custom token） |
| 新增基礎設施 | Firebase 專案 | + Firestore、security rules |
| 一致性風險 | 低 | 高（雙寫失敗可能不同步） |
| 開發／維運成本 | 低 | 高 |
| 與 100 人規模匹配度 | 匹配 | 過度設計 |
| 符合前置文件 §13 單一已讀來源精神 | 是 | 否 |

## 4. 共通風險（與方案選擇無關）

- **推播轟炸**：前置文件 §7 的 1 天冷卻期已經在來源端擋掉同一 Profile 的重複申請，大幅降低這個風險；但冷卻期是以 `(fromUserId, profileId)` 為單位，同一 `toUser` 名下多篇 Profile 仍可能在同一天各收到一則推播，屬預期行為，不需額外節流。
- **iOS 限制**：僅「已加到主畫面」的 PWA 能收背景推播，一般分頁不支援。
- **隱私**：payload 不可含 `contactInfo`、`motivation` 等限定可見內容。
- **環境隔離**：Preview／Production 建議分開 Firebase 專案，避免測試推播打到正式用戶。

## 5. 結論

採用**方案一**：100 人規模不需要方案二解決的高併發即時同步；方案一維持單一真相來源、免額外身份橋接與雙寫，開發與除錯成本低；主要缺點（前景漏接）可用低成本 REST fallback 抵銷。未來若出現多端即時同步的廣泛需求，再重新評估 Firestore。

## 6. 前景實作：`NotificationProvider` mount 流程

方案一實作於 `src/app/(authenticated)/(platform)/_providers/notification-provider.tsx` 的 mount effect，分三個互不依賴的子流程並行啟動：

```text
NotificationProvider mount
│
├─ ① Push 基礎建設
│    ├─ register Service Worker
│    └─ 已授權的話重新註冊 FCM Token
│
├─ ② 即時更新
│    └─ foreground FCM
│          ↓
│       refetch notifications
│
└─ ③ 保底同步
     ├─ window focus
     └─ tab visible
           ↓
        refetch notifications
```

| 子流程 | 呼叫（`push-client.ts`） | 說明 |
| --- | --- | --- |
| ① Push 基礎建設 | `registerFirebaseServiceWorker()` | 註冊 `/firebase-messaging-sw.js`；冪等，重複呼叫回傳既有 registration，可安全在每次 mount 呼叫 |
| | `reregisterPushTokenIfGranted()` | 只在瀏覽器已經是 `Notification.permission === "granted"` 時靜默重新註冊 token（例如 token 輪替）；**不會主動跳權限請求**，首次開通仍需另外呼叫 context 上的 `enablePushNotifications()`（目前尚未接 UI，見前置文件） |
| ② 即時更新 | `listenForForegroundMessages(refetch)` | 訂閱 FCM `onMessage()`；收到訊息不解析 payload 內容，只當作「有更新」的訊號觸發 refetch——真正資料仍只信任 REST API，呼應 §2.1「正確性保證」的單一真相來源原則 |
| ③ 保底同步 | `window` 的 `focus`、`document` 的 `visibilitychange` | 涵蓋 FCM 漏接、token 還沒就緒、或使用者拒絕通知權限的情況；`visibilitychange` 會濾掉切到背景的事件，只在變回可見時觸發 |

三個子流程共用同一個 `refetchNotifications`（`GET /api/contact-logs?role=received&withinDays=30`），透過 `mergeNotifications` 合併結果：以本地既有的 `readAt` 為準（保留樂觀更新，不被 refetch 蓋回未讀），只用伺服器資料補上本地還沒有的新紀錄。effect 的 cleanup 會取消 FCM 訂閱、移除 focus/visibilitychange 監聽，避免元件重新掛載時重複訂閱。
