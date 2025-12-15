'use client'

import { useReviewHistory } from '@/hooks/useReviewQueue'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function ReviewHistoryPage() {
  const { data: history, isLoading, error } = useReviewHistory()

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">審核歷史</h1>
        <p className="mt-2 text-gray-600">
          已審核記錄: {history?.length || 0} 筆
        </p>
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
                黃金樣本
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                建立時間
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history && history.length > 0 ? (
              history.map((item) => (
                <tr key={item.gt_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {item.gt_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.data_quality_score}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.confidence_score.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.is_gold ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        是
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        否
                      </span>
                    )}
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
                  目前沒有審核歷史記錄
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
