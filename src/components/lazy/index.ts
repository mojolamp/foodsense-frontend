/**
 * Lazy-Loaded Components Export
 * =============================
 *
 * Central location for all lazy-loaded components.
 * Import components from here instead of directly to ensure consistent lazy loading.
 *
 * Usage:
 *   import { LazyReviewModal, LazyEfficiencyAnalysis } from '@/components/lazy';
 *
 *   function MyComponent() {
 *     return (
 *       <>
 *         {isOpen && <LazyReviewModal {...props} />}
 *       </>
 *     );
 *   }
 */

import { lazyModal, lazyChart, lazyWithPreload } from '@/lib/dynamic-imports';
import {
  ModalSkeleton,
  ChartSkeleton,
  DrawerSkeleton,
  TableSkeleton,
} from '@/components/ui/LoadingFallback';
import dynamic from 'next/dynamic';

// ============================================================================
// Modal Components (Priority 1)
// ============================================================================

/**
 * Review Modal - Large modal for reviewing products
 * Size: ~309 lines, heavy component
 */
export const LazyReviewModal = lazyModal(
  () => import('@/components/review/ReviewModal')
);

/**
 * Batch Review Modal - Bulk review operations
 * Size: ~300 lines
 */
export const LazyBatchReviewModal = lazyModal(
  () => import('@/components/review/BatchReviewModal')
);

/**
 * Product Detail Drawer - Side drawer with product details
 * Size: ~255 lines
 */
export const LazyProductDetailDrawer = dynamic(
  () => import('@/components/products/ProductDetailDrawer'),
  {
    loading: () => <DrawerSkeleton />,
    ssr: false,
  }
);

/**
 * Command Palette - Global command search
 * Size: ~255 lines
 */
export const LazyCommandPalette = lazyWithPreload(
  () => import('@/components/CommandPalette')
);

// ============================================================================
// Chart/Analytics Components (Priority 2)
// ============================================================================

/**
 * Efficiency Analysis Chart - Uses recharts
 * Size: ~279 lines, includes heavy charting library
 */
export const LazyEfficiencyAnalysis = lazyChart(
  () => import('@/components/review/EfficiencyAnalysis')
);

/**
 * Time Range Picker V2 - Advanced date picker
 * Size: ~251 lines
 */
export const LazyTimeRangePicker = dynamic(
  () => import('@/components/monitoring/TimeRangePickerV2'),
  {
    loading: () => <div className="h-10 bg-gray-100 animate-pulse rounded" />,
    ssr: false,
  }
);

// ============================================================================
// Table Components
// ============================================================================

/**
 * Review Queue Table - Large data table
 * Size: ~286 lines
 */
export const LazyReviewQueueTable = dynamic(
  () => import('@/components/review/ReviewQueueTable'),
  {
    loading: () => <TableSkeleton rows={10} />,
    ssr: false,
  }
);

/**
 * Ingestion Gate Review Queue List
 * Size: ~249 lines
 */
export const LazyReviewQueueList = dynamic(
  () => import('@/components/ingestion-gate/ReviewQueueList'),
  {
    loading: () => <TableSkeleton rows={8} />,
    ssr: false,
  }
);

// ============================================================================
// Feature Components (Priority 3)
// ============================================================================

/**
 * Evidence Preview Enhanced - Image preview with enhancements
 * Size: ~213 lines
 */
export const LazyEvidencePreview = dynamic(
  () => import('@/components/ingestion-gate/EvidencePreviewEnhanced'),
  {
    ssr: false,
  }
);

/**
 * Presence Batch Check - Lawcore batch checker
 * Size: ~221 lines
 */
export const LazyPresenceBatchCheck = dynamic(
  () => import('@/components/lawcore/PresenceBatchCheck'),
  {
    loading: () => <TableSkeleton rows={5} />,
    ssr: false,
  }
);

// ============================================================================
// Preload Functions
// ============================================================================

/**
 * Preload commonly accessed components
 * Call this when user is likely to need these components soon
 *
 * Example: Preload modals when user hovers over action button
 */
export function preloadCommonModals() {
  if (typeof window !== 'undefined') {
    LazyReviewModal.preload?.();
    LazyCommandPalette.preload?.();
  }
}

/**
 * Preload analytics/chart components
 * Call this when navigating to analytics pages
 */
export function preloadAnalytics() {
  if (typeof window !== 'undefined') {
    LazyEfficiencyAnalysis.preload?.();
  }
}

/**
 * Preload all review-related components
 * Call this when entering review workflow
 */
export function preloadReviewComponents() {
  if (typeof window !== 'undefined') {
    LazyReviewModal.preload?.();
    LazyBatchReviewModal.preload?.();
    LazyReviewQueueTable.preload?.();
  }
}

// ============================================================================
// Re-export types for convenience
// ============================================================================

export type { LazyComponent } from '@/lib/dynamic-imports';
