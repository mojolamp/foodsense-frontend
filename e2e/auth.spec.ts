import { test, expect } from '@playwright/test'

test.describe('認證流程', () => {
  test('應該顯示登入頁面', async ({ page }) => {
    await page.goto('/login')

    // 檢查登入表單元素
    await expect(page.getByRole('heading', { name: /登入/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/密碼/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /登入/i })).toBeVisible()
  })

  test('空白表單提交應該顯示驗證錯誤', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: /登入/i }).click()

    // 檢查是否有驗證提示
    await expect(page.getByText(/email|電子郵件/i)).toBeVisible()
  })

  test('未登入時應該重導向到登入頁面', async ({ page }) => {
    await page.goto('/dashboard')

    // 應該被重導向到登入頁面
    await expect(page).toHaveURL(/login/)
  })
})
