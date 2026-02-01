/**
 * useReviewQueue Hook Tests
 *
 * @module hooks/useReviewQueue.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useReviewQueue,
  useReviewSubmit,
  useReviewStats,
  useReviewHistory,
  useGoldSamples,
  useBatchReviewSubmit,
} from './useReviewQueue'
import { reviewAPI } from '@/lib/api/endpoints/review'

// Mock reviewAPI
vi.mock('@/lib/api/endpoints/review', () => ({
  reviewAPI: {
    getQueue: vi.fn(),
    submitReview: vi.fn(),
    getStats: vi.fn(),
    getHistory: vi.fn(),
    getGoldSamples: vi.fn(),
    batchSubmitReviews: vi.fn(),
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useReviewQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch review queue without filters', async () => {
    const mockData = { items: [{ id: '1' }], total: 1 }
    vi.mocked(reviewAPI.getQueue).mockResolvedValue(mockData)

    const { result } = renderHook(() => useReviewQueue(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getQueue).toHaveBeenCalledWith({ limit: 50 })
    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch review queue with filters', async () => {
    const mockData = { items: [], total: 0 }
    vi.mocked(reviewAPI.getQueue).mockResolvedValue(mockData)

    const filters = { validation_status: 'pending', confidence_level: 'low' }
    const { result } = renderHook(() => useReviewQueue(filters), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getQueue).toHaveBeenCalledWith({
      ...filters,
      limit: 50,
    })
  })
})

describe('useReviewSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit review successfully', async () => {
    const mockResponse = { success: true, id: 'review-1' }
    vi.mocked(reviewAPI.submitReview).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useReviewSubmit(), { wrapper: createWrapper() })

    result.current.mutate({
      ocr_record_id: 'ocr-1',
      product_id: 'prod-1',
      corrected_payload: { name: 'Test Product' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.submitReview).toHaveBeenCalled()
  })

  it('should handle submit error', async () => {
    vi.mocked(reviewAPI.submitReview).mockRejectedValue(new Error('Submit failed'))

    const { result } = renderHook(() => useReviewSubmit(), { wrapper: createWrapper() })

    result.current.mutate({
      ocr_record_id: 'ocr-1',
      product_id: 'prod-1',
      corrected_payload: {},
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useReviewStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch review stats', async () => {
    const mockStats = {
      total: 100,
      pending: 20,
      reviewed: 80,
      average_score: 0.85,
    }
    vi.mocked(reviewAPI.getStats).mockResolvedValue(mockStats)

    const { result } = renderHook(() => useReviewStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getStats).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockStats)
  })
})

describe('useReviewHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch review history with default limit', async () => {
    const mockHistory = [{ id: '1', reviewed_at: '2024-01-01' }]
    vi.mocked(reviewAPI.getHistory).mockResolvedValue(mockHistory)

    const { result } = renderHook(() => useReviewHistory(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getHistory).toHaveBeenCalledWith({ limit: 50 })
    expect(result.current.data).toEqual(mockHistory)
  })

  it('should fetch review history with custom limit', async () => {
    vi.mocked(reviewAPI.getHistory).mockResolvedValue([])

    const { result } = renderHook(() => useReviewHistory(100), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getHistory).toHaveBeenCalledWith({ limit: 100 })
  })
})

describe('useGoldSamples', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch gold samples with default limit', async () => {
    const mockSamples = [{ id: '1', is_gold: true }]
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue(mockSamples)

    const { result } = renderHook(() => useGoldSamples(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getGoldSamples).toHaveBeenCalledWith({ limit: 50 })
    expect(result.current.data).toEqual(mockSamples)
  })

  it('should fetch gold samples with custom limit', async () => {
    vi.mocked(reviewAPI.getGoldSamples).mockResolvedValue([])

    const { result } = renderHook(() => useGoldSamples(25), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.getGoldSamples).toHaveBeenCalledWith({ limit: 25 })
  })
})

describe('useBatchReviewSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit batch reviews successfully', async () => {
    const mockResponse = { success: true, submitted: 3, failed: 0, total: 3 }
    vi.mocked(reviewAPI.batchSubmitReviews).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBatchReviewSubmit(), { wrapper: createWrapper() })

    const records = [
      { id: 'ocr-1', product_id: 'prod-1', ocr_raw_text: 'text1' },
      { id: 'ocr-2', product_id: 'prod-2', ocr_raw_text: 'text2' },
      { id: 'ocr-3', product_id: 'prod-3', ocr_raw_text: 'text3' },
    ]

    const template = {
      data_quality_score: 0.9,
      confidence_score: 0.85,
      review_notes: 'Batch reviewed',
      is_gold: false,
    }

    result.current.mutate({ records, template })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(reviewAPI.batchSubmitReviews).toHaveBeenCalledWith({
      reviews: expect.arrayContaining([
        expect.objectContaining({ ocr_record_id: 'ocr-1' }),
        expect.objectContaining({ ocr_record_id: 'ocr-2' }),
        expect.objectContaining({ ocr_record_id: 'ocr-3' }),
      ]),
      template: expect.objectContaining({
        data_quality_score: 0.9,
        confidence_score: 0.85,
      }),
    })
  })

  it('should handle partial failure', async () => {
    const mockResponse = { success: true, submitted: 2, failed: 1, total: 3 }
    vi.mocked(reviewAPI.batchSubmitReviews).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBatchReviewSubmit(), { wrapper: createWrapper() })

    result.current.mutate({
      records: [{ id: 'ocr-1', product_id: 'prod-1', ocr_raw_text: 'text' }],
      template: { data_quality_score: 0.9, confidence_score: 0.8, is_gold: false },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('should handle batch error', async () => {
    vi.mocked(reviewAPI.batchSubmitReviews).mockRejectedValue(new Error('Batch failed'))

    const { result } = renderHook(() => useBatchReviewSubmit(), { wrapper: createWrapper() })

    result.current.mutate({
      records: [{ id: 'ocr-1', product_id: 'prod-1', ocr_raw_text: 'text' }],
      template: { data_quality_score: 0.9, confidence_score: 0.8, is_gold: false },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
