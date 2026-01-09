'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductsTable from '@/components/products/ProductsTable'
import ProductFilters from '@/components/products/ProductFilters'
import ProductDetailDrawer from '@/components/products/ProductDetailDrawer'
import { ProductsLoadingSkeleton } from '@/components/layout/LoadingStates'
import type { Product, ProductFilters as Filters } from '@/types/product'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState<Filters>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data, isLoading, error } = useProducts(page, pageSize, filters)

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof Filters] !== undefined && filters[key as keyof Filters] !== ''
  )

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  // Handle import products (placeholder - would navigate to import page)
  const handleImportProducts = () => {
    // TODO: Navigate to import page or open import modal
    console.log('Navigate to import page')
  }

  // Handle add manually (placeholder - would open create modal)
  const handleAddManually = () => {
    // TODO: Open product creation modal
    console.log('Open product creation modal')
  }

  if (isLoading) {
    return <ProductsLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">載入失敗: {(error as Error).message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">產品總覽</h1>
        <p className="mt-2 text-gray-600">
          共 {data?.total || 0} 個產品
        </p>
      </div>

      <ProductFilters filters={filters} onFiltersChange={setFilters} />

      <ProductsTable
        products={data?.products || []}
        onProductClick={(product) => setSelectedProduct(product)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onImportProducts={handleImportProducts}
        onAddManually={handleAddManually}
      />

      {data && data.total > pageSize && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            顯示 {(page - 1) * pageSize + 1} 到{' '}
            {Math.min(page * pageSize, data.total)} 筆，共 {data.total} 筆
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * pageSize >= data.total}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}


