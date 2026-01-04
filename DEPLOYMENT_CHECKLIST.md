# 🚀 FoodSense LawCore + Monitoring - 部署檢查清單

**版本:** v3.0.0
**最後更新:** 2025-12-22
**適用環境:** Staging / Production

---

## 📋 使用說明

本檢查清單分為三個部署情境，請根據您的使用場景選擇：

| 情境 | 適用對象 | 完成條件 | 預估時間 |
|------|---------|---------|----------|
| **A - 內部 Solo** | CTO 個人使用 | 核心功能 + 基本品質 | 2 天 |
| **B - 團隊內部** | 5-10 人團隊 | 核心功能 + 完整品質 | 1 週 |
| **C - 正式產品** | 外部客戶/公開使用 | 所有功能 + 企業級品質 | 3 週 |

---

## 情境 A: 內部 Solo 使用

### ✅ 前端準備 (必須)

- [ ] **環境變數配置**
  ```bash
  # .env.local 或 .env.production
  NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key>
  NEXT_PUBLIC_API_V1_BASE=<your_backend>/api/v1
  NEXT_PUBLIC_API_V2_BASE=<your_backend>/api
  NEXT_PUBLIC_LAWCORE_BASE=<your_backend>/api/lawcore
  NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
  # （選用 / 內部體驗優化）Review Queue 鍵盤快捷鍵（預設建議 OFF）
  NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS=false
  ```

- [ ] **Scope Lock Guard 通過**
  ```bash
  npm run scope-guard
  # ✅ 預期: Scope Lock Guard PASSED: No violations found
  ```

- [ ] **TypeScript Build 成功**
  ```bash
  npm run build
  # ✅ 預期: Build completed successfully
  ```

- [ ] **基本功能手動測試**
  - [ ] 可登入
  - [ ] LawCore Overview 頁面載入
  - [ ] Presence Check 可輸入（即使後端未ready）
  - [ ] Monitoring 頁面載入（可顯示空狀態）

### ✅ 後端準備 (必須)

- [ ] **LawCore API 端點 (7個)**
  - [ ] `POST /api/lawcore/check-presence` 回應 200
  - [ ] `GET /api/lawcore/rules/stats` 回應 200
  - [ ] 其他 5 個端點至少返回 404（不會 500）

- [ ] **CORS 設定**
  ```python
  # 後端允許前端 origin
  allowed_origins = ["http://localhost:3000"]
  ```

### ⚠️ 已知限制（可接受）

- ⚠️ 無 E2E 測試（手動測試替代）
- ⚠️ 行動裝置體驗一般
- ⚠️ 無確認對話框（小心操作）

### 📦 部署步驟

```bash
# 1. 確認環境變數
cat .env.production

# 2. 建置
npm run build

# 3. 測試建置產物
npm run start
# 訪問 http://localhost:3000/lawcore

# 4. 部署（依您的平台）
# Vercel: vercel --prod
# Docker: docker build -t foodsense-ui .
```

---

## 情境 B: 團隊內部使用 (推薦)

### ✅ 前端準備 (全部必須)

#### 1. 環境與建置
- [ ] 情境 A 的所有項目
- [ ] Error Boundary 已加入所有頁面
  ```bash
  # 檢查: 搜尋所有頁面是否包含 ErrorBoundary
  grep -r "ErrorBoundary" src/app/(dashboard)/lawcore
  grep -r "ErrorBoundary" src/app/(dashboard)/monitoring
  ```

#### 2. data-testid 屬性
- [ ] LawCore 關鍵元件已加入 (14個 data-testid)
  - [ ] `presence-check-submit`
  - [ ] `additive-name-input`
  - [ ] `batch-check-submit`
  - [ ] `batch-input-textarea`
  - [ ] `rules-search-input`
  - [ ] `raw-laws-table`
  - [ ] `promote-rules-submit`
  - [ ] 其他...（參考 QA_FIXES_IMPLEMENTATION_GUIDE.md）

#### 3. WCAG 可存取性
- [ ] 色彩對比修正完成 ✅ (已完成)
- [ ] 所有表單欄位有 aria-label
  ```tsx
  <Input aria-label="Additive name" />
  ```
- [ ] 所有 icon 按鈕有 aria-label
  ```tsx
  <Button aria-label="Copy Rule ID"><Copy /></Button>
  ```

#### 4. 行動裝置優化
- [ ] EndpointTable 改為響應式卡片（375px 測試）
- [ ] BatchResults Table 可橫向滾動
- [ ] 所有頁面在 iPhone 14 Pro 上可用

#### 5. 確認對話框
- [ ] Reject Raw Law 有確認對話框
- [ ] Promote Rules 有確認對話框（可選）

#### 6. E2E 測試
- [ ] 至少 5 個關鍵流程測試通過
  ```bash
  npx playwright test tests/e2e/lawcore-complete-flow.spec.ts
  # ✅ 預期: 5 passed
  ```

### ✅ 後端準備 (全部必須)

- [ ] **所有 LawCore API 端點 (7個)** 正常運作
  ```bash
  # 測試腳本
  curl -X POST http://your-backend/api/lawcore/check-presence \
    -H "Content-Type: application/json" \
    -d '{"additive_name":"山梨酸鉀"}'
  # ✅ 預期: 200 + {"result":"HAS_RULE|NO_RULE|UNKNOWN",...}
  ```

- [ ] **Monitoring API 端點 (4個)** 至少返回 mock 資料
  ```bash
  curl http://your-backend/api/monitoring/business?range=24h
  # ✅ 預期: 200 + {...}
  ```

- [ ] **錯誤處理符合契約**
  - 401 → 導向登入
  - 403 → 顯示權限不足
  - 422 → 顯示輸入錯誤
  - 500/503 → 顯示友善錯誤

### 📊 品質門檻

執行以下檢查，確保達標：

```bash
# 1. Lighthouse Accessibility
npx lighthouse http://localhost:3000/lawcore --only-categories=accessibility
# ✅ 目標: Score >= 90

# 2. 無 Console Errors
# 開啟 Chrome DevTools Console
# ✅ 目標: 無紅色錯誤

# 3. 行動裝置測試
# Chrome DevTools → Toggle Device Toolbar → iPhone 14 Pro
# ✅ 目標: 無橫向滾動，所有功能可用
```

### 📦 部署步驟

```bash
# 1. 執行完整測試
npm run scope-guard
npm run build
npm run test:e2e  # Playwright E2E

# 2. Staging 部署
# 先部署到 staging 環境測試

# 3. 煙霧測試 (Smoke Test)
# - 登入
# - 訪問所有 7 個頁面
# - 執行一次 Presence Check
# - 查看一次 Rule Detail

# 4. Production 部署
# 確認 staging 無問題後部署
```

---

## 情境 C: 正式產品發布

### ✅ 前端準備 (企業級標準)

#### 1-6. 情境 B 的所有項目

#### 7. 完整測試覆蓋
- [ ] **單元測試 >= 80%**
  ```bash
  npm run test:coverage
  # ✅ 目標: Statements 80%, Branches 70%, Functions 80%
  ```

- [ ] **E2E 測試覆蓋所有功能**
  - [ ] LawCore 所有頁面 (10+ tests)
  - [ ] Monitoring 所有頁面 (8+ tests)
  - [ ] 錯誤場景 (5+ tests)

#### 8. 效能優化
- [ ] 大型列表虛擬化
  ```tsx
  // RulesTable.tsx 使用 @tanstack/react-virtual
  ```
- [ ] 圖表 Lazy Loading
- [ ] React Query staleTime 設定

#### 9. 安全性
- [ ] CSP Headers 設定
- [ ] 無 XSS 漏洞（使用 OWASP ZAP 掃描）
- [ ] API Token 不在前端儲存

#### 10. 可存取性 WCAG AA 100%
- [ ] **自動化檢查通過**
  ```bash
  npx playwright test tests/accessibility.spec.ts
  # 使用 @axe-core/playwright
  # ✅ 目標: 0 violations
  ```
- [ ] 鍵盤導航完整
  - Tab 可走訪所有互動元素
  - Enter 可觸發按鈕
  - Esc 可關閉 Modal/Drawer
- [ ] 螢幕閱讀器測試（NVDA/JAWS）

#### 11. 跨瀏覽器測試
- [ ] Chrome >= 120
- [ ] Firefox >= 121
- [ ] Safari >= 17
- [ ] Edge >= 120
- [ ] Mobile Safari (iOS 17)

#### 12. 監控與追蹤
- [ ] Sentry 錯誤追蹤整合
- [ ] Google Analytics / Mixpanel 事件追蹤
- [ ] Lighthouse CI 整合

### ✅ 後端準備 (企業級標準)

- [ ] **所有 11 個 API 端點**正常運作
- [ ] **API 文件** (OpenAPI/Swagger)
- [ ] **Rate Limiting** 設定
- [ ] **日誌記錄** (包含 request_id)
- [ ] **效能監控** (APM)
- [ ] **資料庫備份**策略

### 📊 上線檢查清單

#### Pre-Deployment

```bash
# ✅ 所有測試通過
npm run scope-guard       # Scope lock
npm run build             # TypeScript build
npm run test              # Unit tests
npm run test:e2e          # E2E tests

# ✅ 效能檢查
npx lighthouse https://staging.foodsense.com/lawcore
# Performance >= 90
# Accessibility >= 95
# Best Practices >= 90
# SEO >= 80

# ✅ 安全性掃描
npm audit
# 0 vulnerabilities
```

#### Deployment Day

- [ ] **07:00 - 部署到 Staging**
- [ ] **08:00 - 煙霧測試**
  - [ ] 登入測試 (5 個測試帳號)
  - [ ] 所有頁面載入 (7 個頁面)
  - [ ] 關鍵流程測試 (Presence Check, Promote Rule)
- [ ] **10:00 - 效能測試**
  - [ ] 1000 個並發用戶
  - [ ] P95 latency < 500ms
- [ ] **12:00 - Production 部署**
- [ ] **12:30 - Production 煙霧測試**
- [ ] **13:00 - 監控儀表板檢查**
  - [ ] 無錯誤峰值
  - [ ] P95 latency 正常
- [ ] **14:00 - 通知所有用戶**

#### Post-Deployment

- [ ] **D+1: 監控**
  - 檢查 Sentry 錯誤數量
  - 檢查 Lighthouse CI 報告
- [ ] **D+3: 用戶回饋收集**
- [ ] **D+7: 回顧會議**

---

## 🔍 驗收測試腳本

### 手動測試清單 (15 分鐘)

**Tester:** ___________
**Date:** ___________
**Environment:** [ ] Staging [ ] Production

#### LawCore

- [ ] 1. 訪問 /lawcore，Overview 載入正常
- [ ] 2. Quick Check: 輸入「山梨酸鉀」，得到結果
- [ ] 3. 訪問 /lawcore/check，批次查詢 3 個添加物
- [ ] 4. 點擊「Export CSV」，下載成功
- [ ] 5. 訪問 /lawcore/rules，搜尋「山梨酸」
- [ ] 6. 點擊第一個規則，Drawer 開啟
- [ ] 7. 點擊「Copy Rule ID」，toast 顯示
- [ ] 8. (Admin) 訪問 /lawcore/admin，看到待審法規
- [ ] 9. (Admin) Verify 一個法規，成功訊息顯示
- [ ] 10. (Admin) Reject 一個法規，確認對話框彈出

#### Monitoring

- [ ] 11. 訪問 /monitoring/business，卡片顯示資料
- [ ] 12. 點擊 LawCore Adoption Card，導向 /monitoring/app
- [ ] 13. 點擊一個端點，Drawer 開啟
- [ ] 14. 點擊「Copy Incident Report」，複製成功
- [ ] 15. 訪問 /monitoring/infra，慢查詢表格顯示

**測試結果:** [ ] 全部通過 [ ] 部分失敗 (註記失敗項目)

---

## 🐛 Rollback 計畫

### 觸發條件 (任一符合即回滾)

- [ ] **P0 錯誤:** 無法登入、主要功能完全無法使用
- [ ] **錯誤率 > 5%:** Sentry 錯誤率超過 5%
- [ ] **效能降級 > 50%:** P95 latency 超過 baseline 50%
- [ ] **安全漏洞:** 發現 Critical 或 High 級別漏洞

### Rollback 步驟

```bash
# 1. 立即通知團隊
# Slack: @here Production rollback initiated

# 2. 回滾到上一版本
# Vercel: vercel rollback
# Docker: docker pull foodsense-ui:v2.0.0 && docker restart

# 3. 驗證回滾成功
curl https://foodsense.com/lawcore
# ✅ 預期: 200

# 4. 通知用戶（若有影響）

# 5. 根因分析會議（24小時內）
```

---

## 📞 支援聯絡資訊

| 問題類型 | 聯絡人 | 聯絡方式 |
|---------|--------|---------|
| 部署失敗 | DevOps Lead | devops@foodsense.com |
| 後端 API 問題 | Backend Lead | backend@foodsense.com |
| 前端錯誤 | Frontend Lead | frontend@foodsense.com |
| 效能問題 | SRE Team | sre@foodsense.com |
| 緊急事故 | On-Call | +886-XXX-XXXX |

---

## ✅ 最終簽核

### 情境 A - 內部 Solo

- [ ] **前端 Lead 簽核:** ___________
- [ ] **CTO 核准:** ___________
- [ ] **部署日期:** ___________

### 情境 B - 團隊內部

- [ ] **前端 Lead 簽核:** ___________
- [ ] **QA Lead 簽核:** ___________
- [ ] **CTO 核准:** ___________
- [ ] **部署日期:** ___________

### 情境 C - 正式產品

- [ ] **前端 Lead 簽核:** ___________
- [ ] **QA Lead 簽核:** ___________
- [ ] **Security Team 簽核:** ___________
- [ ] **CTO 核准:** ___________
- [ ] **部署日期:** ___________

---

**清單版本:** v3.0.0
**最後更新:** 2025-12-22
**下次審查:** 部署後 7 天
