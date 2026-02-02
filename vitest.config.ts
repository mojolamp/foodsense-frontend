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
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary', 'json-summary'],
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
    },
    // 優化記憶體使用
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // 限制並行執行
    maxConcurrency: 1,
    // 設置測試超時
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
