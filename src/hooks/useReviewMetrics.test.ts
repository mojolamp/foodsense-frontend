/**
 * useReviewMetrics Hook Tests
 *
 * @module hooks/useReviewMetrics.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePersonalMetrics, useTeamMetrics, useCalculatedPersonalMetrics } from './useReviewMetrics'
import { reviewAPI } from '@/lib/api/endpoints/review'

// Mock reviewAPI
vi.mock('@/lib/api/endpoints/review', () => ({
  reviewAPI: {
    getPersonalMetrics: vi.fn(),
    getTeamMetrics: vi.fn(),
    getHistory: vi.fn(),
    getGoldSamples: vi.fn(),
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

describe('usePersonalMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch personal metrics', async () => {
    const mockData = {
      total_reviewed: 100,
      avg_review_time: 120,
      avg_quality_score: 8.5,
    }
    vi.mocked(reviewAPI.getPersonalMetrics).mockResolvedValue(mockData)

    const { result } = renderHook(() => usePersonalMetrics(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getPersonalMetrics).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockData)
  })

  it('should handle error', async () => {
    vi.mocked(reviewAPI.getPersonalMetrics).mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => usePersonalMetrics(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useTeamMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch team metrics', async () => {
    const mockData = {
      total_team_reviews: 500,
      avg_team_quality: 8.2,
      top_reviewer: 'user1',
    }
    vi.mocked(reviewAPI.getTeamMetrics).mockResolvedValue(mockData)

    const { result } = renderHook(() => useTeamMetrics(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getTeamMetrics).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockData)
  })
})

describe('useCalculatedPersonalMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate metrics from history', async () => {
    const now = new Date()
    const mockHistory = [
      {
        id: '1',
        created_at: now.toISOString(),
        data_quality_score: 8,
        confidence_score: 0.85,
      },
      {
        id: '2',
        created_at: now.toISOString(),
        data_quality_score: 9,
        confidence_score: 0.9,
      },
    ]
    const mockGoldSamples = [{ id: 'g1' }]

    vi.mocked(reviewAPI.getHistory).mockResolvedValue(mockHistory)
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue(mockGoldSamples)

    const { result } = renderHook(() => useCalculatedPersonalMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data?.total_reviewed).toBe(2)
    expect(result.current.data?.avg_quality_score).toBe(8.5)
    expect(result.current.data?.gold_sample_count).toBe(1)
  })

  it('should handle empty history', async () => {
    vi.mocked(reviewAPI.getHistory).mockResolvedValue([])
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue([])

    const { result } = renderHook(() => useCalculatedPersonalMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data?.total_reviewed).toBe(0)
    expect(result.current.data?.avg_quality_score).toBe(0)
  })

  it('should calculate confidence distribution correctly', async () => {
    const mockHistory = [
      { id: '1', created_at: new Date().toISOString(), data_quality_score: 8, confidence_score: 0.1 },
      { id: '2', created_at: new Date().toISOString(), data_quality_score: 8, confidence_score: 0.3 },
      { id: '3', created_at: new Date().toISOString(), data_quality_score: 8, confidence_score: 0.5 },
      { id: '4', created_at: new Date().toISOString(), data_quality_score: 8, confidence_score: 0.7 },
      { id: '5', created_at: new Date().toISOString(), data_quality_score: 8, confidence_score: 0.9 },
    ]

    vi.mocked(reviewAPI.getHistory).mockResolvedValue(mockHistory)
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue([])

    const { result } = renderHook(() => useCalculatedPersonalMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())

    const distribution = result.current.data?.confidence_distribution
    expect(distribution).toBeDefined()
    expect(distribution?.length).toBe(5)
  })

  it('should calculate daily, weekly, and monthly review counts', async () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const mockHistory = [
      { id: '1', created_at: now.toISOString(), data_quality_score: 8, confidence_score: 0.9 },
      { id: '2', created_at: yesterday.toISOString(), data_quality_score: 8, confidence_score: 0.9 },
      { id: '3', created_at: lastWeek.toISOString(), data_quality_score: 8, confidence_score: 0.9 },
      { id: '4', created_at: lastMonth.toISOString(), data_quality_score: 8, confidence_score: 0.9 },
      { id: '5', created_at: twoMonthsAgo.toISOString(), data_quality_score: 8, confidence_score: 0.9 },
    ]

    vi.mocked(reviewAPI.getHistory).mockResolvedValue(mockHistory)
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue([])

    const { result } = renderHook(() => useCalculatedPersonalMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data?.reviews_today).toBeGreaterThanOrEqual(0)
    expect(result.current.data?.reviews_this_week).toBeGreaterThanOrEqual(result.current.data?.reviews_today || 0)
    expect(result.current.data?.reviews_this_month).toBeGreaterThanOrEqual(result.current.data?.reviews_this_week || 0)
  })
})
