# QA 修復實作指南

**基於:** QA_TESTING_REPORT.md
**目標:** 完成所有 P0 項目，準備上線
**預估總工時:** 43 小時 (~5.5 人天)

---

## 📋 修復清單總覽

| # | 項目 | 優先級 | 預估工時 | 狀態 |
|---|------|--------|---------|------|
| 1 | data-testid 屬性 | P0 | 4h | ⏳ 進行中 |
| 2 | WCAG 色彩對比 | P0 | 2h | ✅ 完成 |
| 3 | Error Boundary | P0 | 3h | ⏳ 待開始 |
| 4 | ARIA 標籤 | P0 | 6h | ⏳ 待開始 |
| 5 | 行動裝置優化 | P0 | 8h | ⏳ 待開始 |
| 6 | 確認對話框 | P0 | 4h | ⏳ 待開始 |
| 7 | E2E 測試 | P0 | 16h | ⏳ 待開始 |

---

## 1️⃣ data-testid 屬性 (4 小時)

### 目標

所有互動元素必須有 `data-testid` 以便 E2E 測試選取。

### 命名規範

```
元件名-元素類型-操作
```

範例：
- `presence-check-submit` (Presence Check 的 Submit 按鈕)
- `additive-name-input` (Additive Name 輸入框)
- `rule-detail-drawer` (Rule 詳情 Drawer)

### 需修改檔案清單 (49 處)

#### LawCore 元件

**PresenceQuickCheck.tsx** ✅ 部分完成
```tsx
<Input data-testid="additive-name-input" aria-label="Additive name" />
<Button data-testid="presence-check-submit" type="submit">Check</Button>
<div data-testid="presence-result-container">
  <PresenceResultBadge data-testid="presence-result-badge" />
</div>
```

**PresenceBatchCheck.tsx** ⏳ 待完成
```tsx
<Textarea data-testid="batch-input-textarea" />
<Button data-testid="batch-check-submit">Check All</Button>
<Button data-testid="export-csv-button">Export CSV</Button>
<table data-testid="batch-results-table">
  {/* 每一行加 data-testid="batch-result-row-{idx}" */}
</table>
```

**RulesTable.tsx** ⏳ 待完成
```tsx
<Input data-testid="rules-search-input" />
<table data-testid="rules-table">
  <tbody>
    {rules.map((rule, idx) => (
      <tr key={rule.rule_id} data-testid={`rule-row-${idx}`}>
        <Button data-testid={`copy-rule-id-${idx}`} />
        <Button data-testid={`view-rule-detail-${idx}`} />
      </tr>
    ))}
  </tbody>
</table>
```

**LawcoreRuleDrawer.tsx** ⏳ 待完成
```tsx
<Drawer data-testid="lawcore-rule-drawer">
  <Button data-testid="copy-rule-id">Copy</Button>
  <Button data-testid="copy-raw-reg-id">Copy</Button>
</Drawer>
```

**RawLawsTable.tsx** ⏳ 待完成
```tsx
<table data-testid="raw-laws-table">
  {laws.map((law, idx) => (
    <tr key={law.raw_reg_id} data-testid={`raw-law-row-${idx}`}>
      <Button data-testid={`verify-law-${idx}`}>Verify</Button>
      <Button data-testid={`reject-law-${idx}`}>Reject</Button>
    </tr>
  ))}
</table>
```

**PromoteRulesForm.tsx** ⏳ 待完成
```tsx
<select data-testid="raw-reg-id-select" />
<select data-testid="authority-level-select" />
<Input data-testid="effective-from-input" />
{additives.map((_, idx) => (
  <div key={idx}>
    <Input data-testid={`additive-name-zh-${idx}`} />
    <Input data-testid={`additive-name-en-${idx}`} />
    <Input data-testid={`additive-e-number-${idx}`} />
    <Button data-testid={`remove-additive-${idx}`} />
  </div>
))}
<Button data-testid="add-additive-row">Add Row</Button>
<Button data-testid="promote-rules-submit">Promote Rules</Button>
```

#### Monitoring 元件

**TimeRangePicker.tsx** ⏳ 待完成
```tsx
<div data-testid="time-range-picker">
  {ranges.map(range => (
    <Button key={range.value} data-testid={`time-range-${range.value}`}>
      {range.label}
    </Button>
  ))}
</div>
```

**EndpointTable.tsx** ⏳ 待完成
```tsx
<table data-testid="endpoint-table">
  {endpoints.map((ep, idx) => (
    <tr key={idx} data-testid={`endpoint-row-${idx}`}>
      {/* cells */}
    </tr>
  ))}
</table>
```

**IncidentCopyButton.tsx** ⏳ 待完成
```tsx
<Button data-testid="copy-incident-report" onClick={handleCopy}>
  Copy Incident Report
</Button>
```

#### 頁面

**所有頁面** ⏳ 待完成
```tsx
// 每個頁面的主要容器
<div data-testid="lawcore-overview-page">
<div data-testid="presence-check-page">
<div data-testid="rules-browser-page">
<div data-testid="lawcore-admin-page">
<div data-testid="monitoring-business-page">
<div data-testid="monitoring-app-page">
<div data-testid="monitoring-infra-page">
```

---

## 2️⃣ WCAG 色彩對比修正 (2 小時) ✅ 已完成

### 變更

**PresenceResultBadge.tsx**
```diff
- className: 'bg-yellow-100 text-yellow-800 border-yellow-200'  // 對比度 3.2:1 ❌
+ className: 'bg-yellow-100 text-yellow-900 border-yellow-300'  // 對比度 7.2:1 ✅
```

### 驗證

使用 Chrome DevTools:
1. 檢查元素
2. Accessibility tab
3. 確認 Contrast ratio >= 4.5:1 (AA 標準)

---

## 3️⃣ Error Boundary (3 小時)

### 目標

每個頁面加入 Error Boundary，防止錯誤導致整個 app crash。

### 實作步驟

#### Step 1: 確認 ErrorBoundary 元件存在

檢查 `src/components/ErrorBoundary.tsx` 是否已存在（你的 README 有提到）

#### Step 2: 修改所有頁面

**範例: src/app/(dashboard)/lawcore/page.tsx**

```tsx
// ❌ 目前
export default function LawCoreOverviewPage() {
  const { data } = useQuery(...)
  return <div>...</div>
}

// ✅ 改為
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ErrorState from '@/components/shared/ErrorState'

export default function LawCoreOverviewPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load LawCore Overview"
          message="An unexpected error occurred. Please refresh the page."
        />
      }
    >
      <LawCoreOverviewContent />
    </ErrorBoundary>
  )
}

function LawCoreOverviewContent() {
  const { data } = useQuery(...)
  return <div>...</div>
}
```

#### Step 3: 需修改的頁面列表

- [ ] `/lawcore/page.tsx`
- [ ] `/lawcore/check/page.tsx`
- [ ] `/lawcore/rules/page.tsx`
- [ ] `/lawcore/admin/page.tsx`
- [ ] `/monitoring/business/page.tsx`
- [ ] `/monitoring/app/page.tsx`
- [ ] `/monitoring/infra/page.tsx`

---

## 4️⃣ ARIA 標籤 (6 小時)

### 目標

讓螢幕閱讀器使用者能正確理解頁面結構。

### 關鍵修改

#### 表單欄位

```tsx
// ❌ 目前
<Input placeholder="Enter additive name" />

// ✅ 改為
<Input
  placeholder="Enter additive name"
  aria-label="Additive name"
  aria-describedby="additive-hint"
  aria-required="true"
/>
<span id="additive-hint" className="sr-only">
  Enter exact additive name (case-sensitive)
</span>
```

#### 按鈕

```tsx
// ❌ 目前
<Button onClick={handleCopy}>
  <Copy className="h-4 w-4" />
</Button>

// ✅ 改為
<Button onClick={handleCopy} aria-label="Copy Rule ID">
  <Copy className="h-4 w-4" aria-hidden="true" />
</Button>
```

#### 表格

```tsx
// ❌ 目前
<table>
  <thead>
    <tr>
      <th>Additive Name</th>
    </tr>
  </thead>
</table>

// ✅ 改為
<table aria-label="Active LawCore rules">
  <caption className="sr-only">List of active regulatory rules</caption>
  <thead>
    <tr>
      <th scope="col">Additive Name</th>
    </tr>
  </thead>
</table>
```

#### Drawer/Modal

```tsx
// ✅ Drawer 開啟時管理焦點
import { useEffect, useRef } from 'react'

function LawcoreRuleDrawer({ open, onClose, rule }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus()
    }
  }, [open])

  return (
    <Drawer open={open} onClose={onClose}>
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close drawer"
      >
        <X />
      </button>
      {/* content */}
    </Drawer>
  )
}
```

### 檢查清單

使用 axe DevTools Chrome Extension:
1. 安裝 https://chrome.google.com/webstore/detail/axe-devtools
2. 開啟頁面
3. 執行 Scan
4. 修正所有 Critical 與 Serious 問題

---

## 5️⃣ 行動裝置優化 (8 小時)

### 問題頁面

| 頁面 | 問題 | 優先級 |
|------|------|--------|
| `/lawcore/check` | 批次查詢表格橫向溢位 | P0 |
| `/monitoring/app` | 端點表格 7 欄無法顯示 | P0 |
| `/monitoring/infra` | 慢查詢 SQL 截斷 | P1 |

### 解決方案: 響應式卡片佈局

**EndpointTable.tsx 修改**

```tsx
export default function EndpointTable({ endpoints, onEndpointClick }) {
  return (
    <>
      {/* 行動裝置: 卡片式 */}
      <div className="md:hidden space-y-3" data-testid="endpoint-cards">
        {endpoints.map((ep, idx) => (
          <Card
            key={idx}
            className="p-4 cursor-pointer hover:shadow-md"
            onClick={() => onEndpointClick?.(ep)}
            data-testid={`endpoint-card-${idx}`}
          >
            <div className="space-y-3">
              {/* 端點名稱與方法 */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs truncate flex-1" title={ep.endpoint}>
                  {ep.endpoint}
                </span>
                <Badge variant="outline" className="shrink-0">{ep.method}</Badge>
              </div>

              {/* 關鍵指標 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Requests</span>
                  <p className="font-medium">{ep.request_count.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">P95</span>
                  <p className={`font-medium ${ep.p95_latency_ms > 1000 ? 'text-red-600' : ''}`}>
                    {ep.p95_latency_ms.toFixed(0)}ms
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Errors</span>
                  <p className="font-medium">{ep.error_count}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Error Rate</span>
                  <p className={`font-medium ${ep.error_rate > 5 ? 'text-red-600' : ''}`}>
                    {ep.error_rate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 平板以上: 表格 */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="endpoint-table">
            {/* 原有表格 */}
          </table>
        </div>
      </div>
    </>
  )
}
```

### 測試方法

Chrome DevTools:
1. Toggle Device Toolbar (Cmd+Shift+M)
2. 選擇 iPhone 14 Pro (390px)
3. 確認無橫向滾動
4. 所有資訊可見且可點擊

---

## 6️⃣ 確認對話框 (4 小時)

### 目標

防止誤操作破壞性動作（Verify/Reject/Promote）

### 需加入確認的操作

1. **Reject Raw Law** (RawLawsTable.tsx)
2. **Promote Rules** (PromoteRulesForm.tsx)
3. **Delete Rule** (若有此功能)

### 實作範例

使用 shadcn/ui 的 AlertDialog 元件

**RawLawsTable.tsx 修改**

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function RawLawsTable({ laws, onVerify, loading }) {
  const [confirmAction, setConfirmAction] = useState<{
    rawRegId: string
    verified: boolean
    lawTitle: string
  } | null>(null)

  const handleConfirm = async () => {
    if (!confirmAction) return

    await onVerify(confirmAction.rawRegId, confirmAction.verified)
    setConfirmAction(null)
  }

  return (
    <>
      <table data-testid="raw-laws-table">
        {laws.map((law, idx) => (
          <tr key={law.raw_reg_id}>
            {/* ... */}
            <td>
              <Button
                data-testid={`verify-law-${idx}`}
                onClick={() => onVerify(law.raw_reg_id, true)}
              >
                Verify
              </Button>

              <Button
                variant="destructive"
                data-testid={`reject-law-${idx}`}
                onClick={() => setConfirmAction({
                  rawRegId: law.raw_reg_id,
                  verified: false,
                  lawTitle: law.title
                })}
              >
                Reject
              </Button>
            </td>
          </tr>
        ))}
      </table>

      {/* 確認對話框 */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent data-testid="reject-law-confirm-dialog">
          <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this law?
            <div className="mt-2 p-2 bg-muted rounded text-sm font-medium">
              {confirmAction?.lawTitle}
            </div>
            <p className="mt-2 text-destructive font-semibold">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="reject-law-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="reject-law-confirm"
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

### 檢查清單

- [ ] Reject 操作有確認對話框
- [ ] Promote 操作有確認對話框
- [ ] 確認對話框顯示操作內容（law title / additives list）
- [ ] Cancel 按鈕正常運作
- [ ] ESC 鍵可關閉對話框
- [ ] 背景點擊可關閉對話框

---

## 7️⃣ E2E 測試 (16 小時)

### 測試框架

Playwright (你的 package.json 已安裝)

### 關鍵測試流程

#### Test 1: LawCore 完整流程

```typescript
// tests/e2e/lawcore/complete-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('LawCore Complete Flow', () => {
  test('管理員完整流程: Verify → Promote → Query', async ({ page }) => {
    // 登入
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@foodsense.test')
    await page.fill('[data-testid="password-input"]', 'test123456')
    await page.click('[data-testid="login-submit"]')

    // Step 1: 前往 Admin Panel
    await page.goto('/lawcore/admin')
    await expect(page.locator('[data-testid="lawcore-admin-page"]')).toBeVisible()

    // Step 2: Verify Raw Law
    await page.click('[data-testid="verify-law-0"]')
    await expect(page.locator('text=verified successfully')).toBeVisible()

    // Step 3: Promote Rule
    await page.click('[aria-label="Promote Rules"]') // Tabs
    await page.selectOption('[data-testid="raw-reg-id-select"]', { index: 0 })
    await page.selectOption('[data-testid="authority-level-select"]', 'NATIONAL')
    await page.fill('[data-testid="additive-name-zh-0"]', '測試添加物')
    await page.click('[data-testid="promote-rules-submit"]')
    await expect(page.locator('text=Successfully promoted')).toBeVisible()

    // Step 4: Query 查詢
    await page.goto('/lawcore/check')
    await page.fill('[data-testid="additive-name-input"]', '測試添加物')
    await page.click('[data-testid="presence-check-submit"]')

    // Verify Result
    await expect(page.locator('[data-testid="presence-result-badge"]')).toContainText('Has Rule')
  })
})
```

#### Test 2: Monitoring 鑽取流程

```typescript
// tests/e2e/monitoring/drill-down.spec.ts
test('Monitoring L1→L2→L3 鑽取', async ({ page }) => {
  await page.goto('/monitoring/business')

  // L1: 點擊 LawCore adoption card
  await page.click('[data-testid="lawcore-adoption-card"]')

  // 應導向 L2 且帶 focus 參數
  await expect(page).toHaveURL(/\/monitoring\/app\?focus=lawcore/)

  // L2: 點擊慢端點
  await page.click('[data-testid="endpoint-row-0"]')

  // Drawer 開啟
  await expect(page.locator('[data-testid="endpoint-detail-drawer"]')).toBeVisible()

  // 看到錯誤詳情
  await expect(page.locator('text=Recent Errors')).toBeVisible()
})
```

#### Test 3: 錯誤處理

```typescript
test('顯示友善錯誤訊息', async ({ page }) => {
  // Mock 503 回應
  await page.route('**/api/lawcore/rules/stats', route =>
    route.fulfill({
      status: 503,
      body: JSON.stringify({ detail: 'Service Unavailable' })
    })
  )

  await page.goto('/lawcore')

  // 應顯示 ErrorState 而非白屏
  await expect(page.locator('text=Failed to load')).toBeVisible()
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
})
```

### 執行測試

```bash
# 本地執行
npx playwright test

# UI 模式 (方便除錯)
npx playwright test --ui

# 產生報告
npx playwright test --reporter=html
```

---

## 📊 進度追蹤

### 每日檢查清單

**Day 1-2:**
- [ ] 完成所有 data-testid 加入 (49 處)
- [ ] 完成所有 ARIA 標籤 (關鍵元件)
- [ ] Code Review

**Day 3:**
- [ ] 所有頁面加 Error Boundary
- [ ] 修正色彩對比 (已完成)
- [ ] 手動測試各頁面

**Day 4-5:**
- [ ] 行動裝置表格改卡片式佈局
- [ ] 測試 iPhone/iPad 各解析度
- [ ] 確認對話框實作

**Day 5-7:**
- [ ] 撰寫 E2E 測試
- [ ] 執行測試並修復問題
- [ ] 最終 Code Review

### 驗收標準

**P0 完成定義:**
- [ ] `npm run scope-guard` 通過
- [ ] `npm run build` 成功
- [ ] 所有 E2E 測試通過
- [ ] Chrome DevTools Lighthouse Accessibility >= 90
- [ ] 行動裝置 (375px) 無橫向滾動
- [ ] 所有破壞性操作有確認對話框

---

## 🛠️ 實用工具

### 1. 批次加入 data-testid

使用 VSCode 多游標編輯：
1. Cmd+F 搜尋 `<Button`
2. Cmd+Shift+L 選取所有匹配
3. 手動加入 `data-testid`

### 2. 色彩對比檢查工具

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Accessibility Tab

### 3. 自動化可存取性掃描

```bash
npm install --save-dev @axe-core/playwright

# 加入 CI
npx playwright test tests/accessibility.spec.ts
```

---

## 📞 遇到問題？

### 常見問題

**Q: data-testid 命名有標準嗎？**
A: 使用 `元件-元素-操作` 格式，例如 `presence-check-submit`

**Q: Error Boundary 會影響效能嗎？**
A: 不會，只在錯誤時才觸發

**Q: 所有表格都要改卡片式嗎？**
A: 只需要超過 3 欄且資訊密度高的表格

**Q: E2E 測試要覆蓋所有功能嗎？**
A: P0 階段先覆蓋關鍵流程（登入、查詢、管理），其他可列入 P1

---

**文件版本:** 1.0.0
**最後更新:** 2025-12-22
**維護者:** QA Team + Frontend Team
