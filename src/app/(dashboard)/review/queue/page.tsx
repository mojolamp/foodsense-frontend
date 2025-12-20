'use client'

import { useState } from 'react'
import { useReviewQueue, useBatchReviewSubmit } from '@/hooks/useReviewQueue'
import ReviewQueueTable from '@/components/review/ReviewQueueTable'
import ReviewModal from '@/components/review/ReviewModal'
import BatchReviewModal from '@/components/review/BatchReviewModal'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import type { OCRRecord } from '@/types/review'
import type { BatchReviewTemplate } from '@/types/api'

export default function ReviewQueuePage() {
  const [selectedRecord, setSelectedRecord] = useState<OCRRecord | null>(null)
  const [batchRecords, setBatchRecords] = useState<OCRRecord[]>([])
  const [filters, setFilters] = useState<{
    validation_status?: string
    confidence_level?: string
  }>({})

  const { data: queue, isLoading, error } = useReviewQueue(filters)
  const batchSubmit = useBatchReviewSubmit()

  const handleBatchReview = (records: OCRRecord[]) => {
    setBatchRecords(records)
  }

  const handleBatchSubmit = async (template: BatchReviewTemplate) => {
    await batchSubmit.mutateAsync({
      records: batchRecords,
      template
    })
    setBatchRecords([])
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-48 bg-muted animate-pulse rounded"></div>
        </div>
        <TableSkeleton rows={10} />
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">審核佇列</h1>
        <p className="mt-2 text-muted-foreground">
          待審核記錄: {queue?.length || 0} 筆
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              驗證狀態
            </label>
            <select
              value={filters.validation_status || ''}
              onChange={(e) => setFilters({
                ...filters,
                validation_status: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">全部</option>
              <option value="FAIL">FAIL</option>
              <option value="WARN">WARN</option>
              <option value="PASS">PASS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              信心水平
            </label>
            <select
              value={filters.confidence_level || ''}
              onChange={(e) => setFilters({
                ...filters,
                confidence_level: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
        onBatchReview={handleBatchReview}
      />

      {/* Review Modal */}
      {selectedRecord && (
        <ReviewModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Batch Review Modal */}
      {batchRecords.length > 0 && (
        <BatchReviewModal
          records={batchRecords}
          onClose={() => setBatchRecords([])}
          onSubmit={handleBatchSubmit}
          isSubmitting={batchSubmit.isPending}
        />
      )}
    </div>
  )
}
