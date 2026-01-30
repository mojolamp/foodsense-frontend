'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ReviewQueueItem } from '@/types/ingestionGate'
import { useBulkResolve, useBulkApplyFix } from '@/hooks/useIngestionGate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface BulkActionsProps {
  selectedItems: string[]
  items: ReviewQueueItem[]
  onSuccess?: () => void
}

export function BulkActions({ selectedItems, items, onSuccess }: BulkActionsProps) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'resolve' | 'apply_fix'>('resolve')
  const bulkResolve = useBulkResolve()
  const bulkApplyFix = useBulkApplyFix()

  if (selectedItems.length === 0) {
    return null
  }

  const selectedItemsData = items.filter((item) => selectedItems.includes(item.id))

  // 檢查是否可以批次套用 fix（必須是同一 rule_id）
  const canBulkApplyFix = () => {
    if (selectedItemsData.length === 0) return false
    
    // 找出所有有 ONE_CLICK_FIX 的 findings
    const fixableFindings = selectedItemsData
      .flatMap((item) => item.ui_payload.findings)
      .filter((f) => f.actionability === 'ONE_CLICK_FIX' && f.suggested_patch && f.suggested_patch.length > 0)
    
    if (fixableFindings.length === 0) return false
    
    // 檢查是否都是同一個 rule_id
    const ruleIds = new Set(fixableFindings.map((f) => f.rule_id))
    return ruleIds.size === 1
  }

  const handleBulkAction = async () => {
    try {
      if (action === 'resolve') {
        await bulkResolve.mutateAsync({
          reviewIds: selectedItems,
          status: 'RESOLVED',
        })
      } else {
        const fixableFindings = selectedItemsData
          .flatMap((item) => item.ui_payload.findings)
          .filter((f) => f.actionability === 'ONE_CLICK_FIX')
        
        if (fixableFindings.length > 0) {
          const ruleId = fixableFindings[0].rule_id
          const patch = fixableFindings[0].suggested_patch
          
          await bulkApplyFix.mutateAsync({
            reviewIds: selectedItems,
            ruleId,
            patch,
          })
        }
      }
      
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="default">
          已選擇 {selectedItems.length} 項
        </Badge>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          批次操作
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批次操作</DialogTitle>
            <DialogDescription>
              將對 {selectedItems.length} 個項目執行操作
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">選擇操作:</div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="resolve"
                    checked={action === 'resolve'}
                    onChange={(e) => setAction(e.target.value as any)}
                  />
                  <span>標記為已解決</span>
                </label>
                {canBulkApplyFix() && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="apply_fix"
                      checked={action === 'apply_fix'}
                      onChange={(e) => setAction(e.target.value as any)}
                    />
                    <span>批次套用修正（同一規則）</span>
                  </label>
                )}
              </div>
            </div>

            {action === 'apply_fix' && canBulkApplyFix() && (
              <div className="bg-muted p-3 rounded text-sm">
                <div className="font-medium mb-1">將套用規則:</div>
                <div className="text-muted-foreground">
                  {selectedItemsData[0].ui_payload.findings.find((f) => f.actionability === 'ONE_CLICK_FIX')?.rule_id}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={bulkResolve.isPending || bulkApplyFix.isPending}
            >
              {(bulkResolve.isPending || bulkApplyFix.isPending) ? '處理中...' : '確認執行'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}









