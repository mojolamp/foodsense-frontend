'use client'

import { useEffect, useRef, useCallback, memo, useMemo } from 'react'
import type { OCRRecord, PrioritySortStrategy } from '@/types/review'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, CheckSquare, Square, ArrowUpDown } from 'lucide-react'
import { getPriorityColor, getPriorityLabel } from '@/lib/priorityCalculator'
import { cn } from '@/lib/utils'

interface Props {
  data: OCRRecord[]
  onReview: (record: OCRRecord) => void
  onBatchReview?: (records: OCRRecord[]) => void
  activeId: string | null
  onActiveIdChange: (id: string | null) => void
  selectedIds: Set<string>
  onSelectedIdsChange: (ids: Set<string>) => void
  sortStrategy: PrioritySortStrategy | null
  onSortStrategyChange: (strategy: PrioritySortStrategy | null) => void
}

export default function ReviewQueueTable({
  data,
  onReview,
  onBatchReview,
  activeId,
  onActiveIdChange,
  selectedIds,
  onSelectedIdsChange,
  sortStrategy,
  onSortStrategyChange,
}: Props) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())

  /**
   * Row ref callback - 處理元素掛載和卸載
   * 修復記憶體洩漏：當 el 為 null 時（元素卸載）從 Map 中移除
   */
  const setRowRef = useCallback((id: string, el: HTMLTableRowElement | null) => {
    if (el) {
      rowRefs.current.set(id, el)
    } else {
      rowRefs.current.delete(id)
    }
  }, [])

  // 當 data 變更時，清理不再存在的 row refs
  useEffect(() => {
    const currentIds = new Set(data.map(r => r.id))
    for (const id of rowRefs.current.keys()) {
      if (!currentIds.has(id)) {
        rowRefs.current.delete(id)
      }
    }
  }, [data])

  const setSelectedIds = (next: Set<string>) => onSelectedIdsChange(next)

  const activeRecordId = activeId
  const setActive = (id: string) => {
    onActiveIdChange(id)
    const row = rowRefs.current.get(id)
    row?.scrollIntoView?.({ block: 'nearest' })
  }

  // 當 activeId 由外部（快捷鍵）變更時，將 active row 捲動到可視範圍
  useEffect(() => {
    if (!activeRecordId) return
    const row = rowRefs.current.get(activeRecordId)
    row?.scrollIntoView?.({ block: 'nearest' })
  }, [activeRecordId])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    const ids = data.map(r => r.id)
    const isAllSelected = ids.length > 0 && ids.every(id => selectedIds.has(id))
    if (isAllSelected) {
      const next = new Set(selectedIds)
      for (const id of ids) next.delete(id)
      setSelectedIds(next)
      return
    }
    const next = new Set(selectedIds)
    for (const id of ids) next.add(id)
    setSelectedIds(next)
  }

  const getSelectedRecords = () => {
    return data.filter(r => selectedIds.has(r.id))
  }

  const handleBatchReview = () => {
    if (onBatchReview && selectedIds.size > 0) {
      onBatchReview(getSelectedRecords())
      setSelectedIds(new Set())
    }
  }
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg bg-gray-50/50">
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-muted-foreground text-sm">目前沒有待審核記錄</p>
      </div>
    )
  }

  // 使用 useCallback 優化回調函數
  const getStatusVariant = useCallback((status: string) => {
    switch (status) {
      case 'PASS': return 'success'
      case 'WARN': return 'warning'
      case 'FAIL': return 'failure'
      default: return 'secondary'
    }
  }, [])

  // 使用 useMemo 計算是否全選
  const isAllSelected = useMemo(() => {
    return data.length > 0 && data.every(r => selectedIds.has(r.id))
  }, [data, selectedIds])

  return (
    <div className="space-y-4">
      {/* 優先級排序選擇器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">優先級排序:</span>
          <select
            value={sortStrategy || ''}
            onChange={(e) => onSortStrategyChange((e.target.value as PrioritySortStrategy) || null)}
            className="px-3 py-1.5 text-sm border border-input bg-background rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">無排序 (預設)</option>
            <option value="quick_wins">快速處理 (簡單優先)</option>
            <option value="urgent_first">緊急優先 (等待時間)</option>
            <option value="quality_impact">品質優先 (影響度)</option>
            <option value="balanced">綜合平衡</option>
          </select>
        </div>
        {sortStrategy && (
          <Badge variant="outline" className="text-xs">
            已啟用智能排序
          </Badge>
        )}
      </div>

      {onBatchReview && selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckSquare className="w-4 h-4 text-primary" />
            已選擇 {selectedIds.size} 筆記錄
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
            >
              取消選擇
            </Button>
            <Button
              size="sm"
              onClick={handleBatchReview}
              className="bg-primary hover:bg-primary/90"
            >
              批次審核
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {onBatchReview && (
                <TableHead className="w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-full h-full hover:bg-accent rounded p-1"
                    aria-label={isAllSelected ? "取消全選" : "全選"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
              )}
              <TableHead>記錄 ID</TableHead>
              <TableHead>產品 ID</TableHead>
              {sortStrategy && <TableHead>優先級</TableHead>}
              <TableHead>驗證狀態</TableHead>
              <TableHead>信心度</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record, idx) => {
              const isSelected = selectedIds.has(record.id)
              const isActive = !!activeRecordId && record.id === activeRecordId
              return (
                <TableRow
                  key={record.id}
                  ref={(el) => setRowRef(record.id, el)}
                  data-testid={`review-queue-row-${idx}`}
                  data-record-id={record.id}
                  aria-selected={isActive}
                  className={cn(
                    'cursor-pointer',
                    isSelected && 'bg-primary/5',
                    isActive && 'ring-2 ring-primary/30 ring-inset'
                  )}
                  onClick={() => setActive(record.id)}
                >
                {onBatchReview && (
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActive(record.id)
                        toggleSelection(record.id)
                      }}
                      className="flex items-center justify-center w-full h-full hover:bg-accent rounded p-1"
                      aria-label={isSelected ? "取消選擇" : "選擇"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                )}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {record.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">
                  {record.product_id}
                </TableCell>
                {sortStrategy && record.priority_score !== undefined && (
                  <TableCell>
                    <Badge className={cn("font-mono text-xs", getPriorityColor(record.priority_score))}>
                      {getPriorityLabel(record.priority_score)} ({record.priority_score.toFixed(0)})
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant={getStatusVariant(record.logic_validation_status)}>
                    {record.logic_validation_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {record.confidence_level}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(record.created_at), {
                    addSuffix: true,
                    locale: zhTW,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActive(record.id)
                      onReview(record)
                    }}
                    className="text-primary hover:text-primary hover:bg-primary/5"
                  >
                    審核 <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
