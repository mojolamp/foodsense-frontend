# FoodSense Diamond Sutra Platform - UI 操作使用手冊

**版本**: 0.17.1 (Cloud Data Refinery)
**更新日期**: 2026-02-24
**前端框架**: Next.js 15 + TypeScript + Tailwind CSS
**後端版本**: v0.17.1 (247 API endpoints / 41 groups)

---

## 目錄

1. [系統概述](#1-系統概述)
2. [登入與帳號管理](#2-登入與帳號管理)
3. [主導覽結構](#3-主導覽結構)
4. [儀表板 (Dashboard)](#4-儀表板-dashboard)
5. [產品管理 (Products)](#5-產品管理-products)
6. [審核工作台 (Review Workbench)](#6-審核工作台-review-workbench)
7. [資料管線 (Data Pipeline)](#7-資料管線-data-pipeline)
8. [法規引擎 LawCore](#8-法規引擎-lawcore)
9. [監控系統 (Monitoring)](#9-監控系統-monitoring)
10. [營運管理 (Operations)](#10-營運管理-operations)
11. [資料品質 (Data Quality)](#11-資料品質-data-quality)
12. [規則引擎 (Rules Engine)](#12-規則引擎-rules-engine)
13. [知識字典 (Dictionary)](#13-知識字典-dictionary)
14. [控制平面 (Control Plane)](#14-控制平面-control-plane)
15. [開發者入口 (Developer Portal)](#15-開發者入口-developer-portal)
16. [B2C 消費者端 API](#16-b2c-消費者端-api)
17. [鍵盤快捷鍵](#17-鍵盤快捷鍵)
18. [常見問題與故障排除](#18-常見問題與故障排除)

---

## 1. 系統概述

FoodSense Diamond Sutra Platform (食覺般若平台) 是一個以佛學金剛經哲學為核心的食品智慧平台。系統透過 14 核心 DAG 管線與 10 軸評分框架，對食品進行全面分析，涵蓋成分解析、營養評估、法規合規、UPF 分類等面向。

### 核心架構

```
消費者 App (B2C)                管理後台 (Admin)
    |                               |
    v                               v
  API Gateway (ALB + WAF)
    |
    v
  FastAPI (v0.17.1, 247 routes)
    |
    +-- 14-Core DAG Pipeline (10-axis scoring)
    +-- Five Wisdoms Agent Architecture
    +-- PaC Control Plane (Policy-as-Code)
    |
    v
  Supabase (72 tables) + ElastiCache Redis
```

### 技術規格

| 項目 | 值 |
|------|-----|
| API 版本 | 0.17.1 |
| API 路由數 | 247 |
| 端點群組 | 41 |
| 資料庫表 | 72 張 |
| 測試覆蓋率 | 98% (338 tests) |
| 部署環境 | AWS ECS Fargate (ap-east-2) |
| 引擎模式 | NORMAL |

---

## 2. 登入與帳號管理

### 2.1 登入頁面 (`/login`)

1. 開啟瀏覽器前往系統 URL
2. 輸入 **Email** 和 **密碼**
3. 點選「登入」按鈕
4. 系統透過 Supabase Auth 驗證身份
5. 驗證成功後自動跳轉至儀表板

> 登入頁面使用漸層背景，簡潔設計。開發環境中會顯示測試帳號。

### 2.2 使用者資訊

登入後，左側選單底部顯示：
- 使用者 Email
- 系統版本號
- 登出按鈕

### 2.3 權限角色

| 角色 | 存取範圍 |
|------|----------|
| `admin` | 所有管理端點 |
| `super-admin` | admin + PaC 控制 + Kill Switch |
| B2C 用戶 | 僅消費者端 API |

---

## 3. 主導覽結構

左側選單共分 **8 大導覽群組**，各群組展開後可見子功能：

### 導覽群組一覽

| 群組 | 子功能 | 路徑 |
|------|--------|------|
| **Platform** | Dashboard | `/dashboard` |
| | Products | `/products` |
| | Dictionary | `/dictionary` |
| | Clustering | `/clustering` |
| | Knowledge Graph | `/knowledge-graph` |
| **Control Plane** | 系統治理 | `/control-plane` |
| **Review Workbench** | Review Queue | `/review/queue` |
| | History | `/review/history` |
| | Analytics | `/review/analytics` |
| | Gold Samples | `/gold-samples` |
| **Data Pipeline** | OCR Scanner | `/data-pipeline/ocr` |
| | Ingestion Gate | `/ingestion-gate/review` |
| | ETL Jobs | `/data-pipeline/etl` |
| | Documents | `/data-pipeline/documents` |
| **LawCore** | Overview | `/lawcore` |
| | Presence Check | `/lawcore/check` |
| | Rules | `/lawcore/rules` |
| | Admin | `/lawcore/admin` |
| **Monitoring** | Overview | `/monitoring` |
| | Business (L1) | `/monitoring/business` |
| | Application (L2) | `/monitoring/app` |
| | Infrastructure (L3) | `/monitoring/infra` |
| **Operations** | Pipeline Ops | `/operations/pipeline` |
| | Crawler Admin | `/operations/crawler` |
| | Dead Letter Queue | `/operations/dlq` |
| | Acquisition Metrics | `/operations/metrics` |
| **System** | Rules Engine | `/rules` |
| | Data Quality | `/data-quality` |
| | Benchmark | `/benchmark` |

---

## 4. 儀表板 (Dashboard)

**路徑**: `/dashboard`
**用途**: 系統營運指揮中心，一眼掌握全局

### 4.1 系統脈搏列 (System Pulse Row)

頁面頂部顯示 4 個即時指標卡片：

| 指標 | 說明 | 更新頻率 |
|------|------|----------|
| Request Rate | 當前每分鐘 API 請求數 | 30s |
| LawCore Adoption | 法規引擎使用率 | 60s |
| Health Score | 系統整體健康分數 | 30s |
| Cost | 當日 LLM 使用成本 | 60s |

### 4.2 緊急警報橫幅

- 紅色橫幅顯示 CRITICAL 等級警報
- 自動偵測：預算超過 80%、佇列 > 500、DLQ > 100、錯誤 > 100

### 4.3 流量與佇列圖表

- **左側**: 請求量折線圖 (24h 趨勢)
- **右側**: 佇列分布圓餅圖 (CRITICAL / NORMAL / LOW)

### 4.4 快捷連結面板

6 個色彩編碼的快速操作按鈕：
- OCR Scanner (藍)
- Review Queue (綠)
- Products (紫)
- Crawler Admin (橙)
- Data Quality (紅)
- Monitoring (灰)

### 4.5 最近錯誤列表

顯示最新系統錯誤事件，包含時間戳記和錯誤訊息。

---

## 5. 產品管理 (Products)

**路徑**: `/products`
**用途**: 瀏覽、搜尋、管理產品資料庫

### 5.1 產品列表

| 欄位 | 說明 |
|------|------|
| Product Name | 產品名稱 (中文) |
| Brand | 品牌 |
| Barcode | 條碼 (EAN-13) |
| Tier | 品質等級 |
| Source Count | 資料來源數量 |
| Vegan Type | 素食類型 |

### 5.2 篩選功能

支援多維度篩選：
- **品牌**: 下拉選單篩選
- **等級**: Tier 1-5
- **素食類型**: 全素 / 蛋奶素 / 五辛素 等
- **品質等級**: Gold / Silver / Bronze

### 5.3 產品詳情抽屜

點擊產品列可展開右側詳情面板，顯示：
- 完整成分列表
- 10 軸評分 (雷達圖)
- 資料來源溯源
- 最近更新時間

### 5.4 分頁

每頁 20 筆，支援上一頁 / 下一頁。空狀態時顯示匯入 / 新增建議。

---

## 6. 審核工作台 (Review Workbench)

**用途**: OCR 掃描記錄的人工審核與品質管控

### 6.1 審核佇列 (`/review/queue`)

#### 篩選器

- **驗證狀態**: PASS / WARN / FAIL
- **信心等級**: HIGH / MEDIUM / LOW
- **排序策略**:
  - Quick (快速清理)
  - Urgent (緊急優先)
  - Quality (品質優先)
  - Balanced (均衡模式)

#### 操作流程

1. 從佇列中選取記錄
2. 點擊記錄列開啟審核模態框
3. 查看 OCR 提取結果 vs 原始資料
4. 填寫：
   - **品質分數** (1-10)
   - **信心分數** (0.0-1.0)
   - **審核備註**
   - **是否標記為黃金樣本**
5. 提交審核
6. 系統自動前進至下一筆

#### 批次審核

1. 按 `x` 或勾選框選取多筆記錄
2. 點擊「批次審核」按鈕
3. 統一設定品質/信心分數
4. 一次提交所有選取記錄

### 6.2 審核歷史 (`/review/history`)

已完成的審核記錄列表：
- Ground Truth ID (黃金樣本標記 ⭐)
- 品質分數 (綠色標籤, 1-10)
- 信心分數 (藍色標籤, 0.0-1.0)
- 相對時間戳記

### 6.3 審核分析 (`/review/analytics`)

統計儀表板：
- 審核完成率趨勢
- 平均品質分數
- 審核速度 (筆/小時)
- 審核員績效比較

### 6.4 黃金樣本 (`/gold-samples`)

高品質訓練樣本管理：
- 黃金樣本清單與分數
- 品質與相關性指標
- 匯出功能

---

## 7. 資料管線 (Data Pipeline)

### 7.1 OCR 掃描器 (`/data-pipeline/ocr`)

四個分頁：

| 分頁 | 功能 |
|------|------|
| **Scan** | 拖放上傳圖片 → OCR 辨識 → 結果預覽 |
| **Manual** | 直接輸入文字/JSON |
| **History** | 依 Record ID 或 Trace ID 查詢歷史 |
| **Review** | 已校正記錄與原始資料比對 |

#### Scan 分頁操作

1. 將食品標籤圖片拖放至上傳區域
2. (選擇性) 啟用「三重信心」模式
3. (選擇性) 啟用「溯源追蹤」
4. 系統自動 OCR → 顯示結果
5. 可在校正面板修改辨識結果
6. 確認提交

> **支援格式**: JPEG, PNG, WebP (最大 10MB)
> **OCR 引擎**: GPT-4o (可選 PaddleOCR)

### 7.2 資料閘門 (`/ingestion-gate/review`)

資料驗證與匯入工作流：
- 批次處理能力
- 驗證規則自動套用
- 通過/拒絕/quarantine 三種處置

### 7.3 ETL 作業 (`/data-pipeline/etl`)

作業排程與執行監控：
- 作業狀態追蹤
- 結果驗證
- 失敗重試

### 7.4 文件管理 (`/data-pipeline/documents`)

參考文件上傳與管理：
- 支援 PDF, CSV, JSON
- 版本管理

---

## 8. 法規引擎 LawCore

**用途**: 台灣食品法規合規檢查

### 8.1 總覽 (`/lawcore`)

| 卡片 | 說明 |
|------|------|
| Active Rules | 啟用中的法規規則數 |
| Pending Laws | 待審核法規數 |
| Database Status | 法規資料庫狀態 |

功能區塊：
- **快速檢查表單**: 輸入添加物名稱 → 立即合規判定
- **待審核法規列表**: 等待驗證的新法規
- Presence Gate v1.0 範圍標示

### 8.2 合規檢查 (`/lawcore/check`)

#### 單筆查詢

1. 輸入添加物名稱 (例: 「苯甲酸鈉」)
2. 點擊「檢查」
3. 顯示合規結果：
   - 合規狀態 (PASS / FAIL / WARN)
   - 適用法規
   - 允許劑量
   - 使用限制

#### 批次查詢

1. 輸入多個添加物 (逗號分隔或每行一個)
2. 執行批次查詢
3. 結果支援 CSV 匯出

### 8.3 法規瀏覽 (`/lawcore/rules`)

- 可搜尋的法規清單
- 分頁瀏覽
- 展開詳情抽屜查看完整法規內容
- 啟用狀態指示燈
- 證據與引用來源

### 8.4 法規管理 (`/lawcore/admin`)

**僅限 admin / super-admin**

- 待驗證法規審核
- 法規升級工作流
- 批准 / 駁回操作

---

## 9. 監控系統 (Monitoring)

**用途**: 三層級聯式系統監控

### 9.1 總覽 (`/monitoring`)

整合三個層級的關鍵指標：

```
L1 業務層 ──→ L2 應用層 ──→ L3 基礎設施層
(KPI 異常)    (SLA 違規)    (資源瓶頸)
```

**時間範圍選擇器**: 24h / 7d / 30d

**鑽取功能**: 點擊異常指標可自動導航至下一層級

### 9.2 業務健康 L1 (`/monitoring/business`)

| 指標 | 說明 |
|------|------|
| Total Requests | 總請求數 |
| LawCore Adoption Rate | 法規引擎使用率 |
| Health Score | 系統健康分數 |
| Cost | 營運成本 |
| Traffic Chart | 流量趨勢圖 |

### 9.3 應用效能 L2 (`/monitoring/app`)

| 指標 | 說明 |
|------|------|
| SLA Status | SLA 達標狀態 |
| Endpoint Performance | 各端點回應時間 |
| Error Distribution | 錯誤分布圖 |
| Incident Templates | 事故範本 |

### 9.4 基礎設施 L3 (`/monitoring/infra`)

| 指標 | 說明 |
|------|------|
| Database Size | 資料庫大小 |
| Slow Queries | 慢查詢統計 |
| Table Bloat | 表膨脹率 |
| Unused Indexes | 未使用索引 |

---

## 10. 營運管理 (Operations)

### 10.1 爬蟲管理 (`/operations/crawler`)

五個分頁：

| 分頁 | 功能 |
|------|------|
| **Control** | 啟動/停止爬蟲、站台管理 |
| **Pipeline** | 資料管線編排 |
| **Health** | 爬蟲健康狀態儀表板 |
| **Schedules** | 排程管理 |
| **Repairs** | DOM 自動修復審批 |

#### 排程

| 排程 | 頻率 | 說明 |
|------|------|------|
| Health Probe | 30 分鐘 | 站台健康探測 |
| Incremental | 6 小時 | 增量爬取 |
| Full Crawl | 每日 03:00 UTC+8 | 完整爬取 |
| DLQ Replay | 15 分鐘 | 失敗重試 |

#### 站台電路斷路器

狀態機: `HEALTHY → DEGRADED → OPEN → HALF_OPEN`

- 站台失敗率超標時自動斷開
- HALF_OPEN 時嘗試恢復
- 管理員可手動重置

### 10.2 管線營運 (`/operations/pipeline`)

- 作業執行監控
- 管線流程視覺化
- 錯誤處理與復原

### 10.3 死信佇列 (`/operations/dlq`)

- 失敗作業管理
- 重試邏輯設定
- 作業檢視與復原
- 最大重試次數: 可設定 (`crawler_dlq_max_retries`)

### 10.4 資料取得指標 (`/operations/metrics`)

- 各資料來源效能統計
- 爬取成功率
- 站台別指標

---

## 11. 資料品質 (Data Quality)

**路徑**: `/data-quality`
**用途**: 資料品質 KPI 監控與異常偵測

### 11.1 KPI 指標列

| KPI | 說明 |
|-----|------|
| Golden Records | 黃金記錄數量 |
| Stale Records | 過期記錄數量 |
| Drift Alerts | 漂移警報數 |
| Validation Errors | 驗證錯誤數 |

### 11.2 品質維度卡片

| 維度 | 說明 |
|------|------|
| Completeness | 資料完整性 |
| Accuracy | 資料準確性 |
| Coverage | 資料涵蓋範圍 |
| Freshness | 資料新鮮度 |

### 11.3 圖表

- **黃金記錄成長**: 30 天趨勢圖
- **來源貢獻**: 各資料來源品質長條圖
- **涵蓋統計**: 欄位覆蓋率百分比
- **漂移偵測**: 顯著變化標記
- **驗證錯誤**: 錯誤率追蹤

---

## 12. 規則引擎 (Rules Engine)

**路徑**: `/rules`
**用途**: 業務規則管理

### 功能

- 規則清單與 CRUD 操作
- 規則測試介面
- 啟用/停用切換
- 刪除功能
- 詳細規則資訊展示

---

## 13. 知識字典 (Dictionary)

**路徑**: `/dictionary`
**用途**: 成分知識庫與添加物登錄

### 13.1 Token Rankings 分頁

成分出現頻率排名：
- 依出現次數排序
- 依產品數量排序
- 搜尋功能
- 批次校正提交

### 13.2 Additives Registry 分頁

TFDA 添加物資料庫 (727 筆)：
- 添加物名稱 (中/英)
- 化學資訊
- 風險等級
- UPF 標記
- 功能聲明

---

## 14. 控制平面 (Control Plane)

**路徑**: `/control-plane`
**用途**: Policy-as-Code 系統治理

### 治理功能

| 功能 | 說明 |
|------|------|
| **EngineMode** | NORMAL / SAFETY_LOCKDOWN / READONLY_CACHE |
| **PersistenceGate** | 8 規則輸出寫入守衛 (ALLOW/QUARANTINE/BLOCK) |
| **QuarantineService** | SLA 強制隔離 (CRITICAL=24h, WARN=7d, INFO=30d) |
| **KillSwitch** | 全域/租戶範圍緊急停機 |
| **VersionRegistry** | 複合指紋 (policy_hash + 各版本) |
| **StrategyLinter** | 6 項檢查 (優先權碰撞、覆蓋率等) |

### 回應標頭

每個 API 回應包含治理標頭：
```
X-Policy-Hash: 81362cc204cc
X-Data-Version: 2026-02-13-snapshot-v1
X-Model-Version: 2026-02-13-v1
X-Pipeline-Version: 2.0.0-dev
X-Engine-Mode: NORMAL
X-Schema-Validation: enabled
```

---

## 15. 開發者入口 (Developer Portal)

**用途**: B2B API 金鑰生命週期管理

### 15.1 API 金鑰管理

#### 建立金鑰

1. 進入 Developer Portal
2. 填寫金鑰名稱
3. 選擇方案等級：

| 方案 | 每日限額 | 費率 |
|------|----------|------|
| Free | 100 req/day | $0 |
| Starter | 1,000 req/day | - |
| Professional | 10,000 req/day | - |
| Enterprise | 100,000 req/day | - |

4. 選擇 Live / Test 模式
5. 建立後**僅顯示一次完整金鑰**

> **金鑰格式**: `fs_live_<32chars>` 或 `fs_test_<32chars>`
> **儲存方式**: SHA-256 雜湊

#### 金鑰操作

- **列表**: 查看所有金鑰 (prefix, 方案, 狀態, 使用量)
- **撤銷**: 立即失效
- **輪替**: 設定寬限期 (1-168 小時)，舊金鑰在寬限期內仍可使用

### 15.2 使用量追蹤

- **計量週期**: 分鐘 / 小時 / 日 / 月
- **指標**: 請求數、Token 數、成本 (USD)
- **配額**: 80% 軟警告、100% 硬限制

---

## 16. B2C 消費者端 API

以下為消費者端 App 透過 API 提供的功能 (需 B2C JWT 驗證)：

### 16.1 掃描功能

| 端點 | 功能 |
|------|------|
| `POST /api/v2/scan/barcode` | 條碼掃描 → 10 軸評分 |
| `POST /api/v2/scan/image` | 照片掃描 → OCR → 10 軸評分 |

**限速**: 10 次/分鐘/用戶

### 16.2 個人檔案

| 端點 | 功能 |
|------|------|
| `GET /api/v2/profile` | 取得用戶檔案 (飲食類型、過敏原、健康狀況) |
| `PUT /api/v2/profile` | 更新個人設定 (健康資料加密儲存) |

### 16.3 掃描歷史

| 端點 | 功能 |
|------|------|
| `GET /api/v2/history` | 掃描歷史 (游標分頁) |
| `GET /api/v2/history/export` | 匯出 (JSONL / CSV, 最大 50K 筆) |

### 16.4 收藏夾

| 端點 | 功能 |
|------|------|
| `GET /api/v2/favorites` | 書籤清單 |
| `POST /api/v2/favorites` | 新增書籤 |
| `DELETE /api/v2/favorites/{id}` | 移除書籤 |

### 16.5 遊戲化系統

| 端點 | 功能 |
|------|------|
| `GET /api/v2/quests` | 任務清單與進度 |
| `POST /api/v2/quests/{code}/claim` | 領取任務獎勵 |
| `GET /api/v2/wallet` | 錢包餘額 (點數、掃描額度) |
| `POST /api/v2/feedback` | 提交回饋/校正 (可賺取點數) |

### 16.6 洞察

| 端點 | 功能 |
|------|------|
| `GET /api/v2/insights/daily` | 每日飲食摘要 |
| `GET /api/v2/insights/weekly` | 週報分析 |

---

## 17. 鍵盤快捷鍵

### 審核工作台快捷鍵

| 按鍵 | 功能 |
|------|------|
| `n` | 下一筆記錄 |
| `p` | 上一筆記錄 |
| `r` | 開啟審核模態框 |
| `x` | 切換選取當前記錄 |
| `a` | 全選 / 取消全選 |

### 全域快捷鍵

| 按鍵 | 功能 |
|------|------|
| `Cmd/Ctrl + K` | 命令面板 (如已啟用) |

> 快捷鍵可透過 Feature Flag `NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS` 啟用/停用

---

## 18. 常見問題與故障排除

### Q1: 登入後看到空白儀表板

**原因**: API 服務可能剛重啟，尚未完全就緒
**解決**: 等待 30-60 秒後重新整理頁面。檢查 `/health/ready` 確認 DB 和 Redis 已連線。

### Q2: 審核佇列沒有記錄

**原因**: 可能沒有待審核的 OCR 記錄
**解決**: 先透過 OCR Scanner 上傳圖片，或透過 Ingestion Gate 匯入資料。

### Q3: LawCore 合規檢查回傳空結果

**原因**: 法規資料庫可能尚未匯入
**解決**: 檢查 LawCore Admin 中是否有已啟用的法規規則。

### Q4: 爬蟲狀態顯示 OPEN (斷路)

**原因**: 目標站台連續失敗觸發電路斷路器
**解決**:
1. 進入 Operations → Crawler Admin → Repairs
2. 確認站台是否可存取
3. 手動重置電路斷路器

### Q5: API 回傳 401 Unauthorized

**原因**: JWT Token 過期或未附帶
**解決**: 重新登入取得新 Token。管理端點需要 admin 角色。

### Q6: API 回傳 429 Too Many Requests

**原因**: 超過頻率限制
**解決**: 等待限制週期重置。各端點限制不同 (掃描: 10/min, 管理: 10/min)。

### Q7: 監控頁面指標不更新

**原因**: 指標有 30 秒 TTL 快取
**解決**: 等待 30 秒後重新整理。或透過監控 API 手動觸發收集。

### Q8: Data Quality 顯示高漂移警報

**原因**: 資料來源內容發生顯著變化
**解決**:
1. 檢查 Content Change Log
2. 確認是否為正常變更 (例: 廠商更新配方)
3. 必要時透過 Cross-Source Verifier 交叉驗證

---

## 附錄 A: 系統端點清單

### 公開端點 (無需認證)

```
GET  /health              Liveness 探針
GET  /health/ready         Readiness 探針 (DB + Redis)
GET  /health/ready/strict  嚴格模式 (所有依賴)
GET  /health/startup       啟動探針
GET  /docs                 Swagger UI
GET  /redoc                ReDoc 文件
GET  /openapi.json         OpenAPI 規格
GET  /api/version          版本資訊
```

### API 群組統計

| 群組 | 端點數 |
|------|--------|
| pac-admin | 20 |
| v2-b2c | 17 |
| products | 16 |
| crawler | 15 |
| tasks | 14 |
| Review Queue | 13 |
| Developer Portal | 12 |
| ETL Pipeline | 11 |
| OCR | 8 |
| monitoring | 8 |
| data-quality | 8 |
| LawCore | 7 |
| admin-rules | 7 |
| crawler-admin | 6 |
| admin-dictionary | 6 |
| version | 5 |
| 其他 21 群組 | 71 |
| **合計** | **247** |

---

## 附錄 B: 回應標頭說明

| 標頭 | 範例值 | 說明 |
|------|--------|------|
| `X-Policy-Hash` | `81362cc204cc` | PaC 策略指紋 |
| `X-Data-Version` | `2026-02-13-snapshot-v1` | 資料版本 |
| `X-Model-Version` | `2026-02-13-v1` | 模型版本 |
| `X-Pipeline-Version` | `2.0.0-dev` | 管線版本 |
| `X-Engine-Mode` | `NORMAL` | 引擎模式 |
| `X-Schema-Validation` | `enabled` | Schema 驗證狀態 |
| `X-Schema-Strict-Mode` | `True` | 嚴格模式 |
| `Content-Language` | `zh-TW` | 回應語言 |
| `X-Request-Id` | UUID | 請求追蹤 ID |

---

## 附錄 C: 10 軸評分框架

Diamond Sutra 14-Core Pipeline 產出的 10 軸評分：

| 軸 | 核心 | 說明 |
|----|------|------|
| NOVA Score | NOVACore | NOVA 食品加工等級 (1-4) |
| UPF Classification | UPFCore | 超加工食品分類 |
| Nutrient Density | NutrientDensityCore | 營養密度評分 |
| Additive Risk | AdditiveCore | 添加物風險指數 |
| Allergen Safety | AllergenCore | 過敏原安全性 |
| Health Harmony | HealthHarmonyCore | 健康和諧度 (慢性病適配) |
| Sustainability | SustainabilityCore | 永續性評分 |
| Veg Classification | VegCore | 素食分類 |
| Marketing Claims | MarketingCore | 行銷聲明驗證 |
| Mindful Eating | MindfulEatingCore | 正念飲食指數 |

---

*應無所住而生其心 — 以般若智慧，照見食物本質*

**FoodSense Diamond Sutra Platform v0.17.1**
**食覺般若 雲端數據精煉平台**
