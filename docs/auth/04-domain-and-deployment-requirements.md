# 網域與部署需求規格（給 Infra / 網域負責人）

> **文件版本：** 0.2（草稿，待 review）  
> **對象：** 負責 DNS、部署、網域的同事  
> **使用階段：** Phase 0～1（決定 URL）；Phase 3 前需就緒（staging / prod 驗收）  
> **提出者：** Tech Lead  
> **目的：** 提供 Google SSO 所需的環境 URL，以便設定 OAuth redirect URI

---

## 1. 我們需要什麼

Mentorship Exchange 平台將使用 **Google SSO** 登入。Google OAuth 要求每個環境有**固定、可連線的 HTTPS URL**（本機 dev 除外），作為登入完成後的導回地址。

**我們不需要 infra 設定 OAuth 或 `/api/auth/*` 路由**——那些由應用程式（Auth.js）處理。  
**我們需要的是：確保以下 URL 能指向已部署的 Next.js app。**

---

## 2. 環境 URL 需求

| 環境           | 用途         | Base URL                | Redirect URI（完整）                             | 狀態          |
| -------------- | ------------ | ----------------------- | ------------------------------------------------ | ------------- |
| **Dev**        | RD 本機開發  | `http://localhost:3000` | `http://localhost:3000/api/auth/callback/google` | ✅ 不需 DNS   |
| **Staging**    | 內部測試、QA | `https://staging.<TBD>` | `https://staging.<TBD>/api/auth/callback/google` | ⏳ **待提供** |
| **Production** | 正式使用者   | `https://app.<TBD>`     | `https://app.<TBD>/api/auth/callback/google`     | ⏳ **待提供** |

### 命名建議（可調整）

| 環境       | 建議子網域                      | 備註                                 |
| ---------- | ------------------------------- | ------------------------------------ |
| Staging    | `staging.<product-domain>`      | 例：`staging.thementorship.exchange` |
| Production | `app.<product-domain>` 或根網域 | 團隊可共識                           |

> 以上為**示意**，請 infra 回覆實際會使用的 URL。

---

## 3. Google SSO 固定 Path（請勿變更）

Auth.js 使用的 callback path **固定**如下：

```
/api/auth/callback/google
```

因此：

```
完整 Redirect URI = {Base URL} + /api/auth/callback/google
```

**Infra 不需要在 load balancer / CDN 層特別設定這個 path**——只要 Base URL 指向 app，Next.js 會處理 routing。

---

## 4. 技術要求

### 4.1 HTTPS

| 環境                 | 要求           |
| -------------------- | -------------- |
| Dev（localhost）     | HTTP 可接受    |
| Staging / Production | **必須 HTTPS** |

### 4.2 網域穩定性

- Staging / Production URL **上線後應固定**，避免頻繁更換
- 若 URL 變更，需同步更新 Google OAuth Console 的 redirect URI（額外工程步驟）

### 4.3 部署平台（待確認）

| 選項                | 說明                                  |
| ------------------- | ------------------------------------- |
| Vercel              | 可先使用 `*.vercel.app`，後加自訂網域 |
| GCP（Cloud Run 等） | 可先使用 `*.run.app`，後加自訂網域    |
| 自架                | 需自行處理 TLS 憑證                   |

⏳ **待確認：** 團隊預計使用哪個部署平台？

### 4.4 若 DNS 尚未就緒

- **Dev 不受影響**，RD 可立即用 localhost 開發 SSO
- Staging / Production 的 OAuth 設定可等 URL 確定後再追加
- 請 infra 至少先回覆**預計的網域命名**（即使 DNS 尚未生效）

---

## 5. Infra 交付物

請 infra 完成後提供：

| #   | 交付項目            | 範例                                   |
| --- | ------------------- | -------------------------------------- |
| 1   | Staging Base URL    | `https://staging.example.com`          |
| 2   | Production Base URL | `https://app.example.com`              |
| 3   | 部署平台            | Vercel / GCP / 其他                    |
| 4   | TLS 是否就緒        | 是 / 否 / 預計日期                     |
| 5   | 環境變數注入方式    | Vercel Env / GCP Secret Manager / 其他 |

工程團隊收到後會：

1. 通知 GCP 設定者在 Google Console **追加** redirect URI
2. 在部署環境設定 `AUTH_URL={Base URL}`

---

## 6. 我們不需要 Infra 做的

| 項目                                    | 負責方                          |
| --------------------------------------- | ------------------------------- |
| Google OAuth Client 建立                | GCP 設定者（見 Runbook）        |
| `/api/auth/*` 路由                      | RD（Auth.js 內建）              |
| Session / Cookie 邏輯                   | RD                              |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | 工程團隊（來自 Google Console） |

---

## 7. 時程建議

```
現在：
  Dev（localhost）→ 不需 infra，RD 可立即開始

Phase 1（建議）：
  Infra 確認 staging 命名與部署平台
  → 即使 DNS 未生效，先回覆預計 URL

Phase 2：
  Staging 部署完成 + HTTPS 生效
  → 工程團隊追加 staging redirect URI + 測試

Phase 3：
  Production 網域 + 部署完成
  → 追加 prod redirect URI + smoke test
```

---

## 8. 待 Infra 回覆的問題

- [ ] Staging / Production 的實際 Base URL 是什麼？
- [ ] 預計使用哪個部署平台？
- [ ] 是否使用 Vercel preview URL 作為 staging，或需要獨立子網域？
- [ ] TLS / DNS 預計何時就緒？
- [ ] 環境變數（`AUTH_URL` 等）要注入到哪裡？

---

## 9. 聯絡窗口

| 角色       | 負責內容          | 聯絡人 |
| ---------- | ----------------- | ------ |
| Tech Lead  | 規格、協調        | ⏳ TBD |
| RD         | App 部署、Auth.js | ⏳ TBD |
| GCP 設定者 | Google OAuth 憑證 | ⏳ TBD |
| Infra      | DNS、部署、TLS    | ⏳ TBD |

---

## 10. 修訂紀錄

| 版本 | 日期       | 變更                             |
| ---- | ---------- | -------------------------------- |
| 0.1  | 2026-08-13 | 初稿；dev 確定，staging/prod TBD |
| 0.2  | 2026-08-13 | 補充使用階段與名詞交叉引用       |
