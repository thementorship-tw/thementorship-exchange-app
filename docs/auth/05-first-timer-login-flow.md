# First-Timer 登入流程（產品層）

> **文件版本：** 0.4  
> **狀態：** 下一階段規劃，不在目前 SSO 基礎建設（01～04）的實作範圍內  
> **前置條件：** 階段 A Google SSO 與 Auth.js 整合已完成

---

## 1. 文件目的

描述 **首次使用者** 從登入頁到進入首頁的完整產品流程，包含：

- 登入頁顯示提示：請使用報名 email 登入 Google
- Google SSO
- 比對 email 與學員白名單
- 首次登入：同意隱私政策後建立學員資料
- 不在白名單：登入頁拒絕狀態（含申訴入口）

---

## 2. 與 Google Console Test Users 的差別

| | Google Test users | 學員 email 白名單 |
|--|-------------------|-------------------|
| **設在哪** | Google Cloud Console | 產品資料庫 / 後台 |
| **目的** | 開發階段讓 OAuth 能跑 | 產品規則：只有報名學員能用 |
| **使用階段** | Phase 1 POC | 本文件（下一階段） |
| **上線後** | 切 Production 後可不用 | 持續需要 |

兩者可能同時存在（RD 本機測 OAuth 時），但互不取代。

---

## 3. First-Timer 流程圖

```mermaid
flowchart LR
    Start([開始]) --> LoginPage["登入頁<br/>（提示：請使用報名 email 登入 Google）"]
    LoginPage --> GoogleSSO[Google SSO]
    GoogleSSO --> Whitelist{比對 email<br/>與學員白名單}

    Whitelist -->|否| RejectedLogin["登入頁 · 拒絕狀態<br/>（顯示目前 email、說明、申訴表單入口）"]
    RejectedLogin --> EndReject([結束 · 未進入產品])

    Whitelist -->|是| FirstTime{首次登入？}
    FirstTime -->|是| Privacy[隱私政策頁 · 需同意]
    Privacy --> CreateProfile[建立 / 更新學員資料]
    CreateProfile --> Home[首頁]
    FirstTime -->|否| Home
    Home --> EndOK([結束 · 已登入])

    style GoogleSSO fill:#e8dff5,stroke:#7c3aed
    style Whitelist fill:#fef3c7,stroke:#d97706
    style RejectedLogin fill:#fee2e2,stroke:#dc2626
    style Home fill:#dcfce7,stroke:#16a34a
```

---

## 4. 各步驟說明

| 步驟 | 負責 | 使用階段 | 說明 |
|------|------|----------|------|
| 登入頁（含提示文案） | RD / PM | 下一階段 | 顯示 Google 登入按鈕；提示使用報名 email |
| Google SSO | Auth.js | 階段 A | 取得 `email`、`name` 等 |
| 比對 email 與學員白名單 | RD | 下一階段 | Google 回傳 email 之後，查 DB / 名單 |
| 登入頁 · 拒絕狀態 | RD / PM | 下一階段 | 同一登入頁：顯示目前 email、說明文案、申訴表單入口 |
| 隱私政策（首次） | RD / PM | 下一階段 | 白名單通過且首次登入時，須先同意 |
| 建立 / 更新學員資料 | RD | 下一階段 | 同意隱私政策後寫入 |

---

## 5. 技術層時序（白名單檢查發生在哪）

```mermaid
sequenceDiagram
    actor User as 使用者
    participant Login as 登入頁
    participant Google as Google SSO
    participant Auth as Auth.js
    participant WL as 學員白名單
    participant DB as 學員資料

    User->>Login: 點 Google 登入
    Login->>Google: OAuth
    Google->>Auth: 回傳 email
    Auth->>WL: 比對 email 與白名單
    alt 不在白名單
        Auth->>Login: 拒絕 session
        Login->>User: 登入頁拒絕狀態（email + 說明 + 申訴）
    else 在白名單
        Auth->>User: session 建立
        alt 首次登入
            User->>Login: 同意隱私政策
            Login->>DB: 建立 / 更新學員資料
        end
        Login->>User: 首頁
    end
```

---

## 6. 登入頁 · 拒絕狀態文案（草案）

> 你目前以 **xxx@gmail.com** 登入。  
> 若報名時使用的是其他信箱，請聯繫管理員，或填寫申訴表單。

---

## 7. 待決策（下一階段開工前）

- [ ] 白名單資料從哪來？（後台上傳、報名系統匯入、試算表…）
- [ ] 誰維護白名單？
- [ ] 學員資料要存哪些欄位？
- [ ] 隱私政策是否每次登入都顯示，或僅首次？
- [ ] 申訴表單接哪裡？（Google Form、後台 ticket…）

---

## 8. 修訂紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| 0.1 | 2026-08-13 | 初稿 |
| 0.2 | 2026-08-13 | 流程圖改為由左至右；調整文件語氣 |
| 0.3 | 2026-08-13 | 提示文案併入登入頁節點 |
| 0.4 | 2026-08-13 | 白名單節點文案；拒絕流程合併為同一登入頁；首次登入先同意隱私政策再建檔 |
