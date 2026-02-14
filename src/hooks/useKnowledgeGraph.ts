import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kgQueryAPI, kgVariantsAPI, kgAggregationAPI } from '@/lib/api/endpoints/knowledgeGraph'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type {
  KGQueryRequest,
  VariantMatchRequest,
  VariantBatchMatchRequest,
  ApproveVariantRequest,
  RejectVariantRequest,
  CreateAggregationJobRequest,
  BatchObservationRequest,
  BatchRejectObservationRequest,
  SearchType,
} from '@/types/knowledgeGraph'

// ── KG Query ──

export function useKGQuery() {
  return useMutation({
    mutationFn: (req: KGQueryRequest) => kgQueryAPI.query(req),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Query failed')
    },
  })
}

export function useKGIngredient(name: string, minConfidence?: number) {
  return useQuery({
    queryKey: ['kg-ingredient', name, minConfidence],
    queryFn: () => kgQueryAPI.getIngredient(name, minConfidence),
    enabled: !!name,
  })
}

export function useKGSimilarProducts(productId: string, limit?: number) {
  return useQuery({
    queryKey: ['kg-similar-products', productId, limit],
    queryFn: () => kgQueryAPI.getSimilarProducts(productId, limit),
    enabled: !!productId,
  })
}

export function useKGAutocomplete(q: string, limit?: number) {
  return useQuery({
    queryKey: ['kg-autocomplete', q, limit],
    queryFn: () => kgQueryAPI.autocomplete(q, limit),
    enabled: q.length >= 2,
  })
}

export function useKGQueryStats() {
  return useQuery({
    queryKey: ['kg-query-stats'],
    queryFn: () => kgQueryAPI.getStats(),
    refetchInterval: 60_000,
  })
}

// ── KG Variants ──

export function useVariantMatch() {
  return useMutation({
    mutationFn: (req: VariantMatchRequest) => kgVariantsAPI.match(req),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Match failed')
    },
  })
}

export function useVariantBatchMatch() {
  return useMutation({
    mutationFn: (req: VariantBatchMatchRequest) => kgVariantsAPI.batchMatch(req),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Batch match failed')
    },
  })
}

export function useVariantPendingReviews(params?: {
  limit?: number
  offset?: number
  priority?: number
}) {
  return useQuery({
    queryKey: ['kg-variant-pending-reviews', params],
    queryFn: () => kgVariantsAPI.getPendingReviews(params),
  })
}

export function useApproveVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: ApproveVariantRequest }) =>
      kgVariantsAPI.approveReview(reviewId, req),
    onSuccess: () => {
      toast.success('Variant approved')
      queryClient.invalidateQueries({ queryKey: ['kg-variant-pending-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['kg-variant-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Approve failed')
    },
  })
}

export function useRejectVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, req }: { reviewId: string; req: RejectVariantRequest }) =>
      kgVariantsAPI.rejectReview(reviewId, req),
    onSuccess: () => {
      toast.success('Variant rejected')
      queryClient.invalidateQueries({ queryKey: ['kg-variant-pending-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['kg-variant-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Reject failed')
    },
  })
}

export function useVariantStats() {
  return useQuery({
    queryKey: ['kg-variant-stats'],
    queryFn: () => kgVariantsAPI.getStats(),
    refetchInterval: 30_000,
  })
}

// ── KG Aggregation ──

export function useAggregationJobs(params?: {
  status?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['kg-aggregation-jobs', params],
    queryFn: () => kgAggregationAPI.listJobs(params),
  })
}

export function useAggregationJob(jobId: string) {
  return useQuery({
    queryKey: ['kg-aggregation-job', jobId],
    queryFn: () => kgAggregationAPI.getJob(jobId),
    enabled: !!jobId,
  })
}

export function useCreateAggregationJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateAggregationJobRequest) => kgAggregationAPI.createJob(req),
    onSuccess: () => {
      toast.success('Aggregation job created')
      queryClient.invalidateQueries({ queryKey: ['kg-aggregation-jobs'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Job creation failed')
    },
  })
}

export function useExecuteAggregationJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => kgAggregationAPI.executeJob(jobId),
    onSuccess: () => {
      toast.success('Job executed')
      queryClient.invalidateQueries({ queryKey: ['kg-aggregation-jobs'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Execution failed')
    },
  })
}

export function useCancelAggregationJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => kgAggregationAPI.cancelJob(jobId),
    onSuccess: () => {
      toast.success('Job cancelled')
      queryClient.invalidateQueries({ queryKey: ['kg-aggregation-jobs'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Cancel failed')
    },
  })
}

export function usePendingObservations(params?: {
  limit?: number
  offset?: number
  category?: string
  min_quality_score?: number
}) {
  return useQuery({
    queryKey: ['kg-pending-observations', params],
    queryFn: () => kgAggregationAPI.getPendingObservations(params),
  })
}

export function useBatchApproveObservations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: BatchObservationRequest) => kgAggregationAPI.batchApprove(req),
    onSuccess: (data) => {
      toast.success(`${data.count} observations approved`)
      queryClient.invalidateQueries({ queryKey: ['kg-pending-observations'] })
      queryClient.invalidateQueries({ queryKey: ['kg-aggregation-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Batch approve failed')
    },
  })
}

export function useBatchRejectObservations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: BatchRejectObservationRequest) => kgAggregationAPI.batchReject(req),
    onSuccess: (data) => {
      toast.success(`${data.count} observations rejected`)
      queryClient.invalidateQueries({ queryKey: ['kg-pending-observations'] })
      queryClient.invalidateQueries({ queryKey: ['kg-aggregation-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Batch reject failed')
    },
  })
}

export function useAggregationStats() {
  return useQuery({
    queryKey: ['kg-aggregation-stats'],
    queryFn: () => kgAggregationAPI.getStats(),
    refetchInterval: 60_000,
  })
}

export function useIngredientAggregation(canonicalName: string, minObservations?: number) {
  return useQuery({
    queryKey: ['kg-ingredient-aggregation', canonicalName, minObservations],
    queryFn: () => kgAggregationAPI.getIngredient(canonicalName, minObservations),
    enabled: !!canonicalName,
  })
}
