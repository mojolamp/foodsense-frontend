/**
 * useIngestionGate Hook Tests
 *
 * @module hooks/useIngestionGate.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useReviewQueue,
  useReviewDetail,
  useResolveReview,
  useApplyPatch,
  useEntitySuggest,
  useCommitEntityAlias,
  useRetryGate,
  useBulkResolve,
  useBulkApplyFix,
} from './useIngestionGate'
import { ingestionGateAPI } from '@/lib/api/endpoints/ingestionGate'

// Mock ingestionGateAPI
vi.mock('@/lib/api/endpoints/ingestionGate', () => ({
  ingestionGateAPI: {
    getReviewQueue: vi.fn(),
    getReviewDetail: vi.fn(),
    resolveReview: vi.fn(),
    applyPatch: vi.fn(),
    getEntitySuggest: vi.fn(),
    commitEntityAlias: vi.fn(),
    retryGate: vi.fn(),
    bulkResolve: vi.fn(),
    bulkApplyFix: vi.fn(),
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
    const mockData = [{ id: '1', status: 'pending' }]
    vi.mocked(ingestionGateAPI.getReviewQueue).mockResolvedValue(mockData)

    const { result } = renderHook(() => useReviewQueue(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.getReviewQueue).toHaveBeenCalledWith(undefined)
    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch review queue with filters', async () => {
    const mockData = [{ id: '1', status: 'pending' }]
    vi.mocked(ingestionGateAPI.getReviewQueue).mockResolvedValue(mockData)

    const filters = { status: 'pending', priority: 1, decision: 'BLOCK' as const }
    const { result } = renderHook(() => useReviewQueue(filters), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.getReviewQueue).toHaveBeenCalledWith(filters)
  })

  it('should handle error', async () => {
    vi.mocked(ingestionGateAPI.getReviewQueue).mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => useReviewQueue(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useReviewDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch review detail when reviewId is provided', async () => {
    const mockData = { id: 'review-1', status: 'pending', findings: [] }
    vi.mocked(ingestionGateAPI.getReviewDetail).mockResolvedValue(mockData)

    const { result } = renderHook(() => useReviewDetail('review-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.getReviewDetail).toHaveBeenCalledWith('review-1')
    expect(result.current.data).toEqual(mockData)
  })

  it('should not fetch when reviewId is empty', async () => {
    const { result } = renderHook(() => useReviewDetail(''), { wrapper: createWrapper() })

    // Query should be disabled
    expect(result.current.fetchStatus).toBe('idle')
    expect(ingestionGateAPI.getReviewDetail).not.toHaveBeenCalled()
  })
})

describe('useResolveReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve review successfully', async () => {
    const mockResponse = { success: true, id: 'review-1', status: 'resolved' }
    vi.mocked(ingestionGateAPI.resolveReview).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useResolveReview(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewId: 'review-1',
        resolution: { status: 'resolved', notes: 'Test note' },
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.resolveReview).toHaveBeenCalledWith('review-1', {
      status: 'resolved',
      notes: 'Test note',
    })
  })

  it('should handle resolve error', async () => {
    vi.mocked(ingestionGateAPI.resolveReview).mockRejectedValue(new Error('Resolve failed'))

    const { result } = renderHook(() => useResolveReview(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewId: 'review-1',
        resolution: { status: 'resolved' },
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should perform optimistic update on mutate', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    // Pre-populate cache with queue data
    queryClient.setQueryData(['ingestionGateReviewQueue'], [
      { id: 'review-1', status: 'pending' },
      { id: 'review-2', status: 'pending' },
    ])

    vi.mocked(ingestionGateAPI.resolveReview).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    )

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useResolveReview(), { wrapper })

    act(() => {
      result.current.mutate({
        reviewId: 'review-1',
        resolution: { status: 'resolved' },
      })
    })

    // Check optimistic update happened immediately
    await waitFor(() => {
      const queue = queryClient.getQueryData(['ingestionGateReviewQueue']) as Array<{ id: string }>
      expect(queue.length).toBe(1)
      expect(queue[0].id).toBe('review-2')
    })
  })
})

describe('useApplyPatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should apply patch successfully', async () => {
    const mockResponse = { success: true, patched_fields: ['name'] }
    vi.mocked(ingestionGateAPI.applyPatch).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useApplyPatch(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewId: 'review-1',
        findingId: 'finding-1',
        patch: [{ op: 'replace', path: '/name', value: 'New Name' }],
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.applyPatch).toHaveBeenCalledWith('review-1', {
      finding_id: 'finding-1',
      patch: [{ op: 'replace', path: '/name', value: 'New Name' }],
    })
  })

  it('should handle patch error', async () => {
    vi.mocked(ingestionGateAPI.applyPatch).mockRejectedValue(new Error('Patch failed'))

    const { result } = renderHook(() => useApplyPatch(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewId: 'review-1',
        findingId: 'finding-1',
        patch: [],
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useEntitySuggest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch entity suggestions when query is provided', async () => {
    const mockData = [
      { canonical_name: 'Sugar', match_type: 'ALIAS' as const, score: 0.95 },
    ]
    vi.mocked(ingestionGateAPI.getEntitySuggest).mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useEntitySuggest('sug', 'ingredients'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.getEntitySuggest).toHaveBeenCalledWith('sug', 'ingredients')
    expect(result.current.data).toEqual(mockData)
  })

  it('should not fetch when query is empty', async () => {
    const { result } = renderHook(
      () => useEntitySuggest('', 'ingredients'),
      { wrapper: createWrapper() }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(ingestionGateAPI.getEntitySuggest).not.toHaveBeenCalled()
  })

  it('should work with different namespaces', async () => {
    const mockData = [{ canonical_name: 'Peanut', match_type: 'HYBRID' as const, score: 0.9 }]
    vi.mocked(ingestionGateAPI.getEntitySuggest).mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useEntitySuggest('pea', 'allergens'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.getEntitySuggest).toHaveBeenCalledWith('pea', 'allergens')
  })
})

describe('useCommitEntityAlias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should commit entity alias successfully', async () => {
    const mockResponse = { success: true, alias_id: 'alias-1' }
    vi.mocked(ingestionGateAPI.commitEntityAlias).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCommitEntityAlias(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        original: 'suger',
        canonical: 'sugar',
        namespace: 'ingredients',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.commitEntityAlias).toHaveBeenCalledWith({
      original: 'suger',
      canonical: 'sugar',
      namespace: 'ingredients',
    })
  })

  it('should handle commit error', async () => {
    vi.mocked(ingestionGateAPI.commitEntityAlias).mockRejectedValue(new Error('Commit failed'))

    const { result } = renderHook(() => useCommitEntityAlias(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        original: 'test',
        canonical: 'test',
        namespace: 'ingredients',
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useRetryGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should retry gate successfully', async () => {
    const mockResponse = { success: true, job_id: 'job-1', status: 'queued' }
    vi.mocked(ingestionGateAPI.retryGate).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useRetryGate(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        scanId: 'scan-1',
        action: 'rescan',
        targetFields: ['name', 'ingredients'],
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.retryGate).toHaveBeenCalledWith('scan-1', {
      action: 'rescan',
      target_fields: ['name', 'ingredients'],
    })
  })

  it('should handle retry error', async () => {
    vi.mocked(ingestionGateAPI.retryGate).mockRejectedValue(new Error('Retry failed'))

    const { result } = renderHook(() => useRetryGate(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        scanId: 'scan-1',
        action: 'rescan',
        targetFields: [],
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useBulkResolve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should bulk resolve successfully', async () => {
    const mockResponse = { success: true, resolved: 3, failed: 0 }
    vi.mocked(ingestionGateAPI.bulkResolve).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBulkResolve(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2', 'r3'],
        status: 'resolved',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.bulkResolve).toHaveBeenCalledWith(['r1', 'r2', 'r3'], 'resolved')
  })

  it('should handle partial failure', async () => {
    const mockResponse = {
      success: true,
      resolved: 2,
      failed: 1,
      errors: [{ id: 'r3', error: 'Not found' }],
    }
    vi.mocked(ingestionGateAPI.bulkResolve).mockResolvedValue(mockResponse)

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useBulkResolve(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2', 'r3'],
        status: 'resolved',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(consoleSpy).toHaveBeenCalledWith('[BulkResolve] 部分失敗:', [{ id: 'r3', error: 'Not found' }])
    consoleSpy.mockRestore()
  })

  it('should handle bulk error', async () => {
    vi.mocked(ingestionGateAPI.bulkResolve).mockRejectedValue(new Error('Bulk failed'))

    const { result } = renderHook(() => useBulkResolve(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1'],
        status: 'resolved',
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should perform optimistic update on bulk mutate', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    // Pre-populate cache
    queryClient.setQueryData(['ingestionGateReviewQueue'], [
      { id: 'r1', status: 'pending' },
      { id: 'r2', status: 'pending' },
      { id: 'r3', status: 'pending' },
    ])

    vi.mocked(ingestionGateAPI.bulkResolve).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, resolved: 2, failed: 0 }), 100))
    )

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useBulkResolve(), { wrapper })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2'],
        status: 'resolved',
      })
    })

    // Check optimistic update - r1 and r2 should be removed
    await waitFor(() => {
      const queue = queryClient.getQueryData(['ingestionGateReviewQueue']) as Array<{ id: string }>
      expect(queue.length).toBe(1)
      expect(queue[0].id).toBe('r3')
    })
  })

  it('should rollback on bulk error', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    const originalQueue = [
      { id: 'r1', status: 'pending' },
      { id: 'r2', status: 'pending' },
    ]
    queryClient.setQueryData(['ingestionGateReviewQueue'], originalQueue)

    vi.mocked(ingestionGateAPI.bulkResolve).mockRejectedValue(new Error('Bulk failed'))

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useBulkResolve(), { wrapper })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2'],
        status: 'resolved',
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Check rollback
    const queue = queryClient.getQueryData(['ingestionGateReviewQueue'])
    expect(queue).toEqual(originalQueue)
  })
})

describe('useBulkApplyFix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should bulk apply fix successfully', async () => {
    const mockResponse = { success: true, applied: 3, failed: 0 }
    vi.mocked(ingestionGateAPI.bulkApplyFix).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBulkApplyFix(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2', 'r3'],
        ruleId: 'rule-1',
        patch: [{ op: 'replace', path: '/status', value: 'fixed' }],
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ingestionGateAPI.bulkApplyFix).toHaveBeenCalledWith(['r1', 'r2', 'r3'], {
      rule_id: 'rule-1',
      patch: [{ op: 'replace', path: '/status', value: 'fixed' }],
    })
  })

  it('should handle partial failure', async () => {
    const mockResponse = {
      success: true,
      applied: 2,
      failed: 1,
      errors: [{ id: 'r3', error: 'Invalid patch' }],
    }
    vi.mocked(ingestionGateAPI.bulkApplyFix).mockResolvedValue(mockResponse)

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useBulkApplyFix(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1', 'r2', 'r3'],
        ruleId: 'rule-1',
        patch: [],
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(consoleSpy).toHaveBeenCalledWith('[BulkApplyFix] 部分失敗:', [{ id: 'r3', error: 'Invalid patch' }])
    consoleSpy.mockRestore()
  })

  it('should handle bulk apply error', async () => {
    vi.mocked(ingestionGateAPI.bulkApplyFix).mockRejectedValue(new Error('Bulk apply failed'))

    const { result } = renderHook(() => useBulkApplyFix(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        reviewIds: ['r1'],
        ruleId: 'rule-1',
        patch: [],
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
