// ── Task Queue Types ─────────────────────────────────────

export interface TaskQueueHealthResponse {
  available: boolean
  timestamp: string
}

export interface QueueStats {
  name: string
  pending: number
  active: number
  completed: number
  failed: number
}

export interface WorkerInfo {
  name: string
  state: string
  queues: string[]
}

export interface TaskQueueStatsResponse {
  queues: Record<string, QueueStats>
  workers: WorkerInfo[]
  timestamp: string
}

export interface TaskJobStatus {
  job_id: string
  status: 'queued' | 'running' | 'done' | 'failed' | 'cancelled'
  queue: string
  created_at?: string
  started_at?: string
  ended_at?: string
  result?: unknown
  error?: string
}

export interface TaskCancelResponse {
  status: 'cancelled'
  job_id: string
  timestamp: string
}

export interface TaskRetryResponse {
  status: 'retried'
  original_job_id: string
  new_job_id: string
  timestamp: string
}

export interface TaskEnqueueResponse {
  job_id: string
  status: 'enqueued'
  queue: string
  product_id?: string
  product_count?: number
  item_count?: number
  to?: string
  days?: number
}

export interface TaskQueueClearResponse {
  status: 'cleared'
  queue: string
  timestamp: string
}

// ── Request types ────────────────────────────────────────

export interface AggregationBatchRequest {
  product_ids: string[]
}

export interface EmbeddingsGenerateRequest {
  items: { id: string; text: string }[]
}

export interface ExportProductsRequest {
  filters?: Record<string, unknown> | null
}

export interface SendEmailRequest {
  to: string
  subject: string
  body: string
  html?: string | null
}
