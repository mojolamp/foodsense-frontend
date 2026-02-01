/**
 * Products API Endpoints Tests
 *
 * @module lib/api/endpoints/products.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productsAPI } from './products'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('productsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should call API with default params', async () => {
      const mockResponse = { products: [], total: 0, page: 1, page_size: 20 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await productsAPI.getProducts({})

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/products/?')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page_size=20')
      )
    })

    it('should call API with filters', async () => {
      const mockResponse = { products: [], total: 0, page: 1, page_size: 20 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await productsAPI.getProducts({
        page: 2,
        page_size: 50,
        filters: {
          search: 'apple',
          tier: 'A',
          source: 'usda',
          is_golden: true,
          vegan_type: 'vegan',
        },
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page_size=50')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=apple')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('tier=A')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('source=usda')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('is_golden=true')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('vegan_type=vegan')
      )
    })
  })

  describe('getProductDetail', () => {
    it('should call API with product ID', async () => {
      const mockResponse = { product: {}, golden_record: {}, variants: [] }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await productsAPI.getProductDetail('product-123')

      expect(apiClient.get).toHaveBeenCalledWith('/admin/products/product-123')
    })
  })

  describe('updateProductTier', () => {
    it('should call PUT API with tier', async () => {
      const mockResponse = { id: 'product-123', tier: 'A' }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      await productsAPI.updateProductTier('product-123', 'A')

      expect(apiClient.put).toHaveBeenCalledWith(
        '/admin/products/product-123/tier',
        { tier: 'A' }
      )
    })
  })

  describe('getSimilarProducts', () => {
    it('should call API with default limit', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await productsAPI.getSimilarProducts('product-123')

      expect(apiClient.get).toHaveBeenCalledWith(
        '/admin/products/product-123/similar?limit=5'
      )
    })

    it('should call API with custom limit', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await productsAPI.getSimilarProducts('product-123', 10)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/admin/products/product-123/similar?limit=10'
      )
    })
  })

  describe('batchQueryProducts', () => {
    it('should call POST API with product IDs', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await productsAPI.batchQueryProducts(['id-1', 'id-2', 'id-3'])

      expect(apiClient.post).toHaveBeenCalledWith('/admin/products/batch-query', {
        product_ids: ['id-1', 'id-2', 'id-3'],
      })
    })
  })
})
