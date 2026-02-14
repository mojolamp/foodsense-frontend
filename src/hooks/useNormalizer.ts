import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { normalizerAPI } from '@/lib/api/endpoints/normalizer'
import { getErrorMessage } from '@/types/api'
import type { NormalizeRequest, NormalizeBatchRequest } from '@/types/normalizer'

export function useNormalizerHealth() {
  return useQuery({
    queryKey: ['normalizer', 'health'],
    queryFn: () => normalizerAPI.getHealth(),
    refetchInterval: 30_000,
  })
}

export function useNormalizerVersions() {
  return useQuery({
    queryKey: ['normalizer', 'versions'],
    queryFn: () => normalizerAPI.getVersions(),
  })
}

export function useNormalize() {
  return useMutation({
    mutationFn: (data: NormalizeRequest) => normalizerAPI.normalize(data),
    onSuccess: () => toast.success('Normalization complete'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useNormalizeBatchOCR() {
  return useMutation({
    mutationFn: (data: NormalizeBatchRequest) => normalizerAPI.normalizeBatchOCR(data),
    onSuccess: (data) => {
      toast.success(`Batch complete: ${data.succeeded}/${data.total} succeeded`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
