import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  dedupAPI,
  type DedupCheckRequest,
  type DedupMarkSeenRequest,
  type DedupScope,
} from '@/lib/api/endpoints/dedup'
import { getErrorMessage } from '@/types/api'

// ── Queries ─────────────────────────────────────────────────

export function useDedupStatsV2() {
  return useQuery({
    queryKey: ['dedup', 'stats'],
    queryFn: () => dedupAPI.getStats(),
    refetchInterval: 30_000,
  })
}

export function useDedupHealth() {
  return useQuery({
    queryKey: ['dedup', 'health'],
    queryFn: () => dedupAPI.getHealth(),
    refetchInterval: 30_000,
  })
}

// ── Mutations ───────────────────────────────────────────────

export function useDedupCheck() {
  return useMutation({
    mutationFn: (data: DedupCheckRequest) => dedupAPI.check(data),
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useDedupMarkSeen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DedupMarkSeenRequest) => dedupAPI.markSeen(data),
    onSuccess: () => {
      toast.success('Content marked as seen')
      qc.invalidateQueries({ queryKey: ['dedup', 'stats'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useDedupCheckAndMark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DedupCheckRequest) => dedupAPI.checkAndMark(data),
    onSuccess: (data) => {
      if (data.is_duplicate) {
        toast('Content is a duplicate — skipped', { icon: '⚠️' })
      } else {
        toast.success('Content is unique — marked as seen')
      }
      qc.invalidateQueries({ queryKey: ['dedup', 'stats'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useDedupClear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (scope?: DedupScope) => dedupAPI.clear(scope),
    onSuccess: (data) => {
      toast.success(`Cleared ${data.cleared} fingerprints`)
      qc.invalidateQueries({ queryKey: ['dedup'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}
