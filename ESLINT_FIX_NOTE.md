# ESLint 配置問題說明

## 問題描述

執行 `npm run lint` 時出現警告：

```
`next lint` is deprecated and will be removed in Next.js 16.
ESLint configuration in eslint-config-next/core-web-vitals is invalid:
- Unexpected top-level property "name".
```

## 原因

這是 Next.js 15 與 ESLint 9 的兼容性問題。Next.js 團隊正在遷移到新的 ESLint CLI 格式。

## 解決方案

### 方案 1：等待 Next.js 更新（推薦）

Next.js 團隊正在處理這個問題，未來版本會修復。

### 方案 2：遷移到 ESLint CLI（可選）

可以運行以下命令遷移：
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

但這會改變 lint 腳本的工作方式。

### 方案 3：暫時忽略警告（目前狀態）

警告不影響功能，代碼仍然可以正常 lint 和運行。

## 當前狀態

- ✅ 代碼品質正常（無 lint 錯誤）
- ✅ TypeScript 類型檢查通過
- ✅ 測試通過
- ⚠️ ESLint 配置警告（不影響功能）

## 建議

暫時保持現狀，等待 Next.js 團隊修復兼容性問題。這個警告不影響代碼品質或功能。
