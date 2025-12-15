'use client'

import { useGoldSamples } from '@/hooks/useReviewQueue'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { StarIcon } from '@heroicons/react/24/solid'

export default function GoldSamplesPage() {
  const { data: goldSamples, isLoading, error } = useGoldSamples()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">載入中...</div>
      </div>
    )
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
      <div className="flex items-center gap-x-3">
        <StarIcon className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">黃金樣本</h1>
          <p className="mt-2 text-gray-600">
            高品質訓練樣本: {goldSamples?.length || 0} 筆
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ground Truth ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                產品 ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                品質分數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                信心分數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                備註
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                建立時間
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {goldSamples && goldSamples.length > 0 ? (
              goldSamples.map((item) => (
                <tr key={item.gt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    <div className="flex items-center gap-x-2">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      {item.gt_id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {item.data_quality_score}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.confidence_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.review_notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: zhTW,
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  目前沒有黃金樣本
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
