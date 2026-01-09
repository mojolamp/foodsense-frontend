# P1 Task 3: Empty States v2 - Quick Test Checklist
**預估時間**: 15-20 分鐘

---

## 前置準備

### 1. 啟動開發伺服器
```bash
cd foodsense-frontend
npm run dev
```

### 2. 啟用 Feature Flag
開啟瀏覽器 Console (F12 → Console)，執行：
```javascript
window.__featureFlags.enable('empty_states_v2')
console.log('Empty States v2 enabled!')
```

---

## 測試清單

### ✅ Products Page (`/products`)

**URL**: `http://localhost:3000/products`

- [ ] **Empty Database Test**
  - 確認看到 "尚無產品" 標題
  - 藍色 PackageOpen 圖示
  - Help text 顯示
  - 看到 "匯入產品" 和 "手動新增" 按鈕
  - 點擊 "匯入產品" → console 有 log
  - 點擊 "手動新增" → console 有 log

- [ ] **Filtered Results Test** (如果有資料)
  - 套用篩選器使結果為空
  - 確認看到 "沒有符合條件的產品"
  - 灰色圖示，compact 樣式
  - 看到 "清除篩選器" 按鈕
  - 點擊 → 篩選器清除，返回全部資料

---

### ✅ Dictionary Page (`/dictionary`)

**URL**: `http://localhost:3000/dictionary`

- [ ] **Empty Dictionary Test**
  - 確認看到 "字典尚未建立"
  - 紫色 BookOpen 圖示
  - Help text 顯示
  - 看到 "先匯入產品" 按鈕
  - 點擊 → 導航至 `/products`

- [ ] **Search No Results Test** (如果有資料)
  - 搜尋不存在的 token
  - 確認看到 "沒有找到符合的 Tokens"
  - 灰色搜尋圖示，compact 樣式
  - 看到 "清除搜尋" 按鈕
  - 點擊 → 搜尋清除

---

### ✅ Data Quality Page (`/data-quality`)

**URL**: `http://localhost:3000/data-quality`

- [ ] **No Quality Data Test**
  - 確認看到 "尚未有品質數據"
  - 橙色 BarChart3 圖示
  - Help text 顯示 (說明品質追蹤功能)
  - 看到 "匯入產品" 和 "查看說明文件" 按鈕
  - 點擊 "匯入產品" → 導航至 `/products`
  - 點擊 "查看說明文件" → console 有 log

---

### ✅ Monitoring App Page (`/monitoring/app`)

**URL**: `http://localhost:3000/monitoring/app`

- [ ] **No Performance Data Test**
  - 確認看到 "等待效能數據"
  - 綠色 Activity 圖示
  - Help text 顯示 (30秒更新)
  - 看到 "配置監控" 和 "重新整理" 按鈕
  - 點擊 "配置監控" → 嘗試導航至 `/settings`
  - 點擊 "重新整理" → 觸發資料重新載入

---

### ✅ Monitoring Business Page (`/monitoring/business`)

**URL**: `http://localhost:3000/monitoring/business`

- [ ] **No Business Metrics Test**
  - 確認看到 "等待業務數據"
  - 藍色 LineChart 圖示
  - Help text 顯示 (分鐘級更新)
  - 看到 "配置監控" 和 "重新整理" 按鈕
  - 點擊 "配置監控" → 嘗試導航至 `/settings`
  - 點擊 "重新整理" → 觸發資料重新載入

---

### ✅ Monitoring Infra Page (`/monitoring/infra`)

**URL**: `http://localhost:3000/monitoring/infra`

- [ ] **No Infrastructure Data Test**
  - 確認看到 "等待基礎設施數據"
  - 紫色 Server 圖示
  - Help text 顯示
  - 看到 "配置監控" 和 "重新整理" 按鈕
  - 點擊 "配置監控" → 嘗試導航至 `/settings`
  - 點擊 "重新整理" → 觸發資料重新載入

---

## 響應式設計測試

### Mobile (375px)
- [ ] 調整視窗寬度至 375px
- [ ] 確認按鈕垂直堆疊
- [ ] 文字可讀性良好
- [ ] 圖示大小適中

### Tablet (768px)
- [ ] 調整視窗寬度至 768px
- [ ] 確認佈局正常
- [ ] 間距合理

### Desktop (1440px)
- [ ] 恢復至桌面寬度
- [ ] 確認完整佈局
- [ ] 所有元素對齊

---

## Backward Compatibility Test

### Disable Feature Flag
```javascript
window.__featureFlags.disable('empty_states_v2')
location.reload()
```

- [ ] Products page 顯示舊版 empty state
- [ ] Dictionary page 顯示舊版 empty state
- [ ] 其他頁面正常運作
- [ ] 無 JavaScript 錯誤

### Re-enable Feature Flag
```javascript
window.__featureFlags.enable('empty_states_v2')
location.reload()
```

- [ ] 確認 v2 empty states 恢復顯示

---

## Console Error Check

### 檢查 Browser Console
- [ ] 無 TypeScript 錯誤
- [ ] 無 React warnings
- [ ] 無 404 errors
- [ ] 無 console.error 訊息

---

## Quick Summary

### Test Results

| Page | Empty State | CTAs | Responsive | Status |
|------|-------------|------|------------|--------|
| Products | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |
| Dictionary | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |
| Data Quality | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |
| Monitoring App | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |
| Monitoring Business | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |
| Monitoring Infra | [ ] | [ ] | [ ] | [ ] PASS / [ ] FAIL |

### Overall Assessment
- [ ] **All Tests PASS** - Ready for production
- [ ] **Some Tests FAIL** - Need fixes
- [ ] **Critical Issues** - Not ready

---

## Issues Found

Record any issues here:

1. _______________________________
2. _______________________________
3. _______________________________

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Take screenshots of each empty state
2. Commit changes with message: `feat: Add EmptyStateV2 component to 6 pages (P1 Task 3)`
3. Update P1 Phase 1 status to 100%
4. Proceed to production rollout planning

### If Tests Fail ❌
1. Document specific failures
2. Fix issues
3. Re-run tests
4. Verify fixes

---

**Test Date**: _______________
**Tester**: _______________
**Environment**: Local Dev (http://localhost:3000)
**Feature Flag**: `empty_states_v2` = `true`
**Result**: [ ] PASS [ ] FAIL [ ] PARTIAL
