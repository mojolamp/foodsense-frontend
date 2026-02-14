'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Product } from '@/types/product'
import TierBadge from './TierBadge'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { PackageOpen, Upload, Plus } from 'lucide-react'
import { isFeatureEnabled } from '@/lib/featureFlags'

interface Props {
  products: Product[]
  onProductClick: (product: Product) => void
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  onImportProducts?: () => void
  onAddManually?: () => void
}

const ROW_HEIGHT = 56
const VIRTUAL_THRESHOLD = 100

export default function ProductsTable({
  products,
  onProductClick,
  hasActiveFilters = false,
  onClearFilters,
  onImportProducts,
  onAddManually
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const virtualEnabled = isFeatureEnabled('product_virtual_scrolling') && products.length > VIRTUAL_THRESHOLD

  if (products.length === 0) {
    if (hasActiveFilters && onClearFilters) {
      return (
        <div className="bg-card rounded-lg shadow">
          <EmptyStateV2
            icon={PackageOpen}
            iconBackgroundColor="gray"
            title="沒有符合條件的產品"
            description="嘗試調整您的搜尋條件或清除篩選器以查看更多結果"
            primaryAction={{
              label: '清除篩選器',
              onClick: onClearFilters,
            }}
            variant="compact"
          />
        </div>
      )
    }

    return (
      <div className="bg-card rounded-lg shadow">
        <EmptyStateV2
          icon={PackageOpen}
          iconBackgroundColor="blue"
          title="尚無產品"
          description="開始建立您的產品資料庫以啟用成分分析和品質追蹤"
          helpText="產品可以從 CSV 檔案匯入或手動新增。匯入後，它們會出現在這裡供審核和分析"
          primaryAction={onImportProducts ? {
            label: '匯入產品',
            onClick: onImportProducts,
            icon: Upload,
          } : undefined}
          secondaryAction={onAddManually ? {
            label: '手動新增',
            onClick: onAddManually,
            icon: Plus,
          } : undefined}
        />
      </div>
    )
  }

  if (virtualEnabled) {
    return (
      <VirtualizedTable
        products={products}
        onProductClick={onProductClick}
        containerRef={containerRef}
      />
    )
  }

  return <StaticTable products={products} onProductClick={onProductClick} />
}

function TableHeader() {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          產品名稱
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          品牌
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          條碼
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          Tier
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          來源數量
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          素食類型
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
          操作
        </th>
      </tr>
    </thead>
  )
}

function ProductRow({ product, onProductClick }: { product: Product; onProductClick: (p: Product) => void }) {
  return (
    <tr
      className="hover:bg-muted/50 cursor-pointer border-b border-border"
      onClick={() => onProductClick(product)}
    >
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-foreground">
          {product.product_name}
        </div>
        {product.is_golden && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
            Golden Record
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {product.brand || '-'}
      </td>
      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
        {product.barcode || '-'}
      </td>
      <td className="px-6 py-4">
        <TierBadge tier={product.tier} />
      </td>
      <td className="px-6 py-4 text-sm text-foreground">
        {product.source_count} 個來源
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {product.vegan_type || '-'}
      </td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onProductClick(product)
          }}
          className="text-primary hover:text-primary/80 font-medium"
        >
          查看詳情
        </button>
      </td>
    </tr>
  )
}

function StaticTable({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <TableHeader />
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onProductClick={onProductClick} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VirtualizedTable({
  products,
  onProductClick,
  containerRef,
}: {
  products: Product[]
  onProductClick: (p: Product) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <TableHeader />
      </table>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight: '70vh' }}
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          <table className="min-w-full">
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const product = products[virtualRow.index]
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/50 cursor-pointer border-b border-border"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onProductClick(product)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {product.product_name}
                      </div>
                      {product.is_golden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Golden Record
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.brand || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {product.barcode || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <TierBadge tier={product.tier} />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {product.source_count} 個來源
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.vegan_type || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onProductClick(product)
                        }}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        查看詳情
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
