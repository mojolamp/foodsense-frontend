'use client'

import { Product } from '@/types/product'
import TierBadge from './TierBadge'

interface Props {
  products: Product[]
  onProductClick: (product: Product) => void
}

export default function ProductsTable({ products, onProductClick }: Props) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">沒有找到產品</p>
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


