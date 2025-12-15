import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { GroundTruthCreate } from '@/types/review'
import toast from 'react-hot-toast'

export function useReviewQueue(filters?: {
  validation_status?: string
  confidence_level?: string
}) {
  return useQuery({
    queryKey: ['reviewQueue', filters],
    queryFn: () => reviewAPI.getQueue({ ...filters, limit: 50 }),
  })
}

export function useReviewSubmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GroundTruthCreate) => reviewAPI.submitReview(data),
    onSuccess: () => {
      // Reload queue and stats
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
      toast.success('審核提交成功!')
    },
    onError: (error: any) => {
      toast.error(error.message || '審核提交失敗')
    },
  })
}

export function useReviewStats() {
  return useQuery({
    queryKey: ['reviewStats'],
    queryFn: () => reviewAPI.getStats(),
    refetchInterval: 30000, // Every 30 seconds
  })
}

export function useReviewHistory(limit = 50) {
  return useQuery({
    queryKey: ['reviewHistory', limit],
    queryFn: () => reviewAPI.getHistory({ limit }),
  })
}

export function useGoldSamples(limit = 50) {
  return useQuery({
    queryKey: ['goldSamples', limit],
    queryFn: () => reviewAPI.getGoldSamples({ limit }),
  })
}
