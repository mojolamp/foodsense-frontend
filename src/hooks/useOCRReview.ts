import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ocrReviewAPI } from '@/lib/api/endpoints/ocrReview'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type { ApproveOCRReviewRequest, RejectOCRReviewRequest } from '@/types/ocrReview'

export function useOCRReviewStats() {
  return useQuery({
    queryKey: ['ocr-review-stats'],
    queryFn: () => ocrReviewAPI.getStats(),
    refetchInterval: 30_000,
  })
}

export function useOCRReviewPending(params?: {
  limit?: number
  offset?: number
  min_confidence?: number
  max_confidence?: number
}) {
  return useQuery({
    queryKey: ['ocr-review-pending', params],
    queryFn: () => ocrReviewAPI.getPending(params),
  })
}

export function useApproveOCRReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: ApproveOCRReviewRequest }) =>
      ocrReviewAPI.approve(reviewId, req),
    onSuccess: () => {
      toast.success('OCR review approved')
      queryClient.invalidateQueries({ queryKey: ['ocr-review-pending'] })
      queryClient.invalidateQueries({ queryKey: ['ocr-review-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Approve failed')
    },
  })
}

export function useRejectOCRReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: RejectOCRReviewRequest }) =>
      ocrReviewAPI.reject(reviewId, req),
    onSuccess: () => {
      toast.success('OCR review rejected')
      queryClient.invalidateQueries({ queryKey: ['ocr-review-pending'] })
      queryClient.invalidateQueries({ queryKey: ['ocr-review-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Reject failed')
    },
  })
}
