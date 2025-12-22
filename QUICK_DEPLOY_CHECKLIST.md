# ⚡ 快速部署檢核清單

**版本:** v3.0.0
**Git Commit:** afdd8f6
**目標:** Scenario B (團隊內部)

---

## ✅ 部署前檢查 (5 分鐘)

### 1. 建置驗證
```bash
npm run build
```
- [ ] ✅ 編譯成功
- [ ] ✅ 無錯誤訊息
- [ ] ✅ Scope Guard 通過

### 2. Git 狀態
```bash
git status
git log -1
```
- [ ] ✅ Working tree clean
- [ ] ✅ 最新 commit: afdd8f6

### 3. 環境變數
```bash
cat .env.production
```
- [ ] ✅ NEXT_PUBLIC_API_V1_BASE 已設定
- [ ] ✅ NEXT_PUBLIC_API_V2_BASE 已設定
- [ ] ✅ NEXT_PUBLIC_LAWCORE_BASE 已設定
- [ ] ✅ NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
- [ ] ✅ Supabase URL/KEY 已設定

---

## 🚀 部署步驟

### Staging 部署
```bash
# 1. 建置
npm run build

# 2. 測試
npm run start
# 訪問 http://localhost:3000

# 3. 部署
vercel --env production
```

### 煙霧測試 (5 分鐘)
- [ ] 登入成功
- [ ] /lawcore → 頁面載入
- [ ] Quick Check → 輸入「山梨酸鉀」→ 得到結果
- [ ] /lawcore/rules → 搜尋功能正常
- [ ] /monitoring/business → 卡片顯示

### Production 部署
```bash
# Staging 驗證通過後
vercel --prod
```

---

## 🔍 部署後檢查 (10 分鐘)

### 功能驗證
- [ ] 所有 7 個新頁面可訪問
- [ ] LawCore Overview 載入統計資料
- [ ] Monitoring L1/L2/L3 正常顯示
- [ ] 無 Console 紅色錯誤

### 監控指標 (24 小時內)
- [ ] 錯誤率 < 1%
- [ ] 頁面載入 < 3s
- [ ] 無使用者回報阻斷性問題

---

## ⚠️ Rollback (如需要)

```bash
vercel rollback
```

---

## 📞 緊急聯絡

- DevOps: devops@foodsense.com
- Frontend: frontend@foodsense.com
- On-Call: Slack #incidents

---

**最後更新:** 2025-12-22
**部署人員:** ___________
**部署時間:** ___________
