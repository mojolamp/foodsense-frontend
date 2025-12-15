'use client'

import type { OCRRecord } from '@/types/review'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface Props {
  data: OCRRecord[]
  onReview: (record: OCRRecord) => void
}

const statusColors: Record<string, string> = {
  FAIL: 'bg-red-100 text-red-800',
  WARN: 'bg-yellow-100 text-yellow-800',
  PASS: 'bg-green-100 text-green-800',
}

const confidenceColors: Record<string, string> = {
  HIGH: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-purple-100 text-purple-800',
  LOW: 'bg-gray-100 text-gray-800',
}

export default function ReviewQueueTable({ data, onReview }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">目前沒有待審核記錄</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              記錄 ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              產品 ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              驗證狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              信心水平
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              建立時間
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                {record.id.slice(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.product_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[record.logic_validation_status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {record.logic_validation_status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  confidenceColors[record.confidence_level] || 'bg-gray-100 text-gray-800'
                }`}>
                  {record.confidence_level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(record.created_at), {
                  addSuffix: true,
                  locale: zhTW,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onReview(record)}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  開始審核
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
