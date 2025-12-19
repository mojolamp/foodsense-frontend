import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { GroundTruthCreate, OCRRecord } from '@/types/review'
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

// 批次審核 Hook
export function useBatchReviewSubmit() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState({ completed: 0, total: 0, failed: 0 })

  return useMutation({
    mutationFn: async ({
      records,
      template
    }: {
      records: OCRRecord[]
      template: {
        data_quality_score: number
        confidence_score: number
        is_gold: boolean
        review_notes?: string
      }
    }) => {
      setProgress({ completed: 0, total: records.length, failed: 0 })

      const results = []
      let failed = 0

      // 逐筆提交 (未來可改為後端批次 API)
      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i]
          const result = await reviewAPI.submitReview({
            ocr_record_id: record.id,
            product_id: record.product_id,
            corrected_payload: {
              verified: true,
              verified_at: new Date().toISOString(),
              ocr_raw_text: record.ocr_raw_text,
            },
            data_quality_score: template.data_quality_score,
            confidence_score: template.confidence_score,
            review_notes: template.review_notes,
            is_gold: template.is_gold,
          })
          results.push(result)
          setProgress({ completed: i + 1, total: records.length, failed })
        } catch (error) {
          failed++
          setProgress({ completed: i + 1, total: records.length, failed })
          console.error(`批次審核失敗: ${records[i].id}`, error)
        }
      }

      return { results, failed, total: records.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })

      if (data.failed === 0) {
        toast.success(`成功批次審核 ${data.total} 筆記錄！`)
      } else {
        toast.success(`批次審核完成：成功 ${data.total - data.failed} 筆，失敗 ${data.failed} 筆`)
      }

      setProgress({ completed: 0, total: 0, failed: 0 })
    },
    onError: (error: any) => {
      toast.error(error.message || '批次審核失敗')
      setProgress({ completed: 0, total: 0, failed: 0 })
    },
  })
}
