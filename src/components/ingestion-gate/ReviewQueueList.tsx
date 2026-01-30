'use client'

import { useState, useMemo, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ReviewQueueItem } from '@/types/ingestionGate'

interface ReviewQueueListProps {
  items: ReviewQueueItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  sortBy?: 'priority' | 'no_evidence' | 'block_count'
  filters?: {
    onlyBlock?: boolean
    missingEvidence?: boolean
    hasOneClickFix?: boolean
    allergenRelated?: boolean
  }
  onFiltersChange?: (filters: {
    onlyBlock?: boolean
    missingEvidence?: boolean
    hasOneClickFix?: boolean
    allergenRelated?: boolean
  }) => void
  selectedItems?: string[]
  onToggleSelect?: (id: string) => void
}

export function ReviewQueueList({
  items,
  selectedId,
  onSelect,
  sortBy = 'priority',
  filters = {},
  onFiltersChange,
  selectedItems = [],
  onToggleSelect,
}: ReviewQueueListProps) {
  const [localSortBy, setLocalSortBy] = useState(sortBy)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalSortBy(sortBy)
  }, [sortBy])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // 排序邏輯
  const sortedItems = useMemo(() => {
    const sorted = [...items]
    
    switch (localSortBy) {
      case 'priority':
        sorted.sort((a, b) => a.priority - b.priority)
        break
      case 'no_evidence':
        sorted.sort((a, b) => 
          (b.ui_payload.counts?.no_evidence_fields || b.ui_payload.missing_evidence_count || 0) -
          (a.ui_payload.counts?.no_evidence_fields || a.ui_payload.missing_evidence_count || 0)
        )
        break
      case 'block_count':
        sorted.sort((a, b) => 
          (b.ui_payload.counts?.block_findings || 0) -
          (a.ui_payload.counts?.block_findings || 0)
        )
        break
    }
    
    return sorted
  }, [items, localSortBy])

  // 篩選邏輯
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (localFilters.onlyBlock && item.ui_payload.gate_decision !== 'BLOCK') return false
      if (localFilters.missingEvidence && (item.ui_payload.counts?.no_evidence_fields || item.ui_payload.missing_evidence_count || 0) === 0) return false
      if (localFilters.hasOneClickFix && (item.ui_payload.counts?.one_click_fix_count || item.ui_payload.one_click_fix_count || 0) === 0) return false
      if (localFilters.allergenRelated && !item.reason_codes.some(code => code.includes('ALLERGEN'))) return false
      return true
    })
  }, [sortedItems, localFilters])

  const toggleFilter = (filterKey: keyof typeof localFilters) => {
    const newFilters = {
      ...localFilters,
      [filterKey]: !localFilters[filterKey],
    }
    setLocalFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const getDecisionBadgeVariant = (decision: string) => {
    if (decision === 'BLOCK') return 'destructive'
    if (decision === 'WARN_ALLOW') return 'default'
    return 'secondary'
  }

  return (
    <Card className="p-4">
      <div className="mb-4 space-y-3">
        <h2 className="text-lg font-semibold">審核佇列</h2>
        
        {/* 排序選項 */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={localSortBy === 'priority' ? 'default' : 'outline'}
            onClick={() => setLocalSortBy('priority')}
          >
            優先級
          </Button>
          <Button
            size="sm"
            variant={localSortBy === 'no_evidence' ? 'default' : 'outline'}
            onClick={() => setLocalSortBy('no_evidence')}
          >
            缺證據
          </Button>
          <Button
            size="sm"
            variant={localSortBy === 'block_count' ? 'default' : 'outline'}
            onClick={() => setLocalSortBy('block_count')}
          >
            BLOCK 數
          </Button>
        </div>

        {/* 快速篩選 */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={localFilters.onlyBlock ? 'default' : 'outline'}
            onClick={() => toggleFilter('onlyBlock')}
          >
            僅 BLOCK
          </Button>
          <Button
            size="sm"
            variant={localFilters.missingEvidence ? 'default' : 'outline'}
            onClick={() => toggleFilter('missingEvidence')}
          >
            缺證據
          </Button>
          <Button
            size="sm"
            variant={localFilters.hasOneClickFix ? 'default' : 'outline'}
            onClick={() => toggleFilter('hasOneClickFix')}
          >
            可修正
          </Button>
          <Button
            size="sm"
            variant={localFilters.allergenRelated ? 'default' : 'outline'}
            onClick={() => toggleFilter('allergenRelated')}
          >
            過敏原
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredItems.map((item) => {
          const counts = item.ui_payload.counts || {
            block_findings: 0,
            warn_findings: 0,
            no_evidence_fields: item.ui_payload.missing_evidence_count || 0,
            ambiguous_fields: 0,
            one_click_fix_count: item.ui_payload.one_click_fix_count || 0,
          }
          
          const displayReasonCodes = item.reason_codes.slice(0, 2)
          const remainingCodes = item.reason_codes.length - 2

          return (
            <div
              key={item.id}
              className={`p-3 border rounded-lg transition-colors ${
                selectedId === item.id ? 'bg-muted border-primary' : ''
              }`}
            >
              {/* 選擇框（如果啟用批次操作） */}
              {onToggleSelect && (
                <div className="mb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              <div onClick={() => onSelect(item.id)} className="cursor-pointer">
              {/* Header: Decision + Priority + Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getDecisionBadgeVariant(item.ui_payload.gate_decision)}>
                    {item.ui_payload.gate_decision}
                  </Badge>
                  <Badge variant={item.priority <= 2 ? 'destructive' : 'secondary'}>
                    P{item.priority}
                  </Badge>
                </div>
                <Badge variant={item.status === 'OPEN' ? 'default' : 'outline'}>
                  {item.status}
                </Badge>
              </div>

              {/* Counts */}
              <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                {counts.block_findings > 0 && (
                  <span className="text-destructive">BLOCK: {counts.block_findings}</span>
                )}
                {counts.warn_findings > 0 && (
                  <span>WARN: {counts.warn_findings}</span>
                )}
                {counts.no_evidence_fields > 0 && (
                  <span className="text-warning">缺證據: {counts.no_evidence_fields}</span>
                )}
                {counts.one_click_fix_count > 0 && (
                  <span className="text-primary">可修正: {counts.one_click_fix_count}</span>
                )}
              </div>

              {/* Reason Codes */}
              <div className="text-xs text-muted-foreground">
                {displayReasonCodes.join(', ')}
                {remainingCodes > 0 && ` +${remainingCodes}`}
              </div>

              {/* Scan ID */}
              <div className="text-xs text-muted-foreground mt-1">
                Scan: {item.scan_id.slice(0, 8)}...
              </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

