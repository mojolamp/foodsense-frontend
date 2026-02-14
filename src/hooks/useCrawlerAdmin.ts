import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crawlerAdminAPI } from '@/lib/api/endpoints/crawlerAdmin'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'

export function useRepairStats() {
  return useQuery({
    queryKey: ['crawler-repair-stats'],
    queryFn: () => crawlerAdminAPI.getStats(),
  })
}

export function useRepairs(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['crawler-repairs', params],
    queryFn: () => crawlerAdminAPI.getPendingRepairs(params),
  })
}

export function useApproveRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (repairId: string) => crawlerAdminAPI.approveRepair(repairId),
    onSuccess: () => {
      toast.success('Repair approved')
      queryClient.invalidateQueries({ queryKey: ['crawler-repairs'] })
      queryClient.invalidateQueries({ queryKey: ['crawler-repair-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Approve failed')
    },
  })
}

export function useRejectRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { repairId: string; reason: string }) =>
      crawlerAdminAPI.rejectRepair(payload.repairId, payload.reason),
    onSuccess: () => {
      toast.success('Repair rejected')
      queryClient.invalidateQueries({ queryKey: ['crawler-repairs'] })
      queryClient.invalidateQueries({ queryKey: ['crawler-repair-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Reject failed')
    },
  })
}
