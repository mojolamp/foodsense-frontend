'use client'

import { Evidence } from '@/types/ingestionGate'
import { Badge } from '@/components/ui/badge'

interface EvidencePreviewProps {
  evidence: Evidence
  onCropClick?: () => void
}

export function EvidencePreview({ evidence, onCropClick }: EvidencePreviewProps) {
  const sourceTypeLabels = {
    OCR_SPAN: 'OCR 文字',
    IMAGE_ROI: '圖像區域',
    MANUAL: '人工修正',
  }

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant={evidence.source_type === 'OCR_SPAN' ? 'default' : 'secondary'}>
          {sourceTypeLabels[evidence.source_type]}
        </Badge>
        {evidence.ocr_confidence !== undefined && (
          <span className="text-sm text-muted-foreground">
            信心度: {(evidence.ocr_confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>

      <div className="text-sm">
        <div className="font-medium mb-1">文字內容:</div>
        <div className="bg-muted p-2 rounded">{evidence.text}</div>
      </div>

      {evidence.bbox && (
        <div className="text-xs text-muted-foreground">
          位置: [{evidence.bbox.join(', ')}]
        </div>
      )}

      {onCropClick && (
        <button
          onClick={onCropClick}
          className="text-sm text-primary hover:underline"
        >
          查看圖像區域
        </button>
      )}
    </div>
  )
}









