# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-12-20

### Added

#### Testing Infrastructure
- **Playwright E2E Testing**
  - Added Playwright test framework with Chromium browser
  - Created auth flow tests (`e2e/auth.spec.ts`)
  - Created navigation tests (`e2e/navigation.spec.ts`)
  - New scripts: `npm run test:e2e`, `npm run test:e2e:ui`

- **Storybook Component Documentation**
  - Added Storybook 10.1.10 with Vite builder
  - Created UI component stories (Button, Badge, Input, Card)
  - Created Charts component stories (LineChart, BarChart, PieChart)
  - New scripts: `npm run storybook`, `npm run build-storybook`

#### CI/CD
- **GitHub Actions Workflow** (`.github/workflows/ci.yml`)
  - Lint and type check job
  - Unit tests job (Vitest)
  - Build job with artifact upload
  - E2E tests job with Playwright

### Changed

#### Performance Optimization
- **Bundle Size Reduction**
  - Created lazy-loaded chart wrapper components
  - `/data-quality` page: 111 kB → 4.11 kB (96% reduction)
  - First Load JS: 280 kB → 173 kB (38% reduction)

- **New Chart Components**
  - `src/components/charts/LazyCharts.tsx` - Dynamic import entry
  - `src/components/charts/LineChartWrapper.tsx`
  - `src/components/charts/BarChartWrapper.tsx`
  - `src/components/charts/PieChartWrapper.tsx`

---

## [2.0.0] - 2025-12-20

### Added

#### Type Safety
- **New Type Definitions** (`src/types/api.ts`)
  - `APIError` interface with type guard
  - `getErrorMessage()` utility function
  - `BatchReviewTemplate`, `JsonValue` types
  - `CorrectedPayload` interface in review types

- **Vitest Unit Testing Framework**
  - Test configuration (`vitest.config.ts`)
  - Test setup and utilities (`src/test/`)
  - API client tests with 12 passing tests
  - New scripts: `npm run test`, `npm run test:run`, `npm run test:coverage`

#### Error Handling
- **ErrorBoundary Component** (`src/components/ErrorBoundary.tsx`)
  - React error boundary with friendly UI
  - Error details in development mode
  - Retry functionality

#### API Improvements
- **API Client Enhancements** (`src/lib/api/client.ts`)
  - 30-second timeout with AbortController
  - Retry mechanism (3 retries with exponential backoff)
  - Retry for status codes: 408, 429, 500, 502, 503, 504
  - Type-safe error handling with APIError class

### Changed

#### Code Quality
- Replaced all `any` types with proper TypeScript types
- Fixed useEffect infinite loop in dashboard layout
- Configured ESLint 9 flat config (`eslint.config.mjs`)
- Test credentials only shown in development mode

### Security
- Removed exposed test credentials from login page
- Added environment-based credential display

---

## [1.0.0] - Initial Release

### Features
- Next.js 15 with App Router
- React 19 with TypeScript
- Supabase authentication
- TanStack React Query for server state
- Tailwind CSS styling
- Product review queue system
- Data quality dashboard
- Dictionary management
- Rule configuration
