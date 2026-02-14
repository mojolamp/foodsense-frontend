'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import {
  useVariantMatch,
  useVariantBatchMatch,
  useVariantPendingReviews,
  useApproveVariant,
  useRejectVariant,
  useVariantStats,
} from '@/hooks/useKnowledgeGraph'
import type { VariantMatchResponse } from '@/types/knowledgeGraph'

const LAYER_LABELS: Record<number, string> = {
  1: 'Exact',
  2: 'Fuzzy',
  3: 'Semantic',
  4: 'Manual',
}

export default function VariantMatchPanel() {
  const [singleText, setSingleText] = useState('')
  const [batchText, setBatchText] = useState('')
  const [matchResult, setMatchResult] = useState<VariantMatchResponse | null>(null)
  const [approveCanonical, setApproveCanonical] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const variantMatch = useVariantMatch()
  const batchMatch = useVariantBatchMatch()
  const { data: pendingData, isLoading: pendingLoading } = useVariantPendingReviews({ limit: 20 })
  const { data: stats, isLoading: statsLoading } = useVariantStats()
  const approveVariant = useApproveVariant()
  const rejectVariant = useRejectVariant()

  const handleSingleMatch = () => {
    if (!singleText.trim()) return
    variantMatch.mutate(
      { variant_text: singleText },
      { onSuccess: (data) => setMatchResult(data) }
    )
  }

  const handleBatchMatch = () => {
    const texts = batchText.split('\n').map((t) => t.trim()).filter(Boolean)
    if (texts.length === 0) return
    batchMatch.mutate({ variant_texts: texts })
  }

  const reviews = pendingData?.reviews || []

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Layer 1 (Exact)', value: stats?.layer1_exact },
          { label: 'Layer 2 (Fuzzy)', value: stats?.layer2_fuzzy },
          { label: 'Layer 3 (Semantic)', value: stats?.layer3_semantic },
          { label: 'Layer 4 (Manual)', value: stats?.layer4_manual },
          { label: 'Pending Reviews', value: stats?.pending_reviews, color: 'text-orange-600' },
          { label: 'Avg Confidence', value: stats?.avg_confidence != null ? `${(stats.avg_confidence * 100).toFixed(0)}%` : undefined },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-lg font-bold ${color || ''}`}>
              {statsLoading ? <div className="h-5 w-10 bg-muted rounded animate-pulse" /> : (value?.toLocaleString() ?? '—')}
            </div>
          </Card>
        ))}
      </div>

      {/* Match Input */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Variant Matching</h3>

        {/* Single Match */}
        <div className="flex gap-2">
          <input
            type="text"
            value={singleText}
            onChange={(e) => setSingleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSingleMatch()}
            placeholder="Enter variant text..."
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
          />
          <Button size="sm" onClick={handleSingleMatch} disabled={variantMatch.isPending}>
            {variantMatch.isPending ? 'Matching...' : 'Match'}
          </Button>
        </div>

        {/* Single Match Result */}
        {matchResult && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{matchResult.canonical_name || 'No match'}</span>
              <Badge variant="secondary" className="text-xs">
                {matchResult.layer != null ? LAYER_LABELS[matchResult.layer] || `L${matchResult.layer}` : '—'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(matchResult.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            {matchResult.message && (
              <div className="text-xs text-muted-foreground">{matchResult.message}</div>
            )}
          </div>
        )}

        {/* Batch Match */}
        <div>
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="Enter multiple variants (one per line)..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-y"
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={handleBatchMatch}
            disabled={batchMatch.isPending}
          >
            {batchMatch.isPending ? 'Matching...' : 'Batch Match'}
          </Button>
        </div>

        {/* Batch Result */}
        {batchMatch.data && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <div className="flex gap-4 text-xs">
              <span>Total: {batchMatch.data.total}</span>
              <span className="text-green-600">Matched: {batchMatch.data.matched}</span>
              <span className="text-orange-600">Pending: {batchMatch.data.pending_review}</span>
              {batchMatch.data.errors > 0 && (
                <span className="text-red-600">Errors: {batchMatch.data.errors}</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Pending Reviews */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">
          Pending Reviews ({pendingData?.pending ?? 0})
          {pendingData && pendingData.high_priority > 0 && (
            <Badge variant="destructive" className="text-xs ml-2">{pendingData.high_priority} high priority</Badge>
          )}
        </h3>
        {pendingLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No pending reviews</div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{review.variant_text}</span>
                    {review.suggested_canonical && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Suggested: {review.suggested_canonical}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      P{review.priority} · {(review.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Canonical name..."
                    className="flex-1 px-2 py-1 border border-border rounded text-xs bg-background"
                    defaultValue={review.suggested_canonical || ''}
                    onChange={(e) => setApproveCanonical(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => approveVariant.mutate({
                      reviewId: review.id,
                      req: { canonical_name: approveCanonical || review.suggested_canonical || '', reviewer_id: 'admin' },
                    })}
                    disabled={approveVariant.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectVariant.mutate({
                      reviewId: review.id,
                      req: { reviewer_id: 'admin', reason: rejectReason || 'Not applicable' },
                    })}
                    disabled={rejectVariant.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
