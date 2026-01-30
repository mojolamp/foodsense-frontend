/**
 * Performance Monitoring Utilities
 * ================================
 *
 * Tools for measuring and reporting performance metrics.
 * Tracks Core Web Vitals and custom metrics.
 */

/**
 * Core Web Vitals Metrics
 */
export interface WebVitals {
  /** First Contentful Paint */
  FCP?: number;
  /** Largest Contentful Paint */
  LCP?: number;
  /** First Input Delay */
  FID?: number;
  /** Cumulative Layout Shift */
  CLS?: number;
  /** Time to First Byte */
  TTFB?: number;
  /** Interaction to Next Paint */
  INP?: number;
}

/**
 * Performance entry with timing details
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

/**
 * Report Web Vitals to analytics
 *
 * @example
 * ```tsx
 * // In _app.tsx or layout.tsx
 * export function reportWebVitals(metric: PerformanceMetric) {
 *   sendToAnalytics(metric);
 * }
 * ```
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
  }

  // Send to analytics service (e.g., Google Analytics, PostHog)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: metric.delta,
    });
  }

  // Send to custom analytics endpoint
  sendToAnalyticsAPI(metric);
}

/**
 * Send metrics to backend analytics API
 */
async function sendToAnalyticsAPI(metric: PerformanceMetric) {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    // Use sendBeacon for reliable delivery
    if ('sendBeacon' in navigator) {
      const data = JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
      });

      navigator.sendBeacon('/api/analytics/vitals', data);
    }
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}

/**
 * Measure component render time
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useEffect(() => {
 *     const measure = measureRender('MyComponent');
 *     return () => measure();
 *   }, []);
 * }
 * ```
 */
export function measureRender(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`);
    }

    // Report slow renders
    if (duration > 100) {
      reportWebVitals({
        name: 'component_render',
        value: duration,
        rating: duration > 500 ? 'poor' : 'needs-improvement',
      });
    }
  };
}

/**
 * Measure async operation time
 *
 * @example
 * ```tsx
 * const data = await measureAsync('fetchProducts', () =>
 *   fetch('/api/products').then(r => r.json())
 * );
 * ```
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Async] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Async Error] ${name}: ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Get Web Vitals thresholds
 */
export function getThresholds(metric: string): {
  good: number;
  poor: number;
} {
  const thresholds: Record<
    string,
    { good: number; poor: number }
  > = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  return thresholds[metric] || { good: 1000, poor: 3000 };
}

/**
 * Rate metric based on thresholds
 */
export function rateMetric(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const { good, poor } = getThresholds(name);

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Mark performance timing point
 *
 * @example
 * ```tsx
 * markPerformance('data-fetch-start');
 * // ... do work
 * markPerformance('data-fetch-end');
 * const duration = measurePerformance('data-fetch-start', 'data-fetch-end');
 * ```
 */
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two performance marks
 */
export function measurePerformance(
  startMark: string,
  endMark: string,
  measureName?: string
): number | null {
  if (typeof performance === 'undefined' || !performance.measure) {
    return null;
  }

  try {
    const name = measureName || `${startMark}-to-${endMark}`;
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      return entries[0].duration;
    }
  } catch (error) {
    console.error('Performance measurement failed:', error);
  }

  return null;
}

/**
 * Get all performance entries
 */
export function getPerformanceEntries() {
  if (typeof performance === 'undefined') return [];
  return performance.getEntries();
}

/**
 * Clear performance marks and measures
 */
export function clearPerformanceMarks() {
  if (typeof performance !== 'undefined') {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Log bundle size metrics
 */
export function logBundleMetrics() {
  if (typeof performance === 'undefined') return;

  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter((r) => r.name.endsWith('.js'));
  const styles = resources.filter((r) => r.name.endsWith('.css'));

  const totalJsSize = scripts.reduce(
    (acc, r: any) => acc + (r.transferSize || 0),
    0
  );
  const totalCssSize = styles.reduce(
    (acc, r: any) => acc + (r.transferSize || 0),
    0
  );

  console.log('[Bundle Metrics]', {
    jsFiles: scripts.length,
    jsSize: `${(totalJsSize / 1024).toFixed(2)} KB`,
    cssFiles: styles.length,
    cssSize: `${(totalCssSize / 1024).toFixed(2)} KB`,
    total: `${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`,
  });
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback: (duration: number) => void) {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          callback(entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
  }
}

/**
 * Detect slow page navigation
 */
export function detectSlowNavigation() {
  if (typeof performance === 'undefined') return;

  const navigation =
    performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) return;

  const metrics = {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    load: navigation.loadEventEnd - navigation.loadEventStart,
    total: navigation.loadEventEnd - navigation.fetchStart,
  };

  console.log('[Navigation Timing]', metrics);

  // Warn about slow metrics
  if (metrics.total > 3000) {
    console.warn('Slow page load detected:', `${metrics.total.toFixed(0)}ms`);
  }
}
