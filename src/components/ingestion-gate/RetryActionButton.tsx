'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Finding } from '@/types/ingestionGate'
import { useRetryGate } from '@/hooks/useIngestionGate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RetryActionButtonProps {
  scanId: string
  finding: Finding
  retryCount?: number
  maxRetry?: number
}

/**
 * P0-3: 功能開關
 * 後端 Retry Gate 尚未實作，暫時關閉此功能
 * 待 v0.7.0 後端實作完成後改為 true
 */
const RETRY_FEATURE_ENABLED = false

export function RetryActionButton({
  scanId,
  finding,
  retryCount = 0,
  maxRetry = 1,
}: RetryActionButtonProps) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'ROI_REOCR' | 'ALT_OCR_PROFILE'>('ROI_REOCR')
  const retryGate = useRetryGate()

  if (finding.actionability !== 'NEED_RESCAN') {
    return null
  }

  const canRetry = retryCount < maxRetry

  const handleRetry = async () => {
    if (!RETRY_FEATURE_ENABLED) return

    try {
      await retryGate.mutateAsync({
        scanId,
        action,
        targetFields: finding.field_paths,
      })
      setOpen(false)
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  // 按鈕是否可點擊
  const isDisabled = !RETRY_FEATURE_ENABLED || !canRetry

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                onClick={() => RETRY_FEATURE_ENABLED && setOpen(true)}
                size="sm"
                variant="outline"
                disabled={isDisabled}
              >
                重掃
                {!RETRY_FEATURE_ENABLED && (
                  <Badge variant="secondary" className="ml-2">
                    開發中
                  </Badge>
                )}
                {RETRY_FEATURE_ENABLED && !canRetry && (
                  <Badge variant="secondary" className="ml-2">
                    {retryCount}/{maxRetry}
                  </Badge>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {RETRY_FEATURE_ENABLED
                ? '重新執行 OCR 和 Gate 驗證'
                : '此功能尚在開發中，預計 v0.7.0 推出'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重新掃描</DialogTitle>
            <DialogDescription>
              此操作將重新執行 OCR 和 Gate 驗證
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">建議動作:</div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="ROI_REOCR"
                    checked={action === 'ROI_REOCR'}
                    onChange={(e) => setAction(e.target.value as any)}
                  />
                  <span>ROI 重新 OCR（針對特定區域）</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="ALT_OCR_PROFILE"
                    checked={action === 'ALT_OCR_PROFILE'}
                    onChange={(e) => setAction(e.target.value as any)}
                  />
                  <span>使用不同 OCR 配置</span>
                </label>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">規則: {finding.rule_id}</div>
              <div className="text-sm text-muted-foreground">{finding.message}</div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">目標欄位:</div>
              <div className="text-sm text-muted-foreground">
                {finding.field_paths.join(', ')}
              </div>
            </div>

            {!canRetry && (
              <div className="bg-warning/10 border border-warning rounded p-2 text-sm text-warning">
                已達最大重試次數 ({retryCount}/{maxRetry})
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleRetry}
              disabled={!canRetry || retryGate.isPending}
            >
              {retryGate.isPending ? '處理中...' : '確認重掃'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}









