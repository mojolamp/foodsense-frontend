/**
 * useDictionary Hook Tests
 *
 * @module hooks/useDictionary.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useTokenRankings, useTokenDetail, useCreateCorrection } from './useDictionary'
import { dictionaryAPI } from '@/lib/api/endpoints/dictionary'

// Mock dictionaryAPI
vi.mock('@/lib/api/endpoints/dictionary', () => ({
  dictionaryAPI: {
    getTokenRankings: vi.fn(),
    getTokenDetail: vi.fn(),
    createCorrection: vi.fn(),
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

describe('useTokenRankings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch token rankings by occurrence', async () => {
    const mockData = {
      tokens: [{ token: 'OCR-ERROR', occurrence_count: 100 }],
      total: 1,
    }
    vi.mocked(dictionaryAPI.getTokenRankings).mockResolvedValue(mockData)

    const { result } = renderHook(() => useTokenRankings('occurrence', ''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dictionaryAPI.getTokenRankings).toHaveBeenCalledWith({
      sort_by: 'occurrence',
      limit: 100,
      search: undefined,
    })
    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch token rankings by products', async () => {
    const mockData = { tokens: [], total: 0 }
    vi.mocked(dictionaryAPI.getTokenRankings).mockResolvedValue(mockData)

    const { result } = renderHook(() => useTokenRankings('products', ''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dictionaryAPI.getTokenRankings).toHaveBeenCalledWith({
      sort_by: 'products',
      limit: 100,
      search: undefined,
    })
  })

  it('should fetch with search term', async () => {
    const mockData = { tokens: [], total: 0 }
    vi.mocked(dictionaryAPI.getTokenRankings).mockResolvedValue(mockData)

    const { result } = renderHook(() => useTokenRankings('occurrence', 'test'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dictionaryAPI.getTokenRankings).toHaveBeenCalledWith({
      sort_by: 'occurrence',
      limit: 100,
      search: 'test',
    })
  })
})

describe('useTokenDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch token detail', async () => {
    const mockDetail = {
      token: 'OCR-ERROR',
      occurrence_count: 50,
      affected_products: 10,
      sample_products: ['prod-1', 'prod-2'],
      contexts: ['context 1'],
    }
    vi.mocked(dictionaryAPI.getTokenDetail).mockResolvedValue(mockDetail)

    const { result } = renderHook(() => useTokenDetail('OCR-ERROR'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dictionaryAPI.getTokenDetail).toHaveBeenCalledWith('OCR-ERROR')
    expect(result.current.data).toEqual(mockDetail)
  })

  it('should not fetch when token is empty', async () => {
    const { result } = renderHook(() => useTokenDetail(''), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(dictionaryAPI.getTokenDetail).not.toHaveBeenCalled()
  })
})

describe('useCreateCorrection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create correction successfully', async () => {
    const mockResponse = { success: true }
    vi.mocked(dictionaryAPI.createCorrection).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCreateCorrection('OCR-ERROR'), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      token: 'OCR-ERROR',
      standard_name: 'Correct Name',
      create_rule: true,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(dictionaryAPI.createCorrection).toHaveBeenCalledWith({
      token: 'OCR-ERROR',
      standard_name: 'Correct Name',
      create_rule: true,
    })
  })

  it('should handle creation error', async () => {
    vi.mocked(dictionaryAPI.createCorrection).mockRejectedValue(new Error('Creation failed'))

    const { result } = renderHook(() => useCreateCorrection('OCR-ERROR'), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      token: 'OCR-ERROR',
      standard_name: 'Correct Name',
      create_rule: false,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
