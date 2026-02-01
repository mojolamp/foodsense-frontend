/**
 * useProducts Hook Tests
 *
 * @module hooks/useProducts.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useProducts, useProductDetail, useUpdateProductTier, useSimilarProducts } from './useProducts'
import { productsAPI } from '@/lib/api/endpoints/products'

// Mock productsAPI
vi.mock('@/lib/api/endpoints/products', () => ({
  productsAPI: {
    getProducts: vi.fn(),
    getProductDetail: vi.fn(),
    updateProductTier: vi.fn(),
    getSimilarProducts: vi.fn(),
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch products with default params', async () => {
    const mockData = {
      products: [{ id: '1', name: 'Product 1' }],
      total: 1,
      page: 1,
      page_size: 20,
    }
    vi.mocked(productsAPI.getProducts).mockResolvedValue(mockData)

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.getProducts).toHaveBeenCalledWith({
      page: 1,
      page_size: 20,
      filters: undefined,
    })
    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch products with custom params', async () => {
    const mockData = {
      products: [],
      total: 0,
      page: 2,
      page_size: 10,
    }
    vi.mocked(productsAPI.getProducts).mockResolvedValue(mockData)

    const filters = { tier: 'A', search: 'test' }
    const { result } = renderHook(() => useProducts(2, 10, filters), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.getProducts).toHaveBeenCalledWith({
      page: 2,
      page_size: 10,
      filters,
    })
  })

  it('should handle error', async () => {
    vi.mocked(productsAPI.getProducts).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})

describe('useProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch product detail', async () => {
    const mockProduct = { id: 'prod-1', name: 'Test Product', tier: 'A' }
    vi.mocked(productsAPI.getProductDetail).mockResolvedValue(mockProduct)

    const { result } = renderHook(() => useProductDetail('prod-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.getProductDetail).toHaveBeenCalledWith('prod-1')
    expect(result.current.data).toEqual(mockProduct)
  })

  it('should not fetch when productId is empty', async () => {
    const { result } = renderHook(() => useProductDetail(''), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(productsAPI.getProductDetail).not.toHaveBeenCalled()
  })
})

describe('useUpdateProductTier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update product tier successfully', async () => {
    const mockResponse = { success: true }
    vi.mocked(productsAPI.updateProductTier).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateProductTier(), { wrapper: createWrapper() })

    result.current.mutate({ productId: 'prod-1', tier: 'A' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.updateProductTier).toHaveBeenCalledWith('prod-1', 'A')
  })

  it('should handle update error', async () => {
    vi.mocked(productsAPI.updateProductTier).mockRejectedValue(new Error('Update failed'))

    const { result } = renderHook(() => useUpdateProductTier(), { wrapper: createWrapper() })

    result.current.mutate({ productId: 'prod-1', tier: 'B' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useSimilarProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch similar products', async () => {
    const mockProducts = [
      { id: 'sim-1', name: 'Similar 1' },
      { id: 'sim-2', name: 'Similar 2' },
    ]
    vi.mocked(productsAPI.getSimilarProducts).mockResolvedValue(mockProducts)

    const { result } = renderHook(() => useSimilarProducts('prod-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.getSimilarProducts).toHaveBeenCalledWith('prod-1', 5)
    expect(result.current.data).toEqual(mockProducts)
  })

  it('should fetch with custom limit', async () => {
    vi.mocked(productsAPI.getSimilarProducts).mockResolvedValue([])

    const { result } = renderHook(() => useSimilarProducts('prod-1', 10), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsAPI.getSimilarProducts).toHaveBeenCalledWith('prod-1', 10)
  })

  it('should not fetch when productId is empty', async () => {
    const { result } = renderHook(() => useSimilarProducts(''), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(productsAPI.getSimilarProducts).not.toHaveBeenCalled()
  })
})
