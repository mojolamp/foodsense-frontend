'use client'

import { useQuery } from '@tanstack/react-query'
import { dictionaryAPI } from '@/lib/api/endpoints/dictionary'
import CorrectionForm from './CorrectionForm'

interface Props {
  token: string
}

export default function TokenDetailPanel({ token }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['tokenDetail', token],
    queryFn: () => dictionaryAPI.getTokenDetail(token),
    enabled: !!token,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">無法載入 Token 詳情</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-blue-600">
        <h2 className="text-lg font-semibold text-white">
          Token 詳情: {data.token}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">出現次數</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.occurrence_count}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">影響產品</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.affected_products}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            樣本產品 (前 10 個)
          </h3>
          <div className="space-y-2">
            {data.sample_products.slice(0, 10).map((product) => (
              <div
                key={product.product_id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <p className="font-medium text-gray-900 text-sm">
                  {product.product_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  上下文: ...{product.context}...
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            批次校正
          </h3>
          <CorrectionForm token={data.token} />
        </div>
      </div>
    </div>
  )
}


