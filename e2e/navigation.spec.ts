import { test, expect } from '@playwright/test'

test.describe('頁面導航', () => {
  test('首頁應該正確載入', async ({ page }) => {
    await page.goto('/')

    // 檢查頁面是否成功載入
    await expect(page).toHaveTitle(/FoodSense/i)
  })

  test('登入頁面應該有正確的表單元素', async ({ page }) => {
    await page.goto('/login')

    // 檢查頁面基本結構
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/密碼/i)
    const submitButton = page.getByRole('button', { name: /登入/i })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
  })
})

test.describe('頁面可訪問性', () => {
  test('登入頁面應該有正確的焦點順序', async ({ page }) => {
    await page.goto('/login')

    // Tab 導航應該先到 email 輸入框
    await page.keyboard.press('Tab')
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused()
  })
})
