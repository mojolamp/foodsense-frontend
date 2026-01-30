'use client'

import { useState } from 'react'
import { Evidence } from '@/types/ingestionGate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EvidencePreviewEnhancedProps {
  evidences: Evidence[]
  fieldPath: string
  onCropClick?: (evidence: Evidence) => void
}

export function EvidencePreviewEnhanced({
  evidences,
  fieldPath,
  onCropClick,
}: EvidencePreviewEnhancedProps) {
  const [open, setOpen] = useState(false)
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState(0)

  if (!evidences || evidences.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">無證據</div>
    )
  }

  const currentEvidence = evidences[selectedEvidenceIndex]
  const sourceTypeLabels = {
    OCR_SPAN: 'OCR 文字',
    IMAGE_ROI: '圖像區域',
    MANUAL: '人工修正',
  }

  return (
    <>
      <div className="space-y-2">
        {/* 證據摘要列表 */}
        <div className="flex items-center gap-2 flex-wrap">
          {evidences.map((ev, idx) => (
            <button
              key={ev.evidence_id}
              onClick={() => {
                setSelectedEvidenceIndex(idx)
                setOpen(true)
              }}
              className={`text-xs px-2 py-1 rounded border hover:bg-muted ${
                idx === selectedEvidenceIndex ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {ev.source_type === 'OCR_SPAN' ? 'OCR' : 'ROI'} {idx + 1}
              {ev.ocr_confidence !== undefined && (
                <span className="ml-1">({(ev.ocr_confidence * 100).toFixed(0)}%)</span>
              )}
            </button>
          ))}
        </div>

        {/* 當前證據預覽 */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={currentEvidence.source_type === 'OCR_SPAN' ? 'default' : 'secondary'}>
              {sourceTypeLabels[currentEvidence.source_type]}
            </Badge>
            {currentEvidence.ocr_confidence !== undefined && (
              <span className="text-xs text-muted-foreground">
                信心度: {(currentEvidence.ocr_confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="text-sm mb-2">
            <div className="font-medium mb-1">文字內容:</div>
            <div className="bg-muted p-2 rounded">{currentEvidence.text}</div>
          </div>

          {currentEvidence.bbox && (
            <div className="text-xs text-muted-foreground mb-2">
              位置: [{currentEvidence.bbox.join(', ')}]
            </div>
          )}

          {onCropClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCropClick(currentEvidence)}
              className="w-full"
            >
              查看圖像區域
            </Button>
          )}
        </div>
      </div>

      {/* 詳細 Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>證據詳情 - {fieldPath}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 證據切換器 */}
            {evidences.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {evidences.map((ev, idx) => (
                  <button
                    key={ev.evidence_id}
                    onClick={() => setSelectedEvidenceIndex(idx)}
                    className={`px-3 py-2 rounded border whitespace-nowrap ${
                      idx === selectedEvidenceIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    證據 {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* 當前證據詳情 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={currentEvidence.source_type === 'OCR_SPAN' ? 'default' : 'secondary'}>
                  {sourceTypeLabels[currentEvidence.source_type]}
                </Badge>
                {currentEvidence.ocr_confidence !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    信心度: {(currentEvidence.ocr_confidence * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-1">文字內容:</div>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  {currentEvidence.text}
                </div>
              </div>

              {currentEvidence.bbox && (
                <div>
                  <div className="text-sm font-medium mb-1">邊界框:</div>
                  <div className="text-sm text-muted-foreground">
                    [{currentEvidence.bbox.join(', ')}]
                  </div>
                </div>
              )}

              {currentEvidence.span_id && (
                <div>
                  <div className="text-sm font-medium mb-1">Span ID:</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {currentEvidence.span_id}
                  </div>
                </div>
              )}

              {onCropClick && (
                <Button
                  onClick={() => {
                    onCropClick(currentEvidence)
                    setOpen(false)
                  }}
                  className="w-full"
                >
                  查看圖像區域
                </Button>
              )}
            </div>

            {/* 導航按鈕 */}
            {evidences.length > 1 && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvidenceIndex(Math.max(0, selectedEvidenceIndex - 1))}
                  disabled={selectedEvidenceIndex === 0}
                >
                  上一個
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvidenceIndex(Math.min(evidences.length - 1, selectedEvidenceIndex + 1))}
                  disabled={selectedEvidenceIndex === evidences.length - 1}
                >
                  下一個
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}









