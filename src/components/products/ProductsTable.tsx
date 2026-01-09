'use client'

import { Product } from '@/types/product'
import TierBadge from './TierBadge'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { PackageOpen, Upload, Plus } from 'lucide-react'

interface Props {
  products: Product[]
  onProductClick: (product: Product) => void
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  onImportProducts?: () => void
  onAddManually?: () => void
}

export default function ProductsTable({
  products,
  onProductClick,
  hasActiveFilters = false,
  onClearFilters,
  onImportProducts,
  onAddManually
}: Props) {
  if (products.length === 0) {
    // Show different empty state based on whether filters are active
    if (hasActiveFilters && onClearFilters) {
      return (
        <div className="bg-white rounded-lg shadow">
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

    // No products at all (fresh database)
    return (
      <div className="bg-white rounded-lg shadow">
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              產品名稱
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              品牌
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              條碼
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              來源數量
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              素食類型
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {product.product_name}
                </div>
                {product.is_golden && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                    ⭐ Golden Record
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.brand || '-'}
              </td>
              <td className="px-6 py-4 text-sm font-mono text-gray-500">
                {product.barcode || '-'}
              </td>
              <td className="px-6 py-4">
                <TierBadge tier={product.tier} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {product.source_count} 個來源
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.vegan_type || '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onProductClick(product)
                  }}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  查看詳情
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


