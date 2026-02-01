/**
 * useRules Hook Tests
 *
 * @module hooks/useRules.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useRules, useRule, useCreateRule, useUpdateRule, useDeleteRule, useToggleRule } from './useRules'
import { rulesAPI } from '@/lib/api/endpoints/rules'

// Mock rulesAPI
vi.mock('@/lib/api/endpoints/rules', () => ({
  rulesAPI: {
    getRules: vi.fn(),
    getRule: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
    toggleRule: vi.fn(),
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

describe('useRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch rules without params', async () => {
    const mockRules = [{ id: 'rule-1', name: 'Rule 1', is_active: true }]
    vi.mocked(rulesAPI.getRules).mockResolvedValue(mockRules)

    const { result } = renderHook(() => useRules(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.getRules).toHaveBeenCalledWith(undefined)
    expect(result.current.data).toEqual(mockRules)
  })

  it('should fetch rules with params', async () => {
    const mockRules: unknown[] = []
    vi.mocked(rulesAPI.getRules).mockResolvedValue(mockRules)

    const params = { is_active: true, sort_by: 'hit_count' as const }
    const { result } = renderHook(() => useRules(params), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.getRules).toHaveBeenCalledWith(params)
  })
})

describe('useRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single rule', async () => {
    const mockRule = { id: 'rule-1', name: 'Rule 1', is_active: true }
    vi.mocked(rulesAPI.getRule).mockResolvedValue(mockRule)

    const { result } = renderHook(() => useRule('rule-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.getRule).toHaveBeenCalledWith('rule-1')
    expect(result.current.data).toEqual(mockRule)
  })

  it('should not fetch when ruleId is empty', async () => {
    const { result } = renderHook(() => useRule(''), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(rulesAPI.getRule).not.toHaveBeenCalled()
  })
})

describe('useCreateRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create rule successfully', async () => {
    const mockResponse = { id: 'rule-new', name: 'New Rule' }
    vi.mocked(rulesAPI.createRule).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCreateRule(), { wrapper: createWrapper() })

    result.current.mutate({
      name: 'New Rule',
      pattern: '.*test.*',
      severity: 'WARN',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.createRule).toHaveBeenCalledWith({
      name: 'New Rule',
      pattern: '.*test.*',
      severity: 'WARN',
    })
  })

  it('should handle creation error', async () => {
    vi.mocked(rulesAPI.createRule).mockRejectedValue(new Error('Creation failed'))

    const { result } = renderHook(() => useCreateRule(), { wrapper: createWrapper() })

    result.current.mutate({ name: 'New Rule', pattern: '.*', severity: 'INFO' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useUpdateRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update rule successfully', async () => {
    const mockResponse = { id: 'rule-1', name: 'Updated Rule' }
    vi.mocked(rulesAPI.updateRule).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateRule(), { wrapper: createWrapper() })

    result.current.mutate({
      ruleId: 'rule-1',
      data: { name: 'Updated Rule' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.updateRule).toHaveBeenCalledWith('rule-1', { name: 'Updated Rule' })
  })
})

describe('useDeleteRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete rule successfully', async () => {
    vi.mocked(rulesAPI.deleteRule).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useDeleteRule(), { wrapper: createWrapper() })

    result.current.mutate('rule-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.deleteRule).toHaveBeenCalledWith('rule-1')
  })

  it('should handle deletion error', async () => {
    vi.mocked(rulesAPI.deleteRule).mockRejectedValue(new Error('Delete failed'))

    const { result } = renderHook(() => useDeleteRule(), { wrapper: createWrapper() })

    result.current.mutate('rule-1')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useToggleRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should toggle rule successfully', async () => {
    vi.mocked(rulesAPI.toggleRule).mockResolvedValue({ id: 'rule-1', is_active: false })

    const { result } = renderHook(() => useToggleRule(), { wrapper: createWrapper() })

    result.current.mutate('rule-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesAPI.toggleRule).toHaveBeenCalledWith('rule-1')
  })

  it('should handle toggle error', async () => {
    vi.mocked(rulesAPI.toggleRule).mockRejectedValue(new Error('Toggle failed'))

    const { result } = renderHook(() => useToggleRule(), { wrapper: createWrapper() })

    result.current.mutate('rule-1')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
