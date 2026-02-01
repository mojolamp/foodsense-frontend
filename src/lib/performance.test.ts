/**
 * Performance Monitoring Utilities Tests
 *
 * @module lib/performance.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  reportWebVitals,
  measureRender,
  measureAsync,
  getThresholds,
  rateMetric,
  markPerformance,
  measurePerformance,
  getPerformanceEntries,
  clearPerformanceMarks,
  logBundleMetrics,
  observeLongTasks,
  detectSlowNavigation,
  type PerformanceMetric,
} from './performance'

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('reportWebVitals', () => {
    it('should log metric in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const metric: PerformanceMetric = {
        name: 'LCP',
        value: 2500,
        rating: 'good',
      }

      reportWebVitals(metric)

      expect(consoleSpy).toHaveBeenCalledWith('[Performance] LCP:', {
        value: '2500.00ms',
        rating: 'good',
      })

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })

    it('should call gtag when available', () => {
      const mockGtag = vi.fn()
      ;(window as any).gtag = mockGtag

      const metric: PerformanceMetric = {
        name: 'FCP',
        value: 1500,
        rating: 'good',
        delta: 100,
      }

      reportWebVitals(metric)

      expect(mockGtag).toHaveBeenCalledWith('event', 'FCP', {
        value: 1500,
        metric_rating: 'good',
        metric_delta: 100,
      })

      delete (window as any).gtag
    })
  })

  describe('measureRender', () => {
    it('should return a function that measures render time', () => {
      const endMeasure = measureRender('TestComponent')

      expect(typeof endMeasure).toBe('function')
    })

    it('should log slow renders in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Mock performance.now to simulate a render
      const mockNow = vi.spyOn(performance, 'now')
      mockNow.mockReturnValueOnce(0).mockReturnValueOnce(50)

      const endMeasure = measureRender('FastComponent')
      endMeasure()

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      mockNow.mockRestore()
      process.env.NODE_ENV = originalEnv
    })

    it('should report slow renders over 100ms', () => {
      const mockNow = vi.spyOn(performance, 'now')
      mockNow.mockReturnValueOnce(0).mockReturnValueOnce(150) // 150ms render

      const endMeasure = measureRender('SlowComponent')
      endMeasure()

      mockNow.mockRestore()
    })
  })

  describe('measureAsync', () => {
    it('should measure async function duration', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')

      const result = await measureAsync('testOperation', mockFn)

      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalled()
    })

    it('should rethrow errors from async function', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(measureAsync('failOperation', mockFn)).rejects.toThrow('Test error')

      consoleSpy.mockRestore()
    })

    it('should log duration in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await measureAsync('devOperation', async () => 'result')

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('getThresholds', () => {
    it('should return FCP thresholds', () => {
      const result = getThresholds('FCP')

      expect(result).toEqual({ good: 1800, poor: 3000 })
    })

    it('should return LCP thresholds', () => {
      const result = getThresholds('LCP')

      expect(result).toEqual({ good: 2500, poor: 4000 })
    })

    it('should return FID thresholds', () => {
      const result = getThresholds('FID')

      expect(result).toEqual({ good: 100, poor: 300 })
    })

    it('should return CLS thresholds', () => {
      const result = getThresholds('CLS')

      expect(result).toEqual({ good: 0.1, poor: 0.25 })
    })

    it('should return TTFB thresholds', () => {
      const result = getThresholds('TTFB')

      expect(result).toEqual({ good: 800, poor: 1800 })
    })

    it('should return INP thresholds', () => {
      const result = getThresholds('INP')

      expect(result).toEqual({ good: 200, poor: 500 })
    })

    it('should return default thresholds for unknown metric', () => {
      const result = getThresholds('UNKNOWN')

      expect(result).toEqual({ good: 1000, poor: 3000 })
    })
  })

  describe('rateMetric', () => {
    it('should rate metric as good when below good threshold', () => {
      const result = rateMetric('LCP', 2000)

      expect(result).toBe('good')
    })

    it('should rate metric as needs-improvement when between thresholds', () => {
      const result = rateMetric('LCP', 3000)

      expect(result).toBe('needs-improvement')
    })

    it('should rate metric as poor when above poor threshold', () => {
      const result = rateMetric('LCP', 5000)

      expect(result).toBe('poor')
    })

    it('should handle CLS metric correctly', () => {
      expect(rateMetric('CLS', 0.05)).toBe('good')
      expect(rateMetric('CLS', 0.15)).toBe('needs-improvement')
      expect(rateMetric('CLS', 0.3)).toBe('poor')
    })
  })

  describe('markPerformance', () => {
    it('should call performance.mark when available', () => {
      const mockMark = vi.spyOn(performance, 'mark').mockImplementation(() => ({} as PerformanceMark))

      markPerformance('test-mark')

      expect(mockMark).toHaveBeenCalledWith('test-mark')

      mockMark.mockRestore()
    })
  })

  describe('measurePerformance', () => {
    it('should measure between two marks', () => {
      const mockMeasure = vi.spyOn(performance, 'measure').mockImplementation(() => ({} as PerformanceMeasure))
      const mockGetEntries = vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
        { duration: 150 } as PerformanceEntry,
      ])

      const result = measurePerformance('start-mark', 'end-mark')

      expect(result).toBe(150)
      expect(mockMeasure).toHaveBeenCalledWith('start-mark-to-end-mark', 'start-mark', 'end-mark')

      mockMeasure.mockRestore()
      mockGetEntries.mockRestore()
    })

    it('should use custom measure name when provided', () => {
      const mockMeasure = vi.spyOn(performance, 'measure').mockImplementation(() => ({} as PerformanceMeasure))
      const mockGetEntries = vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
        { duration: 100 } as PerformanceEntry,
      ])

      measurePerformance('start', 'end', 'custom-name')

      expect(mockMeasure).toHaveBeenCalledWith('custom-name', 'start', 'end')

      mockMeasure.mockRestore()
      mockGetEntries.mockRestore()
    })

    it('should return null when no entries found', () => {
      const mockMeasure = vi.spyOn(performance, 'measure').mockImplementation(() => ({} as PerformanceMeasure))
      const mockGetEntries = vi.spyOn(performance, 'getEntriesByName').mockReturnValue([])

      const result = measurePerformance('start', 'end')

      expect(result).toBeNull()

      mockMeasure.mockRestore()
      mockGetEntries.mockRestore()
    })

    it('should return null and log error on measurement failure', () => {
      const mockMeasure = vi.spyOn(performance, 'measure').mockImplementation(() => {
        throw new Error('Mark not found')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = measurePerformance('invalid-start', 'invalid-end')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      mockMeasure.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('getPerformanceEntries', () => {
    it('should return performance entries', () => {
      const mockEntries = [{ name: 'test' }]
      const mockGetEntries = vi.spyOn(performance, 'getEntries').mockReturnValue(mockEntries as PerformanceEntry[])

      const result = getPerformanceEntries()

      expect(result).toEqual(mockEntries)

      mockGetEntries.mockRestore()
    })
  })

  describe('clearPerformanceMarks', () => {
    it('should clear marks and measures', () => {
      const mockClearMarks = vi.spyOn(performance, 'clearMarks').mockImplementation(() => {})
      const mockClearMeasures = vi.spyOn(performance, 'clearMeasures').mockImplementation(() => {})

      clearPerformanceMarks()

      expect(mockClearMarks).toHaveBeenCalled()
      expect(mockClearMeasures).toHaveBeenCalled()

      mockClearMarks.mockRestore()
      mockClearMeasures.mockRestore()
    })
  })

  describe('logBundleMetrics', () => {
    it('should log bundle metrics', () => {
      const mockResources = [
        { name: 'app.js', transferSize: 50000 },
        { name: 'vendor.js', transferSize: 100000 },
        { name: 'styles.css', transferSize: 20000 },
      ]

      const mockGetEntriesByType = vi
        .spyOn(performance, 'getEntriesByType')
        .mockReturnValue(mockResources as PerformanceResourceTiming[])

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      logBundleMetrics()

      expect(consoleSpy).toHaveBeenCalledWith('[Bundle Metrics]', expect.objectContaining({
        jsFiles: 2,
        cssFiles: 1,
      }))

      mockGetEntriesByType.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('observeLongTasks', () => {
    it('should return disconnect function when observer is created', () => {
      const mockDisconnect = vi.fn()
      const mockObserve = vi.fn()

      // Mock PerformanceObserver using a class
      const OriginalObserver = global.PerformanceObserver
      class MockObserver {
        constructor(public callback: PerformanceObserverCallback) {}
        observe = mockObserve
        disconnect = mockDisconnect
      }
      ;(global as any).PerformanceObserver = MockObserver

      const callback = vi.fn()
      const disconnect = observeLongTasks(callback)

      expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['longtask'] })
      expect(typeof disconnect).toBe('function')

      disconnect?.()
      expect(mockDisconnect).toHaveBeenCalled()

      global.PerformanceObserver = OriginalObserver
    })

    it('should call callback for long tasks over 50ms', () => {
      let observerCallback: PerformanceObserverCallback | null = null

      const mockDisconnect = vi.fn()
      const mockObserve = vi.fn()

      // Mock PerformanceObserver using a class
      const OriginalObserver = global.PerformanceObserver
      class MockObserver {
        constructor(public cb: PerformanceObserverCallback) {
          observerCallback = cb
        }
        observe = mockObserve
        disconnect = mockDisconnect
      }
      ;(global as any).PerformanceObserver = MockObserver

      const callback = vi.fn()
      observeLongTasks(callback)

      // Simulate long task entry
      if (observerCallback) {
        const mockList = {
          getEntries: () => [{ duration: 100 } as PerformanceEntry],
        } as unknown as PerformanceObserverEntryList
        observerCallback(mockList, {} as PerformanceObserver)
      }

      expect(callback).toHaveBeenCalledWith(100)

      global.PerformanceObserver = OriginalObserver
    })

    it('should not call callback for tasks under 50ms', () => {
      let observerCallback: PerformanceObserverCallback | null = null

      const mockObserve = vi.fn()

      const OriginalObserver = global.PerformanceObserver
      class MockObserver {
        constructor(public cb: PerformanceObserverCallback) {
          observerCallback = cb
        }
        observe = mockObserve
        disconnect = vi.fn()
      }
      ;(global as any).PerformanceObserver = MockObserver

      const callback = vi.fn()
      observeLongTasks(callback)

      // Simulate short task entry (under 50ms)
      if (observerCallback) {
        const mockList = {
          getEntries: () => [{ duration: 30 } as PerformanceEntry],
        } as unknown as PerformanceObserverEntryList
        observerCallback(mockList, {} as PerformanceObserver)
      }

      expect(callback).not.toHaveBeenCalled()

      global.PerformanceObserver = OriginalObserver
    })

    it('should handle observer creation failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const OriginalObserver = global.PerformanceObserver
      class MockObserverError {
        constructor() {
          throw new Error('Observer not supported')
        }
        observe = vi.fn()
        disconnect = vi.fn()
      }
      ;(global as any).PerformanceObserver = MockObserverError

      observeLongTasks(vi.fn())

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      global.PerformanceObserver = OriginalObserver
    })
  })

  describe('detectSlowNavigation', () => {
    it('should log navigation metrics', () => {
      const mockNavigation = {
        domainLookupEnd: 100,
        domainLookupStart: 0,
        connectEnd: 200,
        connectStart: 100,
        responseStart: 300,
        requestStart: 200,
        responseEnd: 400,
        domContentLoadedEventEnd: 600,
        domContentLoadedEventStart: 500,
        loadEventEnd: 800,
        loadEventStart: 700,
        fetchStart: 0,
      }

      const mockGetEntriesByType = vi
        .spyOn(performance, 'getEntriesByType')
        .mockReturnValue([mockNavigation as unknown as PerformanceNavigationTiming])

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      detectSlowNavigation()

      expect(consoleSpy).toHaveBeenCalledWith('[Navigation Timing]', expect.objectContaining({
        dns: 100,
        tcp: 100,
        request: 100,
        response: 100,
      }))

      mockGetEntriesByType.mockRestore()
      consoleSpy.mockRestore()
    })

    it('should warn about slow page loads', () => {
      const mockNavigation = {
        domainLookupEnd: 100,
        domainLookupStart: 0,
        connectEnd: 200,
        connectStart: 100,
        responseStart: 300,
        requestStart: 200,
        responseEnd: 400,
        domContentLoadedEventEnd: 600,
        domContentLoadedEventStart: 500,
        loadEventEnd: 4000, // Over 3000ms total
        loadEventStart: 3900,
        fetchStart: 0,
      }

      const mockGetEntriesByType = vi
        .spyOn(performance, 'getEntriesByType')
        .mockReturnValue([mockNavigation as unknown as PerformanceNavigationTiming])

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      detectSlowNavigation()

      expect(warnSpy).toHaveBeenCalledWith('Slow page load detected:', expect.any(String))

      mockGetEntriesByType.mockRestore()
      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })

    it('should return early when no navigation entry', () => {
      const mockGetEntriesByType = vi
        .spyOn(performance, 'getEntriesByType')
        .mockReturnValue([])

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      detectSlowNavigation()

      expect(consoleSpy).not.toHaveBeenCalled()

      mockGetEntriesByType.mockRestore()
      consoleSpy.mockRestore()
    })
  })
})
