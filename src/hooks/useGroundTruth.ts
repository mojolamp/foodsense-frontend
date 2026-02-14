import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { groundTruthAPI } from '@/lib/api/endpoints/groundTruth'
import { getErrorMessage } from '@/types/api'
import type { GTSuggestRequest, GTValidateRequest, GTConvertRequest } from '@/types/groundTruth'

export function useGTHealth() {
  return useQuery({
    queryKey: ['groundTruth', 'health'],
    queryFn: () => groundTruthAPI.getHealth(),
    refetchInterval: 30_000,
  })
}

export function useGTSuggest() {
  return useMutation({
    mutationFn: (data: GTSuggestRequest) => groundTruthAPI.suggest(data),
    onSuccess: (data) => {
      toast.success(`${data.total_suggestions} suggestions generated`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useGTValidate() {
  return useMutation({
    mutationFn: (data: GTValidateRequest) => groundTruthAPI.validate(data),
    onSuccess: (data) => {
      if (data.is_valid) {
        toast.success(`Valid: ${data.valid_items}/${data.total_items} items`)
      } else {
        toast.error(`Invalid: ${data.errors.length} errors`)
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useGTConvert() {
  return useMutation({
    mutationFn: (data: GTConvertRequest) => groundTruthAPI.convert(data),
    onSuccess: (data) => {
      toast.success(`Converted ${data.total_converted} items`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
