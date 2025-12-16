# FoodSense Review Workbench - 快速設定指南

## 📋 前置需求

- Node.js 18+
- npm 或 yarn
- Supabase 帳號
- 後端 API 已啟動 (http://localhost:8000)

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 到 `.env.local`:

```bash
cp .env.example .env.local
```

編輯 `.env.local`:

```env
# 從 Supabase Dashboard 取得這些值
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 後端 API URL（Review Workbench 會打 /api/v1/admin/review/*）
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# （選用 / 僅開發用途）服務端 API key
# - 後端需設定 SERVICE_API_KEYS=["your_dev_key"]
# - ⚠️ 不要在 production 前端暴露任何 service key
# NEXT_PUBLIC_FOODSENSE_DEV_X_API_KEY=your_dev_key

# 應用程式名稱
NEXT_PUBLIC_APP_NAME=FoodSense Review Workbench
```

### 3. 設定 Supabase

#### 在 Supabase Dashboard:

1. 建立新專案 (如果還沒有)
2. 進入 **Settings → API**
3. 複製以下資訊到 `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 建立測試使用者:

1. 進入 **Authentication → Users**
2. 點擊 **Add user → Create new user**
3. 填寫:
   - Email: `admin@foodsense.test`
   - Password: `test123456`
4. 點擊 **Create user**

### 4. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 http://localhost:3000 啟動。

### 5. 測試登入

1. 瀏覽器開啟 http://localhost:3000
2. 會自動重定向到登入頁面
3. 使用測試帳號登入:
   - Email: `admin@foodsense.test`
   - Password: `test123456`

## 🔧 開發工作流程

### 確認後端 API 正在運行

在開始前端開發之前，確保後端 API 已啟動:

```bash
# 進入 foodsense-bacend/backend
cd /path/to/foodsense-bacend/backend

# 啟動 FastAPI
uvicorn app.main:app --reload --port 8000
```

測試 API:

```bash
curl http://localhost:8000/api/v1/admin/review/stats
```

### 認證（AuthMiddleware）說明

- 後端預設 `AUTH_MODE=optional`：**有/沒有 token 都可呼叫**（方便本機開發）
- 若後端設為 `AUTH_MODE=required`：
  - 前端登入後會自動在每次 API 呼叫帶上 `Authorization: Bearer <supabase_access_token>`
  - 後端需設定 `SUPABASE_JWT_SECRET`（Supabase 專案 JWT secret）才能驗證 token
  - 或在開發/內部工具情境，用 `SERVICE_API_KEYS` + `X-API-Key`（不建議暴露到前端，僅 dev）

### 平行運行前後端

**Terminal 1** (後端):

```bash
cd /path/to/foodsense-bacend/backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2** (前端):

```bash
cd /path/to/foodsense-frontend
npm run dev
```

## 📱 功能測試清單

### ✅ 基本功能

- [ ] 登入/登出
- [ ] 查看儀表板統計
- [ ] 查看審核佇列
- [ ] 篩選審核記錄 (驗證狀態、信心水平)
- [ ] 開啟審核彈窗
- [ ] 提交審核結果
- [ ] 查看審核歷史
- [ ] 查看黃金樣本

### 🎨 UI/UX 測試

- [ ] 響應式設計 (手機、平板、桌面)
- [ ] 側邊欄導航
- [ ] 統計卡片顯示
- [ ] 表格分頁
- [ ] Toast 通知

## 🐛 常見問題

### 1. "Cannot find module '@supabase/ssr'"

**解決方案:**

```bash
npm install @supabase/ssr
```

### 2. "API Error: 404" 或連線錯誤

**可能原因:**

- 後端 API 未啟動
- API URL 設定錯誤

**解決方案:**

```bash
# 確認後端正在運行
curl http://localhost:8000/api/v1/admin/review/stats

# 檢查 .env.local 中的 NEXT_PUBLIC_API_URL
```

### 3. Supabase 登入失敗

**可能原因:**

- Supabase 憑證錯誤
- 使用者未建立

**解決方案:**

1. 檢查 `.env.local` 中的 Supabase URL 和 Key
2. 確認在 Supabase Dashboard 中已建立測試使用者
3. 確認 Email 確認設定:
   - Dashboard → Authentication → Settings
   - 關閉 "Confirm email" (開發環境)

### 4. Middleware 重定向循環

**可能原因:**

- Cookie 設定問題
- Session 刷新失敗

**解決方案:**

```bash
# 清除瀏覽器 Cookie 和 Local Storage
# 重新登入
```

## 📦 生產建置

```bash
# 建置
npm run build

# 預覽生產版本
npm run start
```

## 📚 相關文件

### 專案文件
- [README](./README.md) - 專案概述
- [操作使用手冊](./USER_MANUAL.md) - 完整的功能操作指南
- [整合測試指南](./INTEGRATION_TEST.md) - API 整合測試說明
- [驗證報告](./VERIFICATION_SUMMARY.md) - 整合驗證結果

### 外部文件
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 💡 開發提示

### Hot Reload

前端會自動重載，但如果遇到問題:

```bash
# 停止開發伺服器 (Ctrl+C)
# 清除 .next 快取
rm -rf .next
# 重新啟動
npm run dev
```

### TypeScript 錯誤

```bash
# 檢查 TypeScript 錯誤
npx tsc --noEmit
```

### Tailwind CSS 自動完成

確保在 VSCode 中安裝 "Tailwind CSS IntelliSense" 擴充套件。
