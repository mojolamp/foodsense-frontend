import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      // 使用 istanbul provider - 比 v8 使用更少記憶體
      provider: 'istanbul',
      // 僅輸出 text 和 json-summary 以節省記憶體
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/__tests__/**/*',
        'src/stories/**/*',
        'src/**/*.stories.{ts,tsx}',
        'src/types/*.ts',
        // 排除 app 目錄中的頁面組件（這些是 Next.js 特有的，難以單元測試）
        'src/app/**/*',
      ],
      // 優化 coverage 選項 (注意: istanbul provider 不支援 'all' 選項)
      clean: true, // 每次清除之前的 coverage 資料
      skipFull: true, // 跳過 100% 覆蓋的檔案以減少輸出
    },
    // 設置測試超時
    testTimeout: 30000,
    // 記憶體優化設定
    isolate: false, // 關閉隔離以減少 worker 數量
    fileParallelism: false, // 序列執行檔案，減少記憶體峰值
    maxConcurrency: 1, // 最多同時執行 1 個測試
    teardownTimeout: 1000, // 快速清理
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
