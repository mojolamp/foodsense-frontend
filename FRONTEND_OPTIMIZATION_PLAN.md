# Frontend Code Splitting & Lazy Loading Implementation Plan

## Overview

This document outlines the strategy for implementing code splitting and lazy loading in the FoodSense frontend to improve initial load time and overall performance.

## Current State Analysis

### Project Setup
- **Framework**: Next.js 15 (App Router)
- **React**: 19.0.0
- **Build Tool**: Next.js built-in (Turbopack/Webpack)
- **Total Components**: 67+ components
- **Large Components** (>200 LOC):
  - ReviewModal (309 lines)
  - BatchReviewModal (300 lines)
  - ReviewQueueTable (286 lines)
  - EfficiencyAnalysis (279 lines)
  - ProductDetailDrawer (255 lines)
  - CommandPalette (255 lines)

### Performance Opportunities

1. **Heavy Modal Components**: Modals are often not needed on initial load
2. **Dashboard Widgets**: Charts and analytics components
3. **Admin Pages**: Rarely accessed features
4. **Third-party Libraries**: Large dependencies (recharts, react-tree-graph)

## Implementation Strategy

### 1. Next.js Built-in Optimizations

Next.js 15 already provides:
- ✅ Automatic code splitting per route
- ✅ Dynamic imports support
- ✅ Image optimization
- ✅ Font optimization

### 2. Route-based Code Splitting

**Already Optimized** by Next.js App Router:
- Each route in `app/` directory is automatically code-split
- Layout components are shared across routes
- Loading states with `loading.tsx`

### 3. Component-level Lazy Loading

**Target Components for Lazy Loading**:

#### Priority 1: Modal Components
- ReviewModal
- BatchReviewModal
- ProductDetailDrawer
- CommandPalette

#### Priority 2: Chart Components
- EfficiencyAnalysis (uses recharts)
- Analytics dashboards
- Monitoring visualizations

#### Priority 3: Heavy Feature Components
- Tree graph visualizations
- Advanced filters
- Export functionality

### 4. Library Chunking

**Large Dependencies to Split**:
- `recharts` (~200KB)
- `react-tree-graph` (~150KB)
- `@tanstack/react-query-devtools` (dev only)

## Implementation Steps

### Step 1: Update Next.js Configuration

Optimize webpack/turbopack configuration for better chunking.

### Step 2: Implement Dynamic Imports

Convert heavy components to use React.lazy() or next/dynamic.

### Step 3: Add Loading States

Create suspense fallbacks for lazy-loaded components.

### Step 4: Optimize Bundle Analyzer

Use webpack-bundle-analyzer to identify optimization opportunities.

### Step 5: Measure Performance

Track Core Web Vitals improvements.

## Expected Results

### Bundle Size Reduction
- **Initial Bundle**: -30-40% reduction
- **Route Chunks**: Smaller, more focused bundles
- **Unused Code**: Eliminated from initial load

### Performance Metrics
- **FCP (First Contentful Paint)**: -500ms to -1s improvement
- **LCP (Largest Contentful Paint)**: -300ms to -800ms improvement
- **TTI (Time to Interactive)**: -1s to -2s improvement

### User Experience
- ✅ Faster initial page load
- ✅ Quicker time to interactive
- ✅ Better perceived performance with loading states
- ✅ Reduced data usage

## Implementation Files

1. `next.config.ts` - Build configuration
2. `src/components/lazy/index.ts` - Lazy component exports
3. `src/components/ui/LoadingFallback.tsx` - Loading states
4. `src/lib/dynamic-imports.ts` - Dynamic import utilities
5. Performance monitoring utilities

## Testing Strategy

1. **Lighthouse Audits**: Before/after comparison
2. **Bundle Analysis**: webpack-bundle-analyzer reports
3. **Real Device Testing**: Mobile and desktop performance
4. **User Metrics**: RUM (Real User Monitoring)

## Timeline

- **Configuration**: 1 hour
- **Component Lazy Loading**: 2 hours
- **Loading States**: 1 hour
- **Testing & Optimization**: 1 hour
- **Documentation**: 1 hour

**Total**: 6 hours (as estimated)

## Next Steps

1. Implement optimized Next.js configuration
2. Create lazy loading utilities
3. Convert large components to lazy loading
4. Add loading fallbacks
5. Measure and document improvements
