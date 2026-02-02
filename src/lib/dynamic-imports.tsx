/**
 * Dynamic Import Utilities
 * =======================
 *
 * Utilities for lazy loading components with proper loading states and error boundaries.
 *
 * Usage:
 *   const LazyModal = lazyWithPreload(() => import('./Modal'));
 *
 *   // Preload on hover
 *   <button onMouseEnter={() => LazyModal.preload()}>Open Modal</button>
 */

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';

export interface DynamicOptions {
  /**
   * Loading function to show while lazy component loads
   */
  loading?: () => ReactNode;

  /**
   * Whether to render on server-side (default: false for lazy components)
   */
  ssr?: boolean;
}

/**
 * Create a lazy-loaded component with preload capability
 *
 * @example
 * ```tsx
 * const LazyChart = lazyWithPreload(() => import('./Chart'));
 *
 * // Preload on route change or user interaction
 * router.events.on('routeChangeStart', () => LazyChart.preload());
 * ```
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: DynamicOptions = {}
) {
  const LazyComponent = dynamic(importFunc, {
    loading: options.loading,
    ssr: options.ssr ?? false,
  });

  // Add preload method
  (LazyComponent as any).preload = importFunc;

  return LazyComponent as T & { preload: () => Promise<{ default: T }> };
}

/**
 * Preload multiple components
 *
 * @example
 * ```tsx
 * preloadComponents([
 *   () => import('./Modal'),
 *   () => import('./Chart'),
 * ]);
 * ```
 */
export function preloadComponents(
  importFuncs: Array<() => Promise<any>>
): Promise<any[]> {
  return Promise.all(importFuncs.map(func => func()));
}

/**
 * Create a lazy component with custom loading state
 *
 * @example
 * ```tsx
 * const LazyTable = lazyWithLoading(
 *   () => import('./Table'),
 *   <TableSkeleton />
 * );
 * ```
 */
export function lazyWithLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent: React.ReactNode
) {
  return dynamic(importFunc, {
    loading: () => <>{loadingComponent}</>,
    ssr: false,
  });
}

/**
 * Create a lazy modal component
 * Optimized for modals that aren't needed on initial load
 *
 * @example
 * ```tsx
 * const ReviewModal = lazyModal(() => import('./ReviewModal'));
 *
 * {isOpen && <ReviewModal {...props} />}
 * ```
 */
export function lazyModal<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    ),
  });
}

/**
 * Create a lazy chart component
 * Optimized for data visualization libraries (recharts, etc.)
 *
 * @example
 * ```tsx
 * const EfficiencyChart = lazyChart(() => import('./EfficiencyChart'));
 * ```
 */
export function lazyChart<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-pulse h-4 w-32 bg-gray-300 rounded mx-auto mb-2" />
          <div className="animate-pulse h-4 w-24 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    ),
  });
}

/**
 * Prefetch route data
 * Useful for preloading next likely routes
 *
 * @example
 * ```tsx
 * // On dashboard, prefetch likely next page
 * useEffect(() => {
 *   prefetchRoute('/products');
 * }, []);
 * ```
 */
export function prefetchRoute(href: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Lazy load third-party libraries on demand
 *
 * @example
 * ```tsx
 * const loadRecharts = () => lazyLibrary('recharts');
 *
 * const chart = await loadRecharts();
 * ```
 */
export async function lazyLibrary<T = unknown>(libraryName: string): Promise<T> {
  const imported = await import(libraryName);
  return imported.default || imported;
}

/**
 * Route-based code splitting helper
 * Creates suspense boundary for route components
 *
 * @example
 * ```tsx
 * export default routeComponent(() => import('./ProductsPage'));
 * ```
 */
export function routeComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ),
  });
}

// Type helpers
export type LazyComponent<T> = T & { preload: () => Promise<{ default: T }> };

export type DynamicImport<T = any> = () => Promise<{ default: T }>;
