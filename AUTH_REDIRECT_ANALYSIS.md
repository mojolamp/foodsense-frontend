# 認證重導向問題分析

## 問題描述

E2E 測試「未登入時應該重導向到登入頁面」失敗：
- 預期：訪問 `/dashboard` 時應該重導向到 `/login`
- 實際：直接顯示 `/dashboard` 頁面

## 現有架構分析

### ✅ 已有 Middleware（服務端重導向）

**檔案**: `middleware.ts` (根目錄)
```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

**檔案**: `src/lib/supabase/middleware.ts`
```typescript
if (isProtectedRoute && !user) {
  return NextResponse.redirect('/login')
}
```

**邏輯**: 正確 ✅ - 應該在服務端重導向未登入用戶

### ❌ 問題所在

1. **Dashboard Layout 的客戶端檢查**
   - `src/app/(dashboard)/layout.tsx` 使用 `useEffect` 進行客戶端認證檢查
   - 如果 middleware 沒有正確運行，客戶端檢查是 fallback
   - 但客戶端重導向是異步的，測試可能沒有等待

2. **測試環境問題**
   - Playwright 測試中，即使清除了 cookies，可能仍有其他狀態
   - Middleware 可能在開發環境中的行為與測試環境不同

## 修復方案（純前端，不觸碰後端）

### 方案 1：改進測試（推薦）

測試應該等待重導向完成，或檢查 URL 變化。

### 方案 2：確保 Middleware 正確執行

檢查 middleware 是否在所有情況下都正確運行。

### 方案 3：改進 Dashboard Layout

確保客戶端檢查也能正確重導向（作為 fallback）。

## 是否觸碰後端？

❌ **不會觸碰後端**

所有修改都是前端：
- Middleware（Next.js 服務端中間件，但仍是前端代碼）
- Dashboard Layout（React 組件）
- 測試代碼（Playwright E2E 測試）

不涉及：
- 後端 API 修改
- 資料庫修改
- 認證服務器配置

