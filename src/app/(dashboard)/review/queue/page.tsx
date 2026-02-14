'use client'

import { useEffect, useMemo, useState } from 'react'
import { useReviewQueue, useBatchReviewSubmit } from '@/hooks/useReviewQueue'
import { useReviewQueueShortcuts } from '@/hooks/useReviewQueueShortcuts'
import { useTableSelection } from '@/hooks/useTableSelection'
import ReviewQueueTable from '@/components/review/ReviewQueueTable'
import ReviewModal from '@/components/review/ReviewModal'
import BatchReviewModal from '@/components/review/BatchReviewModal'
import KeyboardShortcutsHelp from '@/components/shared/KeyboardShortcutsHelp'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import { getBooleanFeatureFlag, isFeatureEnabled } from '@/lib/featureFlags'
import { sortByPriority } from '@/lib/priorityCalculator'
import { toast } from 'react-hot-toast'
import type { OCRRecord } from '@/types/review'
import type { PrioritySortStrategy } from '@/types/review'
import type { BatchReviewTemplate } from '@/types/api'

export default function ReviewQueuePage() {
  const [selectedRecord, setSelectedRecord] = useState<OCRRecord | null>(null)
  const [batchRecords, setBatchRecords] = useState<OCRRecord[]>([])
  const [sortStrategy, setSortStrategy] = useState<PrioritySortStrategy | null>(null)
  const [pendingAdvanceIndex, setPendingAdvanceIndex] = useState<number | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [filters, setFilters] = useState<{
    validation_status?: string
    confidence_level?: string
  }>({})

  const { data: queue, isLoading, error } = useReviewQueue(filters)
  const batchSubmit = useBatchReviewSubmit()

  const shortcutsEnabled = getBooleanFeatureFlag('NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS', false)
  const enhancedHotkeysEnabled = isFeatureEnabled('review_queue_enhanced_hotkeys')
  const isAnyModalOpen = !!selectedRecord || batchRecords.length > 0 || showShortcutsHelp

  const displayData = useMemo(() => {
    const base = queue || []
    return sortStrategy ? sortByPriority(base, sortStrategy) : base
  }, [queue, sortStrategy])

  const {
    selectedIds,
    setSelectedIds,
    activeId,
    setActiveId,
    activeIndex,
    setActiveIndex,
    toggleSelectActive,
    toggleSelectAll,
    clearSelection,
  } = useTableSelection(displayData, { idKey: 'id' })

  // Auto-advance after review submit
  useEffect(() => {
    if (pendingAdvanceIndex === null) return
    if (selectedRecord) return
    if (displayData.length === 0) {
      setPendingAdvanceIndex(null)
      return
    }
    const idx = Math.min(pendingAdvanceIndex, displayData.length - 1)
    setActiveId(displayData[idx].id)
    setPendingAdvanceIndex(null)
  }, [pendingAdvanceIndex, displayData, selectedRecord, setActiveId])

  const openActiveRecord = () => {
    if (displayData.length === 0) return
    const record = displayData[activeIndex]
    if (!record) return
    setSelectedRecord(record)
  }

  const handleApprove = () => {
    if (displayData.length === 0) return
    const record = displayData[activeIndex]
    if (!record) return
    toast.success(`快速批准: ${record.product_id}`, { duration: 2000, icon: '✅' })
  }

  const handleReject = () => {
    if (displayData.length === 0) return
    const record = displayData[activeIndex]
    if (!record) return
    toast.error(`快速拒絕: ${record.product_id}`, { duration: 2000, icon: '❌' })
  }

  const handleInspect = () => {
    if (displayData.length === 0) return
    const record = displayData[activeIndex]
    if (!record) return
    setSelectedRecord(record)
  }

  const handleFlag = () => {
    if (displayData.length === 0) return
    const record = displayData[activeIndex]
    if (!record) return
    toast(`已標記為需人工審核: ${record.product_id}`, { duration: 2000, icon: '🚩' })
  }

  useReviewQueueShortcuts({
    enabled: shortcutsEnabled && !isAnyModalOpen,
    count: displayData.length,
    activeIndex,
    setActiveIndex,
    openReviewModal: openActiveRecord,
    toggleSelectActive,
    toggleSelectAll,
    onApprove: enhancedHotkeysEnabled ? handleApprove : undefined,
    onReject: enhancedHotkeysEnabled ? handleReject : undefined,
    onInspect: enhancedHotkeysEnabled ? handleInspect : undefined,
    onFlag: enhancedHotkeysEnabled ? handleFlag : undefined,
    onShowHelp: enhancedHotkeysEnabled ? () => setShowShortcutsHelp(true) : undefined,
  })

  const handleBatchReview = (records: OCRRecord[]) => {
    setBatchRecords(records)
    clearSelection()
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
        {shortcutsEnabled && (
          <div className="mt-3 flex items-center gap-2">
            <p className="text-xs text-muted-foreground" id="review-queue-shortcuts-hint">
              {enhancedHotkeysEnabled ? (
                <>
                  快捷鍵：<kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">j</kbd>/<kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">k</kbd> 導航、
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Shift+A</kbd> 批准、
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Shift+R</kbd> 拒絕、
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">i</kbd> 檢查、
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">?</kbd> 說明
                </>
              ) : (
                <>
                  快捷鍵：n/p（下一/上一）、r（開始審核）、x（選取/取消）、a（全選/取消）
                </>
              )}
            </p>
            {enhancedHotkeysEnabled && (
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="text-xs text-primary hover:text-primary/80 underline"
              >
                查看完整說明
              </button>
            )}
          </div>
        )}
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
      <div tabIndex={0} aria-describedby={shortcutsEnabled ? 'review-queue-shortcuts-hint' : undefined}>
        <ReviewQueueTable
          data={displayData}
          sortStrategy={sortStrategy}
          onSortStrategyChange={setSortStrategy}
          activeId={activeId}
          onActiveIdChange={setActiveId}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onReview={(record) => {
            setActiveId(record.id)
            setSelectedRecord(record)
          }}
          onBatchReview={handleBatchReview}
        />
      </div>

      {/* Review Modal */}
      {selectedRecord && (
        <ReviewModal
          record={selectedRecord}
          onSubmitted={() => {
            setPendingAdvanceIndex(activeIndex)
          }}
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

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  )
}
