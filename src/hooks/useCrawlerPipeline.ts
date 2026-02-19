'use client'

import { useReducer, useCallback, useRef } from 'react'
import { crawlerRawAPI } from '@/lib/api/endpoints/crawlerRaw'
import { dataQualityV2API } from '@/lib/api/endpoints/dataQualityV2'
import { apiClient } from '@/lib/api/client'
import type {
  PipelinePhase,
  PipelineLaunchConfig,
  PipelinePhaseResult,
  PipelineRunState,
  PipelineStatus,
  PhaseCheck,
} from '@/types/crawlerPipeline'

// ── Actions ──────────────────────────────────────────────

type Action =
  | { type: 'START'; config: PipelineLaunchConfig }
  | { type: 'PHASE_START'; phase: PipelinePhase }
  | { type: 'CHECK_ADD'; phase: PipelinePhase; check: PhaseCheck }
  | { type: 'PHASE_PASS'; phase: PipelinePhase }
  | { type: 'PHASE_FAIL'; phase: PipelinePhase; error?: string }
  | { type: 'ABORT' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }

const PHASES: PipelinePhase[] = ['preflight', 'probe', 'pilot', 'batch', 'verify']

function initPhases(): PipelinePhaseResult[] {
  return PHASES.map((phase) => ({
    phase,
    status: 'pending',
    checks: [],
  }))
}

const INITIAL_STATE: PipelineRunState = {
  config: null,
  currentPhase: null,
  phases: initPhases(),
  status: 'idle',
}

function reducer(state: PipelineRunState, action: Action): PipelineRunState {
  switch (action.type) {
    case 'START':
      return {
        config: action.config,
        currentPhase: null,
        phases: initPhases(),
        status: 'running',
        startedAt: new Date().toISOString(),
      }

    case 'PHASE_START':
      return {
        ...state,
        currentPhase: action.phase,
        phases: state.phases.map((p) =>
          p.phase === action.phase
            ? { ...p, status: 'running', startedAt: new Date().toISOString() }
            : p
        ),
      }

    case 'CHECK_ADD':
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.phase === action.phase
            ? { ...p, checks: [...p.checks, action.check] }
            : p
        ),
      }

    case 'PHASE_PASS':
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.phase === action.phase
            ? { ...p, status: 'passed', completedAt: new Date().toISOString() }
            : p
        ),
      }

    case 'PHASE_FAIL':
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.phase === action.phase
            ? {
                ...p,
                status: 'failed',
                completedAt: new Date().toISOString(),
                checks: action.error
                  ? [...p.checks, { name: 'Error', passed: false, detail: action.error }]
                  : p.checks,
              }
            : p
        ),
      }

    case 'ABORT':
      return {
        ...state,
        status: 'aborted',
        currentPhase: null,
        completedAt: new Date().toISOString(),
        phases: state.phases.map((p) =>
          p.status === 'running'
            ? { ...p, status: 'failed', completedAt: new Date().toISOString() }
            : p.status === 'pending'
              ? { ...p, status: 'skipped' }
              : p
        ),
      }

    case 'COMPLETE':
      return {
        ...state,
        status: 'completed',
        currentPhase: null,
        completedAt: new Date().toISOString(),
      }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

// ── Poll helper ──────────────────────────────────────────

async function pollTask(
  taskId: string,
  signal: AbortSignal,
  maxWaitMs = 300_000,
): Promise<{ status: string; result?: unknown; error?: string }> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    if (signal.aborted) throw new Error('Aborted')
    const res = await crawlerRawAPI.getTaskStatus(taskId)
    if (res.status === 'done' || res.status === 'failed') return res
    await new Promise((r) => setTimeout(r, 5_000))
  }
  throw new Error('Task poll timeout')
}

// ── Hook ─────────────────────────────────────────────────

export function usePipelineRun() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'ABORT' })
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'RESET' })
  }, [])

  const start = useCallback(async (config: PipelineLaunchConfig) => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    dispatch({ type: 'START', config })

    const d = dispatch
    const sig = ac.signal

    try {
      // ── Phase 0: Preflight ─────────────────────
      d({ type: 'PHASE_START', phase: 'preflight' })

      // Health check
      try {
        await apiClient.get<{ status: string }>('/health')
        d({ type: 'CHECK_ADD', phase: 'preflight', check: { name: 'Health endpoint', passed: true } })
      } catch (e) {
        d({ type: 'CHECK_ADD', phase: 'preflight', check: { name: 'Health endpoint', passed: false, detail: String(e) } })
        d({ type: 'PHASE_FAIL', phase: 'preflight' })
        d({ type: 'ABORT' })
        return
      }

      // Health/ready
      try {
        await apiClient.get<{ status: string }>('/health/ready')
        d({ type: 'CHECK_ADD', phase: 'preflight', check: { name: 'Health ready', passed: true } })
      } catch (e) {
        d({ type: 'CHECK_ADD', phase: 'preflight', check: { name: 'Health ready', passed: false, detail: String(e) } })
        d({ type: 'PHASE_FAIL', phase: 'preflight' })
        d({ type: 'ABORT' })
        return
      }

      // Crawlers list
      try {
        const list = await crawlerRawAPI.listCrawlers()
        d({
          type: 'CHECK_ADD',
          phase: 'preflight',
          check: { name: 'Crawlers available', passed: list.total > 0, detail: `${list.total} crawlers` },
        })
        if (list.total === 0) {
          d({ type: 'PHASE_FAIL', phase: 'preflight', error: 'No crawlers registered' })
          d({ type: 'ABORT' })
          return
        }
      } catch (e) {
        d({ type: 'CHECK_ADD', phase: 'preflight', check: { name: 'Crawlers available', passed: false, detail: String(e) } })
        d({ type: 'PHASE_FAIL', phase: 'preflight' })
        d({ type: 'ABORT' })
        return
      }

      d({ type: 'PHASE_PASS', phase: 'preflight' })

      // Dry-run stops after preflight
      if (config.dryRun) {
        d({ type: 'COMPLETE' })
        return
      }

      if (sig.aborted) return

      // ── Phase 1: Probe ─────────────────────────
      d({ type: 'PHASE_START', phase: 'probe' })

      try {
        const probeRes = await crawlerRawAPI.probe({})
        d({ type: 'CHECK_ADD', phase: 'probe', check: { name: 'Probe queued', passed: true, detail: probeRes.task_id } })

        const probeResult = await pollTask(probeRes.task_id, sig)
        const probePassed = probeResult.status === 'done'
        d({
          type: 'CHECK_ADD',
          phase: 'probe',
          check: { name: 'Probe completed', passed: probePassed, detail: probeResult.error || 'OK' },
        })

        if (!probePassed) {
          d({ type: 'PHASE_FAIL', phase: 'probe', error: probeResult.error })
          d({ type: 'ABORT' })
          return
        }
      } catch (e) {
        d({ type: 'PHASE_FAIL', phase: 'probe', error: String(e) })
        d({ type: 'ABORT' })
        return
      }

      d({ type: 'PHASE_PASS', phase: 'probe' })
      if (sig.aborted) return

      // ── Phase 2: Pilot ─────────────────────────
      d({ type: 'PHASE_START', phase: 'pilot' })

      try {
        const pilotSite = config.sites[0] ?? 'pchome'
        const pilotKeyword = config.keywords[0] ?? '豆腐'
        const pilotRes = await crawlerRawAPI.crawlSearch({
          site_name: pilotSite,
          keyword: pilotKeyword,
          limit: 3,
        })
        d({
          type: 'CHECK_ADD',
          phase: 'pilot',
          check: { name: `Pilot search: ${pilotSite}/${pilotKeyword}`, passed: true, detail: pilotRes.task_id },
        })

        const pilotResult = await pollTask(pilotRes.task_id, sig)
        const pilotPassed = pilotResult.status === 'done'
        d({
          type: 'CHECK_ADD',
          phase: 'pilot',
          check: { name: 'Pilot completed', passed: pilotPassed, detail: pilotResult.error || 'OK' },
        })

        if (!pilotPassed) {
          d({ type: 'PHASE_FAIL', phase: 'pilot', error: pilotResult.error })
          d({ type: 'ABORT' })
          return
        }
      } catch (e) {
        d({ type: 'PHASE_FAIL', phase: 'pilot', error: String(e) })
        d({ type: 'ABORT' })
        return
      }

      d({ type: 'PHASE_PASS', phase: 'pilot' })
      if (sig.aborted) return

      // ── Phase 3: Batch ─────────────────────────
      d({ type: 'PHASE_START', phase: 'batch' })

      try {
        const batchRes = await crawlerRawAPI.crawlScheduled({
          keywords: config.keywords,
          sites: config.sites.length > 0 ? config.sites : null,
          limit_per_keyword: config.limitPerKeyword,
        })
        d({
          type: 'CHECK_ADD',
          phase: 'batch',
          check: { name: 'Batch queued', passed: true, detail: batchRes.task_id },
        })

        const batchResult = await pollTask(batchRes.task_id, sig, 600_000) // 10 min for batch
        const batchPassed = batchResult.status === 'done'
        d({
          type: 'CHECK_ADD',
          phase: 'batch',
          check: { name: 'Batch completed', passed: batchPassed, detail: batchResult.error || 'OK' },
        })

        if (!batchPassed) {
          // Batch partial fail → continue to verify
          d({ type: 'PHASE_FAIL', phase: 'batch', error: batchResult.error })
        } else {
          d({ type: 'PHASE_PASS', phase: 'batch' })
        }
      } catch (e) {
        d({ type: 'PHASE_FAIL', phase: 'batch', error: String(e) })
        // Batch fail → still continue to verify
      }

      if (sig.aborted) return

      // ── Phase 4: Verify ────────────────────────
      d({ type: 'PHASE_START', phase: 'verify' })

      try {
        const ingestion = await dataQualityV2API.getIngestionSummary()
        d({
          type: 'CHECK_ADD',
          phase: 'verify',
          check: {
            name: 'Ingestion summary',
            passed: ingestion.pass_rate > 0.8,
            detail: `${ingestion.total_records} records, ${(ingestion.pass_rate * 100).toFixed(1)}% pass`,
          },
        })

        const coverage = await dataQualityV2API.getCoverage()
        const avgCoverage =
          Object.values(coverage.fields).reduce((a, b) => a + b, 0) /
          Math.max(Object.values(coverage.fields).length, 1)
        d({
          type: 'CHECK_ADD',
          phase: 'verify',
          check: {
            name: 'Field coverage',
            passed: avgCoverage > 0.5,
            detail: `Avg ${(avgCoverage * 100).toFixed(1)}% across ${Object.keys(coverage.fields).length} fields`,
          },
        })

        const freshness = await dataQualityV2API.getFreshness()
        d({
          type: 'CHECK_ADD',
          phase: 'verify',
          check: {
            name: 'Freshness',
            passed: freshness.avg_age_days < 30,
            detail: `Avg age: ${freshness.avg_age_days.toFixed(1)} days, ${freshness.stale_count} stale`,
          },
        })

        d({ type: 'PHASE_PASS', phase: 'verify' })
      } catch (e) {
        d({ type: 'PHASE_FAIL', phase: 'verify', error: String(e) })
      }

      d({ type: 'COMPLETE' })
    } catch (e) {
      if (sig.aborted) return
      dispatch({ type: 'ABORT' })
      console.error('Pipeline run error:', e)
    }
  }, [])

  return { state, start, abort, reset }
}
