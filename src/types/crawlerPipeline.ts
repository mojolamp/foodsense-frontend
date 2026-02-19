// ── Pipeline Orchestration ─────────────────────────────────

export type PipelinePhase = 'preflight' | 'probe' | 'pilot' | 'batch' | 'verify'
export type PhaseStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped'

export interface PhaseCheck {
  name: string
  passed: boolean
  detail?: string
}

export interface PipelinePhaseResult {
  phase: PipelinePhase
  status: PhaseStatus
  taskId?: string
  checks: PhaseCheck[]
  startedAt?: string
  completedAt?: string
}

export interface PipelineLaunchConfig {
  keywords: string[]
  sites: string[]
  limitPerKeyword: number
  dryRun: boolean
}

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'aborted'

export interface PipelineRunState {
  config: PipelineLaunchConfig | null
  currentPhase: PipelinePhase | null
  phases: PipelinePhaseResult[]
  status: PipelineStatus
  startedAt?: string
  completedAt?: string
}

// ── Active Task Tracking ──────────────────────────────────

export type TaskSource = 'product' | 'search' | 'allSites' | 'scheduled' | 'probe' | 'pipeline'

export interface ActiveTask {
  taskId: string
  label: string
  source: TaskSource
  startedAt: string
}

// ── Presets (localStorage) ────────────────────────────────

export interface CrawlerPreset {
  id: string
  name: string
  keywords: string[]
  sites: string[]
  limitPerKeyword: number
  createdAt: string
  updatedAt: string
}

// ── Schedule (matches backend) ────────────────────────────

export interface CrawlerSchedule {
  id?: string
  schedule_id: string
  site_name: string
  cron_expression: string | null
  max_products: number
  enabled: boolean
  created_at: string
  created_by?: string
  type?: 'immediate' | 'recurring'
}

export interface CreateScheduleRequest {
  site_name: string
  cron_expression: string | null
  max_products: number
  enabled: boolean
}

// ── Ingestion Summary (matches backend) ───────────────────

export interface IngestionSummaryResponse {
  total_records: number
  by_status: Record<string, number>
  by_source_type: Record<string, number>
  today_count: number
  pass_rate: number
  queried_at: string
  source: string
}
