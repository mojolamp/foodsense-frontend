# 🚀 Quick Start Guide - 5 分鐘上手

## 最快速的啟動方式

### 步驟 1: 安裝依賴 (已完成 ✅)
```bash
# 依賴已安裝完成，無需再次執行
# npm install
```

### 步驟 2: 設定環境變數 (⚠️ 需要設定)
編輯 `.env.local` 檔案:

```bash
# 開啟檔案
nano .env.local
# 或使用 VSCode
code .env.local
```

更新以下變數:
```env
# 從 Supabase Dashboard 取得 (https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 後端 API (確保後端正在運行)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 步驟 3: 建立 Supabase 測試使用者 (⚠️ 需要設定)

1. 開啟 https://app.supabase.com
2. 選擇你的專案 (或建立新專案)
3. 進入 **Authentication** → **Users**
4. 點擊 **Add user** → **Create new user**
5. 填寫:
   - **Email**: `admin@foodsense.test`
   - **Password**: `test123456`
6. 點擊 **Create user**

### 步驟 4: 啟動後端 API (⚠️ 需要運行)

在**另一個終端機**中:
```bash
cd ../backend  # 切換到後端目錄
uvicorn app.main:app --reload --port 8000
```

確認後端運行中:
```bash
curl http://localhost:8000/api/v1/admin/review/stats
```

### 步驟 5: 啟動前端開發伺服器

```bash
npm run dev
```

### 步驟 6: 開啟瀏覽器

開啟 http://localhost:3000

- 會自動重定向到登入頁面
- 使用測試帳號登入:
  - **Email**: `admin@foodsense.test`
  - **Password**: `test123456`

---

## ✅ 快速檢查清單

- [ ] `.env.local` 已設定正確的 Supabase URL 和 Key
- [ ] Supabase 測試使用者已建立
- [ ] 後端 API 正在運行 (port 8000)
- [ ] 前端開發伺服器正在運行 (port 3000)
- [ ] 可以成功登入

---

## 🎯 測試功能

登入後測試以下功能:

1. **查看統計儀表板**
   - 應該看到待審核總數、FAIL 和 WARN 數量
   - 應該看到佇列統計明細表格

2. **進入審核佇列**
   - 點擊側邊欄「審核佇列」
   - 測試篩選功能 (驗證狀態、信心水平)
   - 點擊「開始審核」測試彈窗

3. **提交審核**
   - 在審核彈窗中調整分數
   - 輸入備註
   - 點擊「提交審核」

4. **查看審核歷史**
   - 點擊「審核歷史」
   - 應該看到剛才提交的審核記錄

5. **查看黃金樣本**
   - 點擊「黃金樣本」
   - 應該看到標記為黃金的樣本

---

## 🐛 常見問題快速解決

### 1. 登入失敗
**錯誤**: "Invalid login credentials"

**解決方案**:
1. 確認 Supabase 使用者已建立
2. 確認 `.env.local` 中的憑證正確
3. 重新啟動開發伺服器: `Ctrl+C` 然後 `npm run dev`

### 2. API 連線失敗
**錯誤**: "API Error: 404" 或 "Network Error"

**解決方案**:
1. 確認後端正在運行:
   ```bash
   curl http://localhost:8000/api/v1/admin/review/stats
   ```
2. 如果沒有回應，啟動後端:
   ```bash
   cd ../backend
   uvicorn app.main:app --reload --port 8000
   ```

### 3. 頁面空白或錯誤
**解決方案**:
1. 檢查瀏覽器 Console (F12)
2. 清除快取: `rm -rf .next`
3. 重新啟動: `npm run dev`

---

## 📱 畫面截圖參考

### 登入頁面
- 簡潔的登入表單
- 藍色漸層背景
- 測試帳號提示

### 儀表板
- 三個統計卡片 (藍色、紅色、黃色)
- 佇列統計明細表格
- 側邊欄導航

### 審核佇列
- 待審核記錄表格
- 篩選選項
- 「開始審核」按鈕

### 審核彈窗
- 記錄資訊顯示
- 品質分數滑桿
- 信心分數滑桿
- 備註輸入框
- 黃金樣本勾選框

---

## 🎉 成功!

如果一切順利，你應該已經:
- ✅ 看到美觀的登入頁面
- ✅ 成功登入系統
- ✅ 看到統計儀表板
- ✅ 可以瀏覽審核佇列
- ✅ 可以提交審核結果

---

## 📚 更多資訊

- 詳細設定: 查看 `SETUP.md`
- 專案說明: 查看 `README.md`
- 完成總結: 查看 `COMPLETION_SUMMARY.md`

---

## 💡 提示

- 使用 `Ctrl+C` 停止開發伺服器
- 修改程式碼後會自動重新載入
- 開發伺服器預設在 `http://localhost:3000`
- 後端 API 預設在 `http://localhost:8000`

---

**祝你使用愉快! 🚀**
