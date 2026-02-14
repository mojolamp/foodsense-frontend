'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { useOCRReviewStats, useOCRReviewPending, useApproveOCRReview, useRejectOCRReview } from '@/hooks/useOCRReview'
import type { OCRReviewItem } from '@/types/ocrReview'

export default function OCRReviewPanel() {
  const [maxConfidence, setMaxConfidence] = useState(0.8)
  const { data: statsData, isLoading: statsLoading } = useOCRReviewStats()
  const { data: pendingData, isLoading: pendingLoading } = useOCRReviewPending({
    max_confidence: maxConfidence,
    limit: 20,
  })

  const approveReview = useApproveOCRReview()
  const rejectReview = useRejectOCRReview()

  const [correctedTexts, setCorrectedTexts] = useState<Record<string, string>>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  const stats = statsData?.stats
  const items = pendingData?.items || []

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: stats?.pending, color: 'text-orange-600' },
          { label: 'Approved', value: stats?.approved, color: 'text-green-600' },
          { label: 'Rejected', value: stats?.rejected, color: 'text-red-600' },
          { label: 'Avg Confidence', value: stats?.avg_confidence != null ? `${(stats.avg_confidence * 100).toFixed(0)}%` : undefined, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-xl font-bold ${color}`}>
              {statsLoading ? <div className="h-6 w-10 bg-muted rounded animate-pulse" /> : (value ?? 0)}
            </div>
          </Card>
        ))}
      </div>

      {/* Confidence Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Max confidence:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={maxConfidence}
          onChange={(e) => setMaxConfidence(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm font-medium">{(maxConfidence * 100).toFixed(0)}%</span>
      </div>

      {/* Review Items */}
      <Card>
        <div className="divide-y divide-border">
          {pendingLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <div className="text-lg font-medium text-muted-foreground">No Items to Review</div>
              <div className="text-sm text-muted-foreground/70">
                All low-confidence OCR results have been reviewed.
              </div>
            </div>
          ) : (
            items.map((item: OCRReviewItem) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(item.confidence * 100).toFixed(0)}%
                    </Badge>
                    {item.product_id && (
                      <span className="text-xs text-muted-foreground">Product: {item.product_id}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">OCR Text:</div>
                  <div className="text-sm font-mono whitespace-pre-wrap">{item.ocr_text}</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={correctedTexts[item.id] ?? item.ocr_text}
                    onChange={(e) => setCorrectedTexts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Corrected text..."
                    className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => approveReview.mutate({
                      reviewId: item.id,
                      req: {
                        corrected_text: correctedTexts[item.id] || undefined,
                        reviewer_id: 'admin',
                      },
                    })}
                    disabled={approveReview.isPending}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rejectReasons[item.id] ?? ''}
                    onChange={(e) => setRejectReasons((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Rejection reason..."
                    className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectReview.mutate({
                      reviewId: item.id,
                      req: {
                        reason: rejectReasons[item.id] || 'Rejected',
                        reviewer_id: 'admin',
                      },
                    })}
                    disabled={rejectReview.isPending || !rejectReasons[item.id]?.trim()}
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
