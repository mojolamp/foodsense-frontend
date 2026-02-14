'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductsTable from '@/components/products/ProductsTable'
import ProductFilters from '@/components/products/ProductFilters'
import ProductDetailDrawer from '@/components/products/ProductDetailDrawer'
import { ProductsLoadingSkeleton } from '@/components/layout/LoadingStates'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product, ProductFilters as Filters } from '@/types/product'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState<Filters>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data, isLoading, error } = useProducts(page, pageSize, filters)

  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof Filters] !== undefined && filters[key as keyof Filters] !== ''
  )

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleImportProducts = () => {
    // FUTURE(P2): Implement product import modal/page when backend API is ready
  }

  const handleAddManually = () => {
    // FUTURE(P2): Implement product creation modal when backend API is ready
  }

  if (isLoading) {
    return <ProductsLoadingSkeleton />
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10">
        <p className="text-destructive">載入失敗: {(error as Error).message}</p>
      </Card>
    )
  }

  const totalProducts = data?.total || 0
  const products = data?.products || []
  const goldenCount = products.filter(p => p.is_golden).length
  const tierACnt = products.filter(p => p.tier === 'A').length
  const tierBCnt = products.filter(p => p.tier === 'B').length
  const tierCCnt = products.filter(p => p.tier === 'C').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">產品總覽</h1>
        <p className="mt-2 text-muted-foreground">
          共 {totalProducts.toLocaleString()} 個產品
        </p>
      </div>

      {/* KPI Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">{totalProducts.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Golden:</span>
          <Badge variant="success" className="text-xs">{goldenCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Tier A:</span>
          <Badge variant="default" className="text-xs">{tierACnt}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Tier B:</span>
          <Badge variant="secondary" className="text-xs">{tierBCnt}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Tier C:</span>
          <Badge variant={tierCCnt > 0 ? 'destructive' : 'secondary'} className="text-xs">{tierCCnt}</Badge>
        </div>
      </div>

      <ProductFilters filters={filters} onFiltersChange={setFilters} />

      <ProductsTable
        products={products}
        onProductClick={(product) => setSelectedProduct(product)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onImportProducts={handleImportProducts}
        onAddManually={handleAddManually}
      />

      {data && data.total > pageSize && (
        <Card className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-muted-foreground">
            顯示 {(page - 1) * pageSize + 1} 到{' '}
            {Math.min(page * pageSize, data.total)} 筆，共 {data.total} 筆
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一頁
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * pageSize >= data.total}
            >
              下一頁
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
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
