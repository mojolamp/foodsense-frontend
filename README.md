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

### Review Workbench
- ✅ 使用者登入/登出 (Supabase Auth)
- ✅ 審核佇列管理
- ✅ 篩選功能 (驗證狀態、信心水平)
- ✅ 審核提交表單
- ✅ 統計儀表板
- ✅ 審核歷史記錄
- ✅ 黃金樣本管理
- ✅ 產品總覽（分頁/篩選/詳情 Drawer）
- ✅ 成分字典（Token 排行 + 詳情 + 批次校正）
- ✅ 規則管理（列表/詳情/建立/啟停/刪除/測試）
- ✅ 資料品質儀表板（KPI / 時序 / 來源貢獻 / 覆蓋率）
- ✅ 產品聚類管理（演算法分群 / 人工合併 / 拆分）
- ✅ 端對端資料流驗證（Gold Sample 測試通過）

### LawCore (v1.0 - Presence Gate Only)
- ✅ 法規資料庫總覽（活動規則統計、待審法規、DB 狀態）
- ✅ 添加物合規查詢工具（單筆/批次查詢、CSV 匯出）
- ✅ 活動規則瀏覽器（搜尋、分頁、詳情 Drawer）
- ✅ 管理面板（待審法規驗證、規則晉升、Admin only）
- 🔒 Scope Lock：禁止 limit/dosage/unit/food_category/fuzzy/compliance

### Monitoring (Three-Layer Defense)
- ✅ L1: Business Health（總請求量、LawCore 採用率、健康評分、成本、流量圖）
- ✅ L2: Application Performance（SLA 狀態、端點效能、錯誤分布、Incident 範本）
- ✅ L3: Infrastructure（DB 大小、慢查詢、表膨脹、未使用索引、維護建議）
- ✅ 鑽取互動（L1→L2→L3 導覽、異常點可點擊）

### 生產準備
- 🚀 生產數據準備就緒（v3.0.0）

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

# Backend API Base URLs (DO NOT CHANGE - Hardcoded contract)
NEXT_PUBLIC_API_V1_BASE=http://localhost:8000/api/v1
NEXT_PUBLIC_API_V2_BASE=http://localhost:8000/api
NEXT_PUBLIC_LAWCORE_BASE=http://localhost:8000/api/lawcore

# Feature Flags
NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS=false

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

應用程式預設在 http://localhost:3000 啟動（若 3000 被占用，Next.js 會自動改用其他可用埠）。

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

### Review Workbench (v1)
- `GET /api/v1/admin/review/queue` - 獲取待審核佇列
- `POST /api/v1/admin/review/submit` - 提交審核結果
- `GET /api/v1/admin/review/stats` - 獲取統計資料
- `GET /api/v1/admin/review/history` - 獲取審核歷史
- `GET /api/v1/admin/review/gold-samples` - 獲取黃金樣本
- `POST /api/v1/admin/review/gold-samples` - 標記為黃金樣本

### Core Data (v2)
- Products list/detail
- Dictionary ranking/detail/batch correct
- Rules CRUD & testing
- Data Quality KPIs
- Clustering operations
- E2E verification

### LawCore (Presence Gate ONLY)
- `POST /api/lawcore/check-presence` - 檢查添加物合規狀態
- `GET /api/lawcore/check-presence/{name}` - 依名稱查詢
- `GET /api/lawcore/rules` - 獲取活動規則列表
- `GET /api/lawcore/rules/stats` - 獲取規則統計
- `GET /api/lawcore/admin/pending-raw-laws` - 獲取待審法規 (Admin only)
- `POST /api/lawcore/admin/verify-raw-law` - 驗證法規 (Admin only)
- `POST /api/lawcore/admin/promote-rule` - 晉升規則 (Admin only)

### Monitoring
- `GET /api/monitoring/business?range=1h|24h|7d` - Business Health (L1)
- `GET /api/monitoring/app?range=...` - Application Performance (L2)
- `GET /api/monitoring/infra?range=...` - Infrastructure (L3)
- `GET /api/monitoring/errors?endpoint=...` - 端點錯誤詳情

**完整契約:** 請參閱 `docs/LAWCORE_MONITORING_IMPLEMENTATION.md`

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
- [鍵盤快捷鍵參考](./KEYBOARD_SHORTCUTS.md) - 全域/導航/審核工作流快捷鍵（Review Queue 快捷鍵需啟用 flag）

### 🔧 技術文件

- [整合測試指南](./INTEGRATION_TEST.md) - API 整合測試說明
- [驗證報告](./VERIFICATION_SUMMARY.md) - 整合驗證結果報告

### 🆕 LawCore & Monitoring (v3.0)

- [實作指南](./docs/LAWCORE_MONITORING_IMPLEMENTATION.md) - 完整的後端整合指南 ⭐ **必讀**
- [CTO 快速參考](./docs/CTO_QUICK_REFERENCE.md) - 30 秒總覽、部署檢查清單

## 授權

Private
