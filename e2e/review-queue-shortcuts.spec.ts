import { test, expect } from '@playwright/test'

test.describe('Review Queue - keyboard shortcuts', () => {
  test.skip(!process.env.E2E_REVIEW_QUEUE_SHORTCUTS, '需要可登入的 E2E 環境與測試資料')

  test('n/p/r 可操作列表並開啟審核 Modal（需啟用 feature flag）', async ({ page }) => {
    // 前置條件：
    // - 環境已能登入，且 /review/queue 有資料
    // - NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS=true
    await page.goto('/review/queue')

    // 若被導向登入頁，代表環境未提供登入憑證/繞過機制
    await expect(page).not.toHaveURL(/login/i)

    // 提示文字（flag 開啟才會出現）
    await expect(page.getByText(/快捷鍵：n\/p/i)).toBeVisible()

    // 移動 active row（依實際資料而定，這裡只驗證不報錯且 row 存在）
    await expect(page.getByTestId('review-queue-row-0')).toBeVisible()
    await page.keyboard.press('n')
    await page.keyboard.press('p')

    // 開啟 Modal
    await page.keyboard.press('r')
    await expect(page.getByText(/Review Workbench/i)).toBeVisible()

    // 關閉（Radix Dialog 預設支援 Esc）
    await page.keyboard.press('Escape')
    await expect(page.getByText(/Review Workbench/i)).toBeHidden()
  })
})




