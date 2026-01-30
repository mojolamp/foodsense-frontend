'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Finding } from '@/types/ingestionGate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface OneClickFixDraftProps {
  reviewId: string
  finding: Finding
  onApply: (patch: any[]) => void
  onUndo?: () => void
  isApplied?: boolean
}

export function OneClickFixDraft({
  reviewId,
  finding,
  onApply,
  onUndo,
  isApplied = false,
}: OneClickFixDraftProps) {
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    onApply(finding.suggested_patch)
    setOpen(false)
  }

  if (finding.actionability !== 'ONE_CLICK_FIX' || !finding.suggested_patch || finding.suggested_patch.length === 0) {
    return null
  }

  // 計算 patch 效果預覽
  const patchPreview = finding.suggested_patch.map((op: any) => {
    if (op.op === 'replace') {
      return {
        field: op.path,
        before: '當前值',
        after: op.value,
      }
    }
    return null
  }).filter(Boolean)

  return (
    <>
      {isApplied ? (
        <div className="flex items-center gap-2">
          <Badge variant="default">已套用修正</Badge>
          {onUndo && (
            <Button size="sm" variant="outline" onClick={onUndo}>
              撤銷
            </Button>
          )}
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} size="sm" variant="outline">
          一鍵修正
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認套用修正</DialogTitle>
            <DialogDescription>
              此操作將套用以下修正建議（可撤銷）：
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">規則: {finding.rule_id}</div>
              <div className="text-sm text-muted-foreground">{finding.message}</div>
            </div>

            {/* Patch 效果預覽 */}
            <div>
              <div className="text-sm font-medium mb-2">變更內容:</div>
              <div className="space-y-2">
                {patchPreview.map((preview: any, idx: number) => (
                  <div key={idx} className="bg-muted p-3 rounded text-sm">
                    <div className="font-medium">{preview.field}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-destructive line-through">{preview.before}</span>
                      <span>→</span>
                      <span className="text-primary font-semibold">{String(preview.after)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 原始 Patch JSON */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">查看原始 Patch</summary>
              <pre className="bg-muted p-3 rounded mt-2 overflow-auto">
                {JSON.stringify(finding.suggested_patch, null, 2)}
              </pre>
            </details>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleApply}>
              套用到草稿
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
