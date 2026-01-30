'use client'

import { useState, useMemo } from 'react'
import { useReviewQueue, useReviewDetail, useApplyPatch, useResolveReview } from '@/hooks/useIngestionGate'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReviewQueueList } from '@/components/ingestion-gate/ReviewQueueList'
import { OneClickFixDraft } from '@/components/ingestion-gate/OneClickFixDraft'
import { EvidencePreviewEnhanced } from '@/components/ingestion-gate/EvidencePreviewEnhanced'
import { RetryActionButton } from '@/components/ingestion-gate/RetryActionButton'
import { BulkActions } from '@/components/ingestion-gate/BulkActions'
import type { ReviewQueueItem, Finding, FieldState } from '@/types/ingestionGate'

type TabType = 'review' | 'conflict'

export default function IngestionGateReviewPage() {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('review')
  const [sortBy, setSortBy] = useState<'priority' | 'no_evidence' | 'block_count'>('priority')
  const [filters, setFilters] = useState({
    onlyBlock: false,
    missingEvidence: false,
    hasOneClickFix: false,
    allergenRelated: false,
  })
  const [appliedPatches, setAppliedPatches] = useState<Record<string, any[]>>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  const { data: queue, isLoading } = useReviewQueue({ limit: 100 })
  const { data: reviewDetail } = useReviewDetail(selectedReviewId || '')
  const applyPatch = useApplyPatch()
  const resolveReview = useResolveReview()

  // 根據 Tab 分流
  const filteredQueue = useMemo(() => {
    if (!queue) return []
    
    return queue.filter((item: ReviewQueueItem) => {
      if (activeTab === 'conflict') {
        return item.ui_payload.gate_decision === 'BLOCK'
      } else {
        return item.ui_payload.gate_decision === 'WARN_ALLOW' || item.ui_payload.gate_decision === 'PASS'
      }
    })
  }, [queue, activeTab])

  // 根據 Tab 決定預設排序
  const defaultSort = useMemo(() => {
    if (activeTab === 'conflict') {
      return 'no_evidence' as const
    } else {
      return 'priority' as const
    }
  }, [activeTab])

  const selectedReview = filteredQueue?.find((item: ReviewQueueItem) => item.id === selectedReviewId)

  const handleApplyPatch = (findingId: string, patch: any[]) => {
    if (!selectedReviewId) return
    
    // 本地套用到 draft
    setAppliedPatches((prev) => ({
      ...prev,
      [findingId]: patch,
    }))
  }

  const handleUndoPatch = (findingId: string) => {
    setAppliedPatches((prev) => {
      const newPatches = { ...prev }
      delete newPatches[findingId]
      return newPatches
    })
  }

  const handleSubmitAllPatches = async () => {
    if (!selectedReviewId) return

    // 提交所有已套用的 patches
    for (const [findingId, patch] of Object.entries(appliedPatches)) {
      try {
        await applyPatch.mutateAsync({
          reviewId: selectedReviewId,
          findingId,
          patch,
        })
      } catch (error) {
        console.error(`Failed to apply patch for ${findingId}:`, error)
      }
    }

    // 清空已套用的 patches
    setAppliedPatches({})
  }

  const handleResolve = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!selectedReviewId) return
    
    await resolveReview.mutateAsync({
      reviewId: selectedReviewId,
      resolution: { status },
    })
  }

  const scrollToField = (fieldPath: string) => {
    const element = document.getElementById(`field-${fieldPath.replace(/\./g, '-')}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 觸發 highlight 效果
      element.classList.add('ring-2', 'ring-primary')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary')
      }, 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">載入中...</div>
      </div>
    )
  }

  const hasAppliedPatches = Object.keys(appliedPatches).length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IngestionGate 審核工作台</h1>
        <p className="mt-2 text-muted-foreground">
          待審核項目: {filteredQueue?.length || 0} 筆
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab('review')
            setSelectedReviewId(null)
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'review'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Review ({filteredQueue?.filter((i: ReviewQueueItem) => i.ui_payload.gate_decision !== 'BLOCK').length || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab('conflict')
            setSelectedReviewId(null)
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'conflict'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Conflict ({filteredQueue?.filter((i: ReviewQueueItem) => i.ui_payload.gate_decision === 'BLOCK').length || 0})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <BulkActions
              selectedItems={selectedItems}
              items={filteredQueue || []}
              onSuccess={() => setSelectedItems([])}
            />
          )}
          
          <ReviewQueueList
            items={filteredQueue || []}
            selectedId={selectedReviewId}
            onSelect={setSelectedReviewId}
            sortBy={sortBy}
            filters={filters}
            onFiltersChange={setFilters}
            selectedItems={selectedItems}
            onToggleSelect={(id) => {
              setSelectedItems((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }}
          />
        </div>

        {/* Right: Review Detail */}
        <div className="lg:col-span-2">
          {selectedReview ? (
            <div className="space-y-6">
              {/* Summary Header */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">摘要</h2>
                  {hasAppliedPatches && (
                    <Badge variant="default">
                      已套用修正 {Object.keys(appliedPatches).length} 個
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Gate 決策</div>
                    <Badge variant={selectedReview.ui_payload.gate_decision === 'PASS' ? 'default' : 'destructive'}>
                      {selectedReview.ui_payload.gate_decision}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">可一鍵修正</div>
                    <div className="text-lg font-semibold">
                      {selectedReview.ui_payload.counts?.one_click_fix_count || selectedReview.ui_payload.one_click_fix_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">缺證據欄位</div>
                    <div className="text-lg font-semibold">
                      {selectedReview.ui_payload.counts?.no_evidence_fields || selectedReview.ui_payload.missing_evidence_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">驗證結果</div>
                    <div className="text-lg font-semibold">{selectedReview.ui_payload.findings.length}</div>
                  </div>
                </div>
              </Card>

              {/* Field States Panel */}
              {selectedReview.ui_payload.field_states && selectedReview.ui_payload.field_states.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">欄位狀態</h2>
                  <div className="space-y-4">
                    {selectedReview.ui_payload.field_states.map((field: FieldState) => (
                      <div
                        key={field.path}
                        id={`field-${field.path.replace(/\./g, '-')}`}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{field.label || field.path}</div>
                            <div className="text-xs text-muted-foreground">{field.path}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                field.status === 'EXACT'
                                  ? 'default'
                                  : field.status === 'AMBIGUOUS'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {field.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(field.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <EvidencePreviewEnhanced
                          evidences={field.evidence}
                          fieldPath={field.path}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Field Quality Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">欄位品質</h2>
                <div className="space-y-3">
                  {selectedReview.ui_payload.field_quality.missing_required_fields.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-destructive mb-1">缺失必填欄位</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedReview.ui_payload.field_quality.missing_required_fields.join(', ')}
                      </div>
                    </div>
                  )}
                  {selectedReview.ui_payload.field_quality.low_confidence_fields.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-warning mb-1">低信心度欄位</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedReview.ui_payload.field_quality.low_confidence_fields.join(', ')}
                      </div>
                    </div>
                  )}
                  {selectedReview.ui_payload.field_quality.no_evidence_fields.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-warning mb-1">無證據欄位</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedReview.ui_payload.field_quality.no_evidence_fields.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Findings Panel */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">驗證結果</h2>
                <div className="space-y-4">
                  {selectedReview.ui_payload.findings.map((finding: Finding, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              finding.severity === 'BLOCK'
                                ? 'destructive'
                                : finding.severity === 'WARN'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {finding.severity}
                          </Badge>
                          <span className="text-sm font-medium">{finding.rule_id}</span>
                        </div>
                        <div className="flex gap-2">
                          <OneClickFixDraft
                            reviewId={selectedReview.id}
                            finding={finding}
                            onApply={(patch) => handleApplyPatch(finding.rule_id, patch)}
                            onUndo={() => handleUndoPatch(finding.rule_id)}
                            isApplied={!!appliedPatches[finding.rule_id]}
                          />
                          <RetryActionButton
                            scanId={selectedReview.scan_id}
                            finding={finding}
                            retryCount={0}
                            maxRetry={1}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{finding.message}</div>
                      {finding.field_paths.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {finding.field_paths.map((path) => (
                            <button
                              key={path}
                              onClick={() => scrollToField(path)}
                              className="text-xs text-primary hover:underline"
                            >
                              {path}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {hasAppliedPatches && (
                      <Button onClick={handleSubmitAllPatches} disabled={applyPatch.isPending}>
                        {applyPatch.isPending ? '提交中...' : '提交所有修正'}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleResolve('DISMISSED')}
                      disabled={resolveReview.isPending}
                    >
                      跳過
                    </Button>
                    <Button
                      onClick={() => handleResolve('RESOLVED')}
                      disabled={resolveReview.isPending}
                    >
                      {resolveReview.isPending ? '處理中...' : '標記為已解決'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                請從左側選擇一個審核項目
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
