# Google OAuth 設定手冊（Runbook）

> **文件版本：** 0.2（草稿，待 review）  
> **對象：** 負責 Google Cloud Console 設定的人員（不需會寫程式）  
> **使用階段：** Phase 1（在 RD 寫 Auth.js 之前或同時進行）

---

## 1. 這份文件做什麼

逐步指引如何在 **Google Cloud Console** 建立 Google 登入所需的設定。

**本文件不涉及程式碼。** RD 實作請依文件 03。

### 你在 Console 會設定兩件事（順序不可顛倒）

| 步驟 | Console 項目             | 白話用途                                        | 產出                     |
| ---- | ------------------------ | ----------------------------------------------- | ------------------------ |
| 1    | **OAuth Consent Screen** | 使用者登入時看到的 app 名稱、授權說明、支援信箱 | 對外登入畫面             |
| 2    | **OAuth Client ID**      | app 的登入通行證 + 允許導回的網址清單           | Client ID、Client Secret |

---

## 2. 前置條件

### 需要的權限

- [ ] 可登入 Google Cloud Console 的 Google 帳號（⏳ TBD：社群專用帳號？）
- [ ] 該帳號有 GCP 專案的 Owner 或 Editor 權限

### 需要的資訊（設定 redirect URI 用）

| 環境       | Redirect URI                                     | 狀態              |
| ---------- | ------------------------------------------------ | ----------------- |
| Dev        | `http://localhost:3000/api/auth/callback/google` | ✅ 現在就能設定   |
| Staging    | `https://staging.<TBD>/api/auth/callback/google` | ⏳ 網域確定後追加 |
| Production | `https://app.<TBD>/api/auth/callback/google`     | ⏳ 網域確定後追加 |

> **Auth.js callback path 固定為 `/api/auth/callback/google`，請勿自行修改。**

---

## 3. 建立 GCP 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 使用 ⏳ TBD 帳號登入
3. 點選頂部專案選擇器 → **New Project**
4. 專案名稱建議：`mentorship-exchange`（或團隊共識名稱）
5. 建立完成後，確認已切換到該專案

---

## 4. 設定 OAuth Consent Screen

> **這一步設定的是「使用者登入 Google 時看到的畫面」**，不是 env、也不是程式碼。

1. 左側選單 → **APIs & Services** → **OAuth consent screen**
2. 選擇 User Type：
   - **External**：任何 Google 使用者可登入（一般 SaaS 用這個）
   - **Internal**：僅限同 Google Workspace 組織（若產品僅限公司內部）
3. 填寫 App information：

   | 欄位                    | 建議值                              | 用途                           | 是否放 env |
   | ----------------------- | ----------------------------------- | ------------------------------ | ---------- |
   | App name                | Mentorship Exchange（或正式產品名） | 授權頁顯示的 app 名稱          | ❌         |
   | User support email      | ⏳ TBD（如社群信箱）                | 授權頁顯示；使用者有問題可聯絡 | ❌         |
   | Developer contact email | ⏳ TBD                              | Google 通知開發團隊用          | ❌         |

4. **Scopes** → Add or Remove Scopes → 選擇：
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`

5. **Test users**（若 App 仍在 Testing 模式）：
   - 加入需要試登入的 Gmail（含 RD、Tech Lead 的**個人 Gmail** 即可）
   - Testing 模式下，**只有 test users 能登入**——與 Console 管理者帳號可以不同

6. 儲存並繼續

### Testing vs Production（已發布）模式

| 模式              | 誰能登入                  | 何時使用           |
| ----------------- | ------------------------- | ------------------ |
| **Testing**       | 僅 test users（上限 100） | 開發 POC、內部測試 |
| **In production** | 任何 Google 使用者        | 正式上線           |

> 本階段 scope 僅 `email` + `profile` + `openid`，通常**不需要** Google 額外 verification 即可發布。  
> 正式上線前將 App 切至 **In production**。

---

## 5. 建立 OAuth Client ID

> **這一步產出 Client ID / Secret**，RD 會放進 env；redirect URI 也在這裡設定。

1. 左側選單 → **APIs & Services** → **Credentials**
2. 點 **+ Create Credentials** → **OAuth client ID**
3. Application type：**Web application**
4. Name 建議：`mentorship-exchange-web`

### Authorized JavaScript origins（可選，部分流程需要）

Dev 可先加：

```
http://localhost:3000
```

Staging / Production 待網域確定後追加：

```
https://staging.<TBD>
https://app.<TBD>
```

### Authorized redirect URIs（必填）

**現在就加：**

```
http://localhost:3000/api/auth/callback/google
```

**網域確定後追加（不要刪 localhost）：**

```
https://staging.<TBD>/api/auth/callback/google
https://app.<TBD>/api/auth/callback/google
```

5. 點 **Create**
6. 記下畫面上顯示的：
   - **Client ID**
   - **Client Secret**（只顯示一次，請立即保存）

---

## 6. 產出物交接

### 交接清單

| 項目           | 值                                | 交接方式                                       |
| -------------- | --------------------------------- | ---------------------------------------------- |
| Client ID      | `xxxx.apps.googleusercontent.com` | ⏳ TBD（1Password / 安全通道）                 |
| Client Secret  | `GOCSPX-xxxx`                     | ⏳ TBD（**不可** email 明文、不可 commit git） |
| GCP Project ID |                                   | 記錄於團隊 wiki 或 01-overview                 |

### RD 會將這些值放入環境變數

```bash
AUTH_GOOGLE_ID=<Client ID>
AUTH_GOOGLE_SECRET=<Client Secret>
```

詳見文件 03。

---

## 7. 追加新環境 Redirect URI（之後再做）

當 infra 提供 staging / prod URL 後：

1. 回到 **Credentials** → 點選已建立的 OAuth client
2. 在 **Authorized redirect URIs** 區塊 **追加** 新 URI（不要刪除 localhost）
3. 儲存
4. 通知 RD 更新對應環境的 `AUTH_URL`

> Google Console 變更通常**立即生效**，無需等待。

---

## 8. 常見錯誤對照

| 錯誤訊息                  | 可能原因                                        | 解法                                                |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `redirect_uri_mismatch`   | redirect URI 與 Console 設定不一致              | 比對 URI 是否完全一致（含 http/https、port、path）  |
| `access_denied`           | App 在 Testing 模式，使用者不在 test users      | 將使用者 Gmail 加入 test users，或切換至 Production |
| `invalid_client`          | Client ID / Secret 錯誤或 env 未設定            | 檢查 `.env.local` 與 Console 值是否一致             |
| 登入後馬上跳回未登入      | `AUTH_URL` 與實際網址不符                       | 確認 `AUTH_URL=http://localhost:3000`（dev）        |
| `Error 403: org_internal` | Consent screen 設為 Internal 但使用者非組織成員 | 改 External 或確認使用者 Workspace                  |

---

## 9. 安全注意事項

- [ ] Client Secret **不可** commit 至 git（`.env.local` 已在 `.gitignore`）
- [ ] 正式環境 secret 使用 Vercel / GCP Secret Manager 等托管
- [ ] 若 Secret 外洩，立即在 Console **Reset secret** 並更新所有環境
- [ ] 定期確認 GCP 專案只有必要人員有存取權

---

## 10. Runbook 驗證 Checklist

完成設定後，勾選以下項目：

- [ ] GCP 專案已建立
- [ ] OAuth consent screen 已設定（scopes: openid, email, profile）
- [ ] OAuth Web Client 已建立
- [ ] Dev redirect URI 已加入：`http://localhost:3000/api/auth/callback/google`
- [ ] Client ID / Secret 已安全交接給 RD
- [ ] （可選）Tech Lead 本機登入測試成功

---

## 11. 修訂紀錄

| 版本 | 日期       | 變更                             |
| ---- | ---------- | -------------------------------- |
| 0.2  | 2026-08-13 | 補充各步驟用途說明；精簡交叉引用 |
