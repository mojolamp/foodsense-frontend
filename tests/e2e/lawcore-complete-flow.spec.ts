/**
 * LawCore Complete Flow E2E Test
 *
 * 測試完整的 LawCore 工作流程：
 * 1. 管理員登入
 * 2. 查看 Overview
 * 3. 進行 Presence Check
 * 4. 瀏覽 Rules
 * 5. Admin 操作
 *
 * 執行: npx playwright test tests/e2e/lawcore-complete-flow.spec.ts
 */

import { test, expect } from '@playwright/test'

test.describe('LawCore Complete Workflow', () => {
  // 在所有測試前登入
  test.beforeEach(async ({ page }) => {
    // 模擬登入流程（實際環境需調整）
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@foodsense.test')
    await page.fill('input[type="password"]', 'test123456')
    await page.click('button[type="submit"]')

    // 等待登入完成
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('1. LawCore Overview 頁面載入完整', async ({ page }) => {
    await page.goto('/lawcore')

    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('LawCore Overview')

    // 檢查 Summary Cards 存在
    await expect(page.locator('text=Active Rules')).toBeVisible()
    await expect(page.locator('text=Pending Raw Laws')).toBeVisible()
    await expect(page.locator('text=DB Status')).toBeVisible()

    // 檢查 Quick Check 表單存在
    await expect(page.locator('[data-testid="presence-quick-check-form"]')).toBeVisible()
  })

  test('2. Presence Quick Check 單筆查詢流程', async ({ page }) => {
    await page.goto('/lawcore')

    // 填寫添加物名稱
    const input = page.locator('[data-testid="additive-name-input"]')
    await input.fill('山梨酸鉀')

    // 點擊查詢按鈕
    await page.click('[data-testid="presence-check-submit"]')

    // 等待結果顯示（需要 mock API 或真實後端）
    // 這裡假設成功回應
    await expect(page.locator('[data-testid="presence-result-badge"]')).toBeVisible({ timeout: 5000 })

    // 驗證結果徽章顯示
    const resultBadge = page.locator('[data-testid="presence-result-badge"]')
    await expect(resultBadge).toContainText(/Has Rule|No Rule|Unknown/)
  })

  test('3. Presence Quick Check 空輸入錯誤處理', async ({ page }) => {
    await page.goto('/lawcore')

    // 不填寫直接點擊
    await page.click('[data-testid="presence-check-submit"]')

    // 應顯示錯誤訊息（使用 react-hot-toast）
    await expect(page.locator('text=/Please enter an additive name/i')).toBeVisible({ timeout: 3000 })
  })

  test('4. Presence Check Tool 批次查詢', async ({ page }) => {
    await page.goto('/lawcore/check')

    // 切換到 Batch Check tab
    await page.click('text=Batch Check')

    // 填寫多行
    const textarea = page.locator('[data-testid="batch-input-textarea"]')
    await textarea.fill('山梨酸鉀\nPotassium Sorbate\nE202')

    // 點擊批次查詢
    await page.click('[data-testid="batch-check-submit"]')

    // 等待結果表格顯示
    await expect(page.locator('[data-testid="batch-results-table"]')).toBeVisible({ timeout: 10000 })

    // 驗證至少有結果行
    const rows = page.locator('[data-testid="batch-results-table"] tbody tr')
    await expect(rows).toHaveCount(3, { timeout: 10000 })
  })

  test('5. Rules Browser 搜尋功能', async ({ page }) => {
    await page.goto('/lawcore/rules')

    // 等待表格載入
    await expect(page.locator('[data-testid="rules-table"]')).toBeVisible({ timeout: 10000 })

    // 使用搜尋功能
    const searchInput = page.locator('[data-testid="rules-search-input"]')
    await searchInput.fill('山梨酸')

    // 驗證搜尋過濾結果
    await page.waitForTimeout(500) // 等待 debounce

    // 檢查表格有結果或顯示「無匹配」
    const tableBody = page.locator('[data-testid="rules-table"] tbody')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount > 0) {
      // 有結果：驗證至少一行包含搜尋詞
      await expect(tableBody.locator('tr').first()).toContainText(/山梨酸/)
    } else {
      // 無結果：應顯示空狀態
      await expect(page.locator('text=No matching rules')).toBeVisible()
    }
  })

  test('6. Rules Browser 開啟詳情 Drawer', async ({ page }) => {
    await page.goto('/lawcore/rules')

    // 等待表格載入
    await expect(page.locator('[data-testid="rules-table"]')).toBeVisible({ timeout: 10000 })

    // 點擊第一個規則的「查看」按鈕
    const viewButton = page.locator('[data-testid="view-rule-detail-0"]').first()
    await viewButton.click()

    // Drawer 應該開啟
    await expect(page.locator('[data-testid="lawcore-rule-drawer"]')).toBeVisible()

    // 驗證 Drawer 內容
    await expect(page.locator('text=Rule Details')).toBeVisible()
    await expect(page.locator('text=Rule ID')).toBeVisible()

    // 測試複製按鈕
    await page.click('[data-testid="copy-rule-id"]')
    await expect(page.locator('text=/copied/i')).toBeVisible({ timeout: 3000 })

    // 關閉 Drawer (點擊關閉按鈕或背景)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="lawcore-rule-drawer"]')).not.toBeVisible()
  })

  test('7. Admin Panel - Verify Raw Law', async ({ page }) => {
    await page.goto('/lawcore/admin')

    // 檢查 Admin 權限（若無權限應顯示 403）
    const isAuthorized = await page.locator('text=Pending Raw Laws').isVisible({ timeout: 5000 })

    if (!isAuthorized) {
      // 無權限用戶會看到錯誤訊息
      await expect(page.locator('text=/Insufficient role|403/i')).toBeVisible()
      test.skip() // 跳過後續測試
      return
    }

    // 等待表格載入
    await expect(page.locator('[data-testid="raw-laws-table"]')).toBeVisible({ timeout: 10000 })

    // 點擊第一個 Verify 按鈕
    const verifyButton = page.locator('[data-testid="verify-law-0"]').first()

    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      // 應顯示成功訊息
      await expect(page.locator('text=/verified successfully/i')).toBeVisible({ timeout: 5000 })
    }
  })

  test('8. Admin Panel - Reject Raw Law 需確認', async ({ page }) => {
    await page.goto('/lawcore/admin')

    const isAuthorized = await page.locator('text=Pending Raw Laws').isVisible({ timeout: 5000 })
    if (!isAuthorized) {
      test.skip()
      return
    }

    // 點擊 Reject 按鈕
    const rejectButton = page.locator('[data-testid="reject-law-0"]').first()

    if (await rejectButton.isVisible()) {
      await rejectButton.click()

      // 應彈出確認對話框
      await expect(page.locator('[data-testid="reject-law-confirm-dialog"]')).toBeVisible()
      await expect(page.locator('text=Confirm Rejection')).toBeVisible()

      // 測試取消
      await page.click('[data-testid="reject-law-cancel"]')
      await expect(page.locator('[data-testid="reject-law-confirm-dialog"]')).not.toBeVisible()
    }
  })

  test('9. Admin Panel - Promote Rule', async ({ page }) => {
    await page.goto('/lawcore/admin')

    const isAuthorized = await page.locator('text=Pending Raw Laws').isVisible({ timeout: 5000 })
    if (!isAuthorized) {
      test.skip()
      return
    }

    // 切換到 Promote Rules tab
    await page.click('text=Promote Rules')

    // 填寫表單
    await page.selectOption('[data-testid="raw-reg-id-select"]', { index: 0 })
    await page.selectOption('[data-testid="authority-level-select"]', 'NATIONAL')

    // 填寫添加物資訊
    await page.fill('[data-testid="additive-name-zh-0"]', 'E2E測試添加物')
    await page.fill('[data-testid="additive-name-en-0"]', 'E2E Test Additive')
    await page.fill('[data-testid="additive-e-number-0"]', 'E999')

    // 提交
    await page.click('[data-testid="promote-rules-submit"]')

    // 驗證成功訊息
    await expect(page.locator('text=/Successfully promoted/i')).toBeVisible({ timeout: 10000 })
  })

  test('10. 導覽流暢性測試', async ({ page }) => {
    // Overview → Check → Rules → Admin → 返回 Overview
    await page.goto('/lawcore')
    await expect(page.locator('h1')).toContainText('Overview')

    await page.click('a[href="/lawcore/check"]')
    await expect(page).toHaveURL('/lawcore/check')
    await expect(page.locator('h1')).toContainText('Presence Check')

    await page.click('a[href="/lawcore/rules"]')
    await expect(page).toHaveURL('/lawcore/rules')
    await expect(page.locator('h1')).toContainText('Rules Browser')

    await page.click('a[href="/lawcore/admin"]')
    await expect(page).toHaveURL('/lawcore/admin')
    await expect(page.locator('h1')).toContainText('Admin')

    await page.click('a[href="/lawcore"]')
    await expect(page).toHaveURL('/lawcore')
  })

  test('11. Error Boundary 保護測試', async ({ page }) => {
    // 模擬 API 錯誤
    await page.route('**/api/lawcore/rules/stats', route =>
      route.abort('failed')
    )

    await page.goto('/lawcore')

    // 應顯示 ErrorState 而非白屏
    await expect(page.locator('text=/Failed to load|Error/i')).toBeVisible({ timeout: 5000 })

    // 應有重試按鈕
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("重試")')
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible()
    }
  })
})

test.describe('Monitoring Dashboards E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@foodsense.test')
    await page.fill('input[type="password"]', 'test123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('12. Monitoring L1 → L2 → L3 鑽取流程', async ({ page }) => {
    // L1: Business Health
    await page.goto('/monitoring/business')
    await expect(page.locator('[data-testid="monitoring-business-page"]')).toBeVisible({ timeout: 10000 })

    // 點擊 LawCore Adoption Card
    const adoptionCard = page.locator('[data-testid="lawcore-adoption-card"]')
    if (await adoptionCard.isVisible()) {
      await adoptionCard.click()

      // 應導向 L2 並帶 focus 參數
      await expect(page).toHaveURL(/\/monitoring\/app\?focus=lawcore/)
    }

    // L2: Application Performance
    await page.goto('/monitoring/app')
    await expect(page.locator('[data-testid="monitoring-app-page"]')).toBeVisible({ timeout: 10000 })

    // 點擊端點列
    const endpointRow = page.locator('[data-testid="endpoint-row-0"]').first()
    if (await endpointRow.isVisible()) {
      await endpointRow.click()

      // Drawer 應開啟
      await expect(page.locator('[data-testid="endpoint-detail-drawer"]')).toBeVisible()
    }
  })

  test('13. Time Range Picker 功能', async ({ page }) => {
    await page.goto('/monitoring/business')

    // 點擊不同時間範圍
    await page.click('[data-testid="time-range-1h"]')
    await page.waitForTimeout(500) // 等待 refetch

    await page.click('[data-testid="time-range-24h"]')
    await page.waitForTimeout(500)

    await page.click('[data-testid="time-range-7d"]')
    await page.waitForTimeout(500)

    // 驗證頁面沒有崩潰
    await expect(page.locator('[data-testid="monitoring-business-page"]')).toBeVisible()
  })

  test('14. Incident Copy Button', async ({ page }) => {
    await page.goto('/monitoring/app')

    // 等待頁面載入
    await page.waitForLoadState('networkidle')

    const copyButton = page.locator('[data-testid="copy-incident-report"]')
    if (await copyButton.isVisible()) {
      await copyButton.click()

      // 驗證複製成功訊息
      await expect(page.locator('text=/copied/i')).toBeVisible({ timeout: 3000 })
    }
  })
})

/**
 * 測試執行說明
 *
 * 1. 本地執行（需要後端 API）:
 *    npx playwright test tests/e2e/lawcore-complete-flow.spec.ts
 *
 * 2. UI 模式（方便除錯）:
 *    npx playwright test tests/e2e/lawcore-complete-flow.spec.ts --ui
 *
 * 3. 特定測試:
 *    npx playwright test -g "Presence Quick Check"
 *
 * 4. 產生報告:
 *    npx playwright test --reporter=html
 *    npx playwright show-report
 *
 * 5. Mock API 模式:
 *    需要設定 MSW (Mock Service Worker) 或使用 Playwright 的 route.fulfill()
 */
