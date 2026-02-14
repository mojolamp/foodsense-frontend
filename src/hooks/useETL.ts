import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { etlAPI } from '@/lib/api/endpoints/etl'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type { CollectorType } from '@/types/etl'

export function useETLJobs(params?: {
  collector_type?: CollectorType
  status?: string
  page?: number
  page_size?: number
}) {
  return useQuery({
    queryKey: ['etl-jobs', params],
    queryFn: () => etlAPI.getJobs(params),
    refetchInterval: 15_000,
  })
}

export function useETLJob(jobId: string) {
  return useQuery({
    queryKey: ['etl-job', jobId],
    queryFn: () => etlAPI.getJob(jobId),
    enabled: !!jobId,
  })
}

export function useETLPipeline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      collector_type: CollectorType
      query: string
      limit: number
      site_key?: string
      auto_approve?: boolean
    }) => etlAPI.runPipeline(payload),
    onSuccess: (data) => {
      toast.success(`Pipeline started: ${data.job_id}`)
      queryClient.invalidateQueries({ queryKey: ['etl-jobs'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Pipeline execution failed')
    },
  })
}

export function useBarcodeCrosscheck() {
  return useMutation({
    mutationFn: (payload: { barcode: string; sources: string[] }) =>
      etlAPI.crosscheckBarcode(payload),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Barcode crosscheck failed')
    },
  })
}

export function useVeganSites() {
  return useQuery({
    queryKey: ['vegan-sites'],
    queryFn: () => etlAPI.getVeganSites(),
  })
}

export function useETLClean() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => etlAPI.clean(jobId),
    onSuccess: () => {
      toast.success('Clean stage triggered')
      queryClient.invalidateQueries({ queryKey: ['etl-jobs'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Clean failed')
    },
  })
}

export function useETLReviews(status?: string) {
  return useQuery({
    queryKey: ['etl-reviews', status],
    queryFn: () => etlAPI.getReviews(status),
    refetchInterval: 15_000,
  })
}

export function useETLApproveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => etlAPI.approveReview(reviewId),
    onSuccess: () => {
      toast.success('Review approved')
      queryClient.invalidateQueries({ queryKey: ['etl-reviews'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Approve failed')
    },
  })
}

export function useETLRejectReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason?: string }) =>
      etlAPI.rejectReview(reviewId, reason),
    onSuccess: () => {
      toast.success('Review rejected')
      queryClient.invalidateQueries({ queryKey: ['etl-reviews'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Reject failed')
    },
  })
}

export function useETLHealth() {
  return useQuery({
    queryKey: ['etl-health'],
    queryFn: () => etlAPI.getHealth(),
    refetchInterval: 30_000,
  })
}
