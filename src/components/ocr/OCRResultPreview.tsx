'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Download, Send, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react'
import type { OCRSmartNormalizeResponse } from '@/types/ocr'

interface OCRResultPreviewProps {
  result: OCRSmartNormalizeResponse
  onSubmitToPipeline: () => void
  onRescan: () => void
  isSubmitting?: boolean
}

export default function OCRResultPreview({
  result,
  onSubmitToPipeline,
  onRescan,
  isSubmitting,
}: OCRResultPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ingredients']))
  const normalized = result.normalized as Record<string, unknown>

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ocr-${result.image_id || 'result'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Header / Route Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={result.success ? 'success' : 'failure'}>
            {result.success ? 'Success' : 'Failed'}
          </Badge>
          <span className="text-sm text-muted-foreground">Route: {result.route}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{result.image_id}</span>
      </div>

      {/* Route Reasons */}
      {result.route_reasons.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {result.route_reasons.join(' / ')}
        </div>
      )}

      {/* Normalized Data Sections */}
      <div className="rounded-lg border border-border divide-y divide-border">
        {Object.entries(normalized).map(([key, value]) => {
          if (value == null || (typeof value === 'object' && Object.keys(value as object).length === 0)) return null
          const isExpanded = expandedSections.has(key)
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
          const isSimple = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

          return (
            <div key={key} className="px-4 py-3">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => !isSimple && toggleSection(key)}
              >
                <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                {isSimple ? (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">{String(value)}</span>
                ) : (
                  isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {!isSimple && isExpanded && (
                <pre className="mt-2 p-3 bg-muted/50 rounded-md text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {displayValue}
                </pre>
              )}
            </div>
          )
        })}
      </div>

      {/* Attempts Summary */}
      {result.attempts && Object.keys(result.attempts).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Attempts:</span>{' '}
          {Object.keys(result.attempts).join(', ')}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          onClick={onSubmitToPipeline}
          disabled={!result.success || isSubmitting}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit to Pipeline'}
        </Button>
        <Button variant="outline" onClick={onRescan}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Rescan
        </Button>
        <Button variant="ghost" size="icon" onClick={downloadJSON}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
