/**
 * useCrawlerPipeline Hook Tests
 * Pipeline orchestration state machine
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock all external API modules before importing the hook
vi.mock('@/lib/api/endpoints/crawlerRaw', () => ({
  crawlerRawAPI: {
    listCrawlers: vi.fn(),
    probe: vi.fn(),
    crawlSearch: vi.fn(),
    crawlScheduled: vi.fn(),
    getTaskStatus: vi.fn(),
  },
}))

vi.mock('@/lib/api/endpoints/dataQualityV2', () => ({
  dataQualityV2API: {
    getIngestionSummary: vi.fn(),
    getCoverage: vi.fn(),
    getFreshness: vi.fn(),
  },
}))

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { usePipelineRun } from '@/hooks/useCrawlerPipeline'
import { crawlerRawAPI } from '@/lib/api/endpoints/crawlerRaw'
import { dataQualityV2API } from '@/lib/api/endpoints/dataQualityV2'
import { apiClient } from '@/lib/api/client'

const mockApiGet = vi.mocked(apiClient.get)
const mockListCrawlers = vi.mocked(crawlerRawAPI.listCrawlers)
const mockProbe = vi.mocked(crawlerRawAPI.probe)
const mockCrawlSearch = vi.mocked(crawlerRawAPI.crawlSearch)
const mockCrawlScheduled = vi.mocked(crawlerRawAPI.crawlScheduled)
const mockGetTaskStatus = vi.mocked(crawlerRawAPI.getTaskStatus)
const mockGetIngestion = vi.mocked(dataQualityV2API.getIngestionSummary)
const mockGetCoverage = vi.mocked(dataQualityV2API.getCoverage)
const mockGetFreshness = vi.mocked(dataQualityV2API.getFreshness)

describe('usePipelineRun', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該初始化為 idle 狀態', () => {
    const { result } = renderHook(() => usePipelineRun())

    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.config).toBeNull()
    expect(result.current.state.currentPhase).toBeNull()
    expect(result.current.state.phases).toHaveLength(5)
    expect(result.current.state.phases.every((p) => p.status === 'pending')).toBe(true)
  })

  it('應該有 5 個 phases 按正確順序', () => {
    const { result } = renderHook(() => usePipelineRun())
    const phaseNames = result.current.state.phases.map((p) => p.phase)
    expect(phaseNames).toEqual(['preflight', 'probe', 'pilot', 'batch', 'verify'])
  })

  it('reset 應該回到 idle 狀態', () => {
    const { result } = renderHook(() => usePipelineRun())

    act(() => {
      result.current.reset()
    })

    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.phases.every((p) => p.status === 'pending')).toBe(true)
  })

  describe('Dry Run (preflight only)', () => {
    it('健康檢查通過時 dry run 應該成功', async () => {
      mockApiGet.mockResolvedValueOnce({ status: 'ok' }) // /health
      mockApiGet.mockResolvedValueOnce({ status: 'ok' }) // /health/ready
      mockListCrawlers.mockResolvedValueOnce({ crawlers: ['pchome'], total: 1 })

      const { result } = renderHook(() => usePipelineRun())

      await act(async () => {
        await result.current.start({
          keywords: ['豆腐'],
          sites: ['pchome'],
          limitPerKeyword: 5,
          dryRun: true,
        })
      })

      await waitFor(() => {
        expect(result.current.state.status).toBe('completed')
      })

      expect(result.current.state.phases[0].status).toBe('passed')
      expect(result.current.state.phases[0].checks.length).toBeGreaterThanOrEqual(3)
      // Remaining phases should be pending (dry run skips them)
      expect(result.current.state.phases[1].status).toBe('pending')
      expect(result.current.state.phases[2].status).toBe('pending')
      expect(result.current.state.phases[3].status).toBe('pending')
      expect(result.current.state.phases[4].status).toBe('pending')
    })

    it('健康端點失敗時 preflight 應該 abort', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Connection refused'))

      const { result } = renderHook(() => usePipelineRun())

      await act(async () => {
        await result.current.start({
          keywords: ['test'],
          sites: [],
          limitPerKeyword: 5,
          dryRun: true,
        })
      })

      await waitFor(() => {
        expect(result.current.state.status).toBe('aborted')
      })

      expect(result.current.state.phases[0].status).toBe('failed')
      expect(result.current.state.phases[0].checks.some((c) => !c.passed)).toBe(true)
    })

    it('crawlers 為 0 時應該 abort', async () => {
      mockApiGet.mockResolvedValueOnce({ status: 'ok' })
      mockApiGet.mockResolvedValueOnce({ status: 'ok' })
      mockListCrawlers.mockResolvedValueOnce({ crawlers: [], total: 0 })

      const { result } = renderHook(() => usePipelineRun())

      await act(async () => {
        await result.current.start({
          keywords: ['test'],
          sites: [],
          limitPerKeyword: 5,
          dryRun: true,
        })
      })

      await waitFor(() => {
        expect(result.current.state.status).toBe('aborted')
      })

      expect(result.current.state.phases[0].status).toBe('failed')
    })
  })

  describe('abort', () => {
    it('abort 應該將 running phases 標記為 failed，pending 標記為 skipped', () => {
      const { result } = renderHook(() => usePipelineRun())

      // Manually trigger abort without starting (simulates mid-run abort)
      act(() => {
        result.current.abort()
      })

      expect(result.current.state.status).toBe('aborted')
      // All were pending, so all should be skipped
      result.current.state.phases.forEach((p) => {
        expect(p.status).toBe('skipped')
      })
    })
  })

  describe('Config 保存', () => {
    it('start 應該保存 config 到 state', async () => {
      mockApiGet.mockResolvedValueOnce({ status: 'ok' })
      mockApiGet.mockResolvedValueOnce({ status: 'ok' })
      mockListCrawlers.mockResolvedValueOnce({ crawlers: ['pchome'], total: 1 })

      const config = {
        keywords: ['醬油', '味噌'],
        sites: ['pchome', 'momoshop'],
        limitPerKeyword: 10,
        dryRun: true,
      }

      const { result } = renderHook(() => usePipelineRun())

      await act(async () => {
        await result.current.start(config)
      })

      await waitFor(() => {
        expect(result.current.state.config).toEqual(config)
      })
    })
  })
})
