/**
 * useDataQuality Hook Tests
 *
 * @module hooks/useDataQuality.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useQualityOverview, useQualityTimeline, useQualitySources, useQualityCoverage } from './useDataQuality'
import { qualityAPI } from '@/lib/api/endpoints/quality'

// Mock qualityAPI
vi.mock('@/lib/api/endpoints/quality', () => ({
  qualityAPI: {
    getOverview: vi.fn(),
    getTimeline: vi.fn(),
    getSourceContribution: vi.fn(),
    getCoverage: vi.fn(),
  },
}))

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useQualityOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch quality overview', async () => {
    const mockData = {
      total_products: 1000,
      quality_score: 95,
      golden_products: 100,
      coverage_rate: 0.85,
    }
    vi.mocked(qualityAPI.getOverview).mockResolvedValue(mockData)

    const { result } = renderHook(() => useQualityOverview(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(qualityAPI.getOverview).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockData)
  })

  it('should handle error', async () => {
    vi.mocked(qualityAPI.getOverview).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useQualityOverview(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useQualityTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch timeline with default days', async () => {
    const mockData = [
      { date: '2024-01-01', score: 90 },
      { date: '2024-01-02', score: 92 },
    ]
    vi.mocked(qualityAPI.getTimeline).mockResolvedValue(mockData)

    const { result } = renderHook(() => useQualityTimeline(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(qualityAPI.getTimeline).toHaveBeenCalledWith(30)
    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch timeline with custom days', async () => {
    vi.mocked(qualityAPI.getTimeline).mockResolvedValue([])

    const { result } = renderHook(() => useQualityTimeline(7), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(qualityAPI.getTimeline).toHaveBeenCalledWith(7)
  })
})

describe('useQualitySources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch source contribution', async () => {
    const mockData = [
      { source: 'OCR', contribution: 0.6 },
      { source: 'Manual', contribution: 0.4 },
    ]
    vi.mocked(qualityAPI.getSourceContribution).mockResolvedValue(mockData)

    const { result } = renderHook(() => useQualitySources(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(qualityAPI.getSourceContribution).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockData)
  })
})

describe('useQualityCoverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch coverage data', async () => {
    const mockData = {
      total: 1000,
      covered: 850,
      coverage_rate: 0.85,
    }
    vi.mocked(qualityAPI.getCoverage).mockResolvedValue(mockData)

    const { result } = renderHook(() => useQualityCoverage(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(qualityAPI.getCoverage).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockData)
  })
})
