import { apiClient } from '../client'
import type {
  Product,
  GoldenRecord,
  ProductVariant,
  ProductFilters,
} from '@/types/product'

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  page_size: number
}

export const productsAPI = {
  getProducts: async (params: {
    page?: number
    page_size?: number
    filters?: ProductFilters
  }) => {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      page_size: String(params.page_size || 20),
      ...(params.filters?.search && { search: params.filters.search }),
      ...(params.filters?.tier && { tier: params.filters.tier }),
      ...(params.filters?.source && { source: params.filters.source }),
      ...(params.filters?.is_golden !== undefined && {
        is_golden: String(params.filters.is_golden),
      }),
      ...(params.filters?.vegan_type && { vegan_type: params.filters.vegan_type }),
    })

    return apiClient.get<ProductsResponse>(`/admin/products/?${query}`)
  },

  getProductDetail: async (productId: string) => {
    return apiClient.get<{
      product: Product
      golden_record: GoldenRecord
      variants: ProductVariant[]
    }>(`/admin/products/${productId}`)
  },

  updateProductTier: async (productId: string, tier: 'A' | 'B' | 'C') => {
    return apiClient.put<Product>(`/admin/products/${productId}/tier`, { tier })
  },

  getSimilarProducts: async (productId: string, limit: number = 5) => {
    return apiClient.get<Product[]>(
      `/admin/products/${productId}/similar?limit=${limit}`
    )
  },

  batchQueryProducts: async (productIds: string[]) => {
    return apiClient.post<Product[]>('/admin/products/batch-query', {
      product_ids: productIds,
    })
  },
}


