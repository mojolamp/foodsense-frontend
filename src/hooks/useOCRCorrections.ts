import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ocrCorrectionsAPI } from '@/lib/api/endpoints/ocrCorrections'
import { getErrorMessage } from '@/types/api'
import type {
  CorrectionSubmitRequest,
  FeedbackSubmitRequest,
  CorrectionStatus,
} from '@/types/ocrCorrections'

export function useOCRCorrectionsList(status: CorrectionStatus = 'pending') {
  return useQuery({
    queryKey: ['ocrCorrections', 'list', status],
    queryFn: () => ocrCorrectionsAPI.list(status),
    refetchInterval: 30_000,
  })
}

export function useOCRCorrectionSubmit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CorrectionSubmitRequest) => ocrCorrectionsAPI.submit(data),
    onSuccess: () => {
      toast.success('Correction submitted')
      qc.invalidateQueries({ queryKey: ['ocrCorrections'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useOCRCorrectionApprove() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pairId: string) => ocrCorrectionsAPI.approve(pairId),
    onSuccess: () => {
      toast.success('Correction approved')
      qc.invalidateQueries({ queryKey: ['ocrCorrections'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useOCRCorrectionReject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pairId: string) => ocrCorrectionsAPI.reject(pairId),
    onSuccess: () => {
      toast.success('Correction rejected')
      qc.invalidateQueries({ queryKey: ['ocrCorrections'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useOCRFeedbackSubmit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FeedbackSubmitRequest) => ocrCorrectionsAPI.submitFeedback(data),
    onSuccess: (data) => {
      toast.success(`Feedback submitted: ${data.extracted_pairs.length} pairs extracted`)
      qc.invalidateQueries({ queryKey: ['ocrCorrections'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
