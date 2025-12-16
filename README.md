# FoodSense Review Workbench

FoodSense OCR 記錄審核管理系統的前端應用程式。

## 技術棧

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Authentication**: Supabase Auth
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Date Utilities**: date-fns
- **Notifications**: React Hot Toast

## 功能特性

- ✅ 使用者登入/登出 (Supabase Auth)
- ✅ 審核佇列管理
- ✅ 篩選功能 (驗證狀態、信心水平)
- ✅ 審核提交表單
- ✅ 統計儀表板
- ✅ 審核歷史記錄
- ✅ 黃金樣本管理
- ✅ 響應式設計

## 環境設定

1. 複製環境變數範例檔案:

```bash
cp .env.example .env.local
```

2. 設定環境變數:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# （選用 / 僅開發用途）服務端 API key
# - 後端需設定 SERVICE_API_KEYS=["your_dev_key"]
# - ⚠️ 不要在 production 前端暴露任何 service key
# NEXT_PUBLIC_FOODSENSE_DEV_X_API_KEY=your_dev_key
```

3. 安裝依賴:

```bash
npm install
```

## 開發

啟動開發伺服器:

```bash
npm run dev
```

應用程式將在 http://localhost:3000 啟動。

## Supabase 設定

### 建立測試使用者

在 Supabase Dashboard:

1. 進入 **Authentication → Users**
2. 點擊 **Add user → Create new user**
3. Email: `admin@foodsense.test`
4. Password: `test123456`
5. 點擊 **Create user**

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認證相關頁面
│   ├── (dashboard)/       # 儀表板頁面
│   └── providers.tsx      # React Query Provider
├── components/            # React 組件
│   ├── dashboard/         # 儀表板組件
│   ├── layout/            # 佈局組件
│   └── review/            # 審核相關組件
├── hooks/                 # 自定義 React Hooks
├── lib/                   # 工具函數和配置
│   ├── api/              # API 客戶端
│   └── supabase/         # Supabase 客戶端
└── types/                # TypeScript 類型定義
```

## API 端點

後端 API 位於 `http://localhost:8000/api/v1/admin/review`:

- `GET /queue` - 獲取待審核佇列
- `POST /submit` - 提交審核結果
- `GET /stats` - 獲取統計資料
- `GET /history` - 獲取審核歷史
- `GET /gold-samples` - 獲取黃金樣本
- `POST /gold-samples` - 標記為黃金樣本

## 建置

建置生產版本:

```bash
npm run build
npm run start
```

## Lint

執行 ESLint:

```bash
npm run lint
```

## 整合測試

系統提供了自動化整合測試腳本，用於驗證前後端整合狀態：

```bash
./test-integration.sh
```

測試腳本會檢查：
- ✅ 後端 API 連線狀態
- ✅ Review Workbench API 端點可用性
- ✅ CORS 設定
- ✅ 前端環境變數配置

詳細測試指南請參考 [整合測試文件](./INTEGRATION_TEST.md)

## 文件

### 📚 核心文件

- [快速設定指南](./SETUP.md) - 完整的安裝與設定步驟
- [操作使用手冊](./USER_MANUAL.md) - 詳細的功能操作指南 ⭐ **推薦**
- [文件索引](./DOCS_INDEX.md) - 所有文件的導覽索引

### 🔧 技術文件

- [整合測試指南](./INTEGRATION_TEST.md) - API 整合測試說明
- [驗證報告](./VERIFICATION_SUMMARY.md) - 整合驗證結果報告

## 授權

Private
