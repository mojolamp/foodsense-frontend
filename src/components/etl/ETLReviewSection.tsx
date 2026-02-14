'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { useETLReviews, useETLApproveReview, useETLRejectReview } from '@/hooks/useETL'

export default function ETLReviewSection() {
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const { data, isLoading } = useETLReviews(filterStatus || undefined)
  const approveReview = useETLApproveReview()
  const rejectReview = useETLRejectReview()

  const reviews = data?.reviews ?? []

  return (
    <div className="space-y-3 pt-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Status:</span>
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={filterStatus === s ? 'default' : 'outline'}
            onClick={() => setFilterStatus(s)}
            className="text-xs h-7"
          >
            {s || 'All'}
          </Button>
        ))}
      </div>

      {/* Reviews */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Card key={review.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground truncate">{review.id}</span>
                  <span className="text-sm font-medium truncate">{review.product_name}</span>
                  <Badge
                    variant={
                      review.status === 'approved' ? 'success' :
                      review.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="text-xs shrink-0"
                  >
                    {review.status}
                  </Badge>
                </div>
                {review.status === 'pending' && (
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => approveReview.mutate(review.id)}
                      disabled={approveReview.isPending}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => rejectReview.mutate({ reviewId: review.id })}
                      disabled={rejectReview.isPending}
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Job: {review.job_id} | Created: {new Date(review.created_at).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
