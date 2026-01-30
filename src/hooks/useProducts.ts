import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api/endpoints/products'
import type { ProductFilters } from '@/types/product'
import toast from 'react-hot-toast'

export function useProducts(
  page: number = 1,
  pageSize: number = 20,
  filters?: ProductFilters
) {
  return useQuery({
    queryKey: ['products', page, pageSize, filters],
    queryFn: () => productsAPI.getProducts({ page, page_size: pageSize, filters }),
  })
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getProductDetail(productId),
    enabled: !!productId,
  })
}

export function useUpdateProductTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, tier }: { productId: string; tier: 'A' | 'B' | 'C' }) =>
      productsAPI.updateProductTier(productId, tier),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] })
      toast.success(`Tier 已更新為 ${variables.tier}`)
    },
    onError: (error: any) => {
      toast.error(error.message || '更新失敗')
    },
  })
}

export function useSimilarProducts(productId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['similarProducts', productId, limit],
    queryFn: () => productsAPI.getSimilarProducts(productId, limit),
    enabled: !!productId,
  })
}





