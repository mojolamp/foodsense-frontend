'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Finding } from '@/types/ingestionGate'
import { useApplyPatch } from '@/hooks/useIngestionGate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface OneClickFixProps {
  reviewId: string
  finding: Finding
}

export function OneClickFix({ reviewId, finding }: OneClickFixProps) {
  const [open, setOpen] = useState(false)
  const applyPatch = useApplyPatch()

  const handleApply = () => {
    applyPatch.mutate(
      {
        reviewId,
        findingId: finding.rule_id,
        patch: finding.suggested_patch,
      },
      {
        onSuccess: () => {
          setOpen(false)
        },
      }
    )
  }

  if (finding.actionability !== 'ONE_CLICK_FIX' || !finding.suggested_patch || finding.suggested_patch.length === 0) {
    return null
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        一鍵修正
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認套用修正</DialogTitle>
            <DialogDescription>
              此操作將套用以下修正建議：
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm font-medium">規則: {finding.rule_id}</div>
            <div className="text-sm text-muted-foreground">{finding.message}</div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">修正內容:</div>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                {JSON.stringify(finding.suggested_patch, null, 2)}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleApply} disabled={applyPatch.isPending}>
              {applyPatch.isPending ? '套用中...' : '確認套用'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

