import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pacAdminAPI } from '@/lib/api/endpoints/pacAdmin'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type {
  SetEngineModeRequest,
  ActivateKillSwitchRequest,
  DeactivateKillSwitchRequest,
  ReviewQuarantineRequest,
  BulkReviewRequest,
} from '@/types/pacAdmin'

// ── Engine Mode ──

export function useEngineMode() {
  return useQuery({
    queryKey: ['pac-engine-mode'],
    queryFn: () => pacAdminAPI.getEngineMode(),
    refetchInterval: 15_000,
  })
}

export function useSetEngineMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: SetEngineModeRequest) => pacAdminAPI.setEngineMode(req),
    onSuccess: (data) => {
      toast.success(`Engine mode set to ${data.mode}`)
      queryClient.invalidateQueries({ queryKey: ['pac-engine-mode'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to set engine mode')
    },
  })
}

// ── Kill Switch ──

export function useKillSwitch(tenantId?: string) {
  return useQuery({
    queryKey: ['pac-kill-switch', tenantId],
    queryFn: () => pacAdminAPI.getKillSwitch(tenantId),
    refetchInterval: 10_000,
  })
}

export function useActivateKillSwitch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ActivateKillSwitchRequest) => pacAdminAPI.activateKillSwitch(req),
    onSuccess: () => {
      toast.success('Kill switch activated')
      queryClient.invalidateQueries({ queryKey: ['pac-kill-switch'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to activate kill switch')
    },
  })
}

export function useDeactivateKillSwitch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: DeactivateKillSwitchRequest) => pacAdminAPI.deactivateKillSwitch(req),
    onSuccess: () => {
      toast.success('Kill switch deactivated')
      queryClient.invalidateQueries({ queryKey: ['pac-kill-switch'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to deactivate kill switch')
    },
  })
}

// ── Quarantine ──

export function useQuarantineEvents(params?: {
  severity?: string
  status?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['pac-quarantine', params],
    queryFn: () => pacAdminAPI.getQuarantineEvents(params),
  })
}

export function useQuarantineStats() {
  return useQuery({
    queryKey: ['pac-quarantine-stats'],
    queryFn: () => pacAdminAPI.getQuarantineStats(),
    refetchInterval: 30_000,
  })
}

export function useQuarantineSLA() {
  return useQuery({
    queryKey: ['pac-quarantine-sla'],
    queryFn: () => pacAdminAPI.getQuarantineSLA(),
    refetchInterval: 30_000,
  })
}

export function useReviewQuarantine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, req }: { eventId: string; req: ReviewQuarantineRequest }) =>
      pacAdminAPI.reviewQuarantine(eventId, req),
    onSuccess: (data) => {
      toast.success(`Event ${data.review_status.toLowerCase()}`)
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-sla'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Review failed')
    },
  })
}

export function useReleaseQuarantine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => pacAdminAPI.releaseQuarantine(eventId),
    onSuccess: () => {
      toast.success('Event released')
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-sla'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Release failed')
    },
  })
}

export function useBulkReviewQuarantine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: BulkReviewRequest) => pacAdminAPI.bulkReviewQuarantine(req),
    onSuccess: (data) => {
      toast.success(`Bulk review: ${data.success_count}/${data.total} succeeded`)
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-stats'] })
      queryClient.invalidateQueries({ queryKey: ['pac-quarantine-sla'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Bulk review failed')
    },
  })
}

// ── Strategy Lint ──

export function useStrategyLint() {
  return useQuery({
    queryKey: ['pac-strategy-lint'],
    queryFn: () => pacAdminAPI.getStrategyLint(),
  })
}

// ── Version Registry ──

export function useVersionRegistry() {
  return useQuery({
    queryKey: ['pac-version-registry'],
    queryFn: () => pacAdminAPI.getVersionRegistry(),
  })
}

// ── Diagnostics / Health ──

export function usePacDiagnostics() {
  return useQuery({
    queryKey: ['pac-diagnostics'],
    queryFn: () => pacAdminAPI.getDiagnostics(),
    refetchInterval: 30_000,
  })
}

export function usePacHealth() {
  return useQuery({
    queryKey: ['pac-health'],
    queryFn: () => pacAdminAPI.getHealth(),
    refetchInterval: 15_000,
  })
}
