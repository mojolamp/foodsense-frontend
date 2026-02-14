import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { scanV1API } from '@/lib/api/endpoints/scanV1'
import { getErrorMessage } from '@/types/api'

export function useScanV1Submit() {
  return useMutation({
    mutationFn: (image: File) => scanV1API.submitScan(image),
    onSuccess: (data) => {
      if (data.status === 'done') {
        toast.success('Scan complete')
      } else {
        toast.success(`Scan queued: ${data.job_id}`)
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useScanV1JobResult(jobId: string) {
  return useQuery({
    queryKey: ['scanV1', 'job', jobId],
    queryFn: () => scanV1API.getJobResult(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return 3_000
    },
  })
}
