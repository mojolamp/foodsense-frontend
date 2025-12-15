'use client'

import { useState } from 'react'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import ReviewQueueTable from '@/components/review/ReviewQueueTable'
import ReviewModal from '@/components/review/ReviewModal'
import type { OCRRecord } from '@/types/review'

export default function ReviewQueuePage() {
  const [selectedRecord, setSelectedRecord] = useState<OCRRecord | null>(null)
  const [filters, setFilters] = useState<{
    validation_status?: string
    confidence_level?: string
  }>({})

  const { data: queue, isLoading, error } = useReviewQueue(filters)

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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">審核佇列</h1>
        <p className="mt-2 text-gray-600">
          待審核記錄: {queue?.length || 0} 筆
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              驗證狀態
            </label>
            <select
              value={filters.validation_status || ''}
              onChange={(e) => setFilters({
                ...filters,
                validation_status: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">全部</option>
              <option value="FAIL">FAIL</option>
              <option value="WARN">WARN</option>
              <option value="PASS">PASS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              信心水平
            </label>
            <select
              value={filters.confidence_level || ''}
              onChange={(e) => setFilters({
                ...filters,
                confidence_level: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">全部</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <ReviewQueueTable
        data={queue || []}
        onReview={(record) => setSelectedRecord(record)}
      />

      {/* Review Modal */}
      {selectedRecord && (
        <ReviewModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  )
}
