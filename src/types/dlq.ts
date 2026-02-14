export interface DLQStats {
  total: number
  pending: number
  failed: number
  processing: number
  replayed: number
  archived: number
}

export interface DLQMessage {
  id: string
  queue_type: string
  status: 'pending' | 'failed' | 'replayed' | 'archived'
  error_message: string
  error_class?: string
  retry_count: number
  max_retries: number
  payload_preview?: string
  created_at: string
  updated_at: string
}

export interface DLQMessagesResponse {
  success: boolean
  messages: DLQMessage[]
  total: number
}

export interface DLQActionResponse {
  success: boolean
  message_id: string
  status: string
  message: string
}

export interface DedupStats {
  mode: string
  total_checked: number
  duplicates_found: number
  dedup_rate: number
  last_updated: string
}

export interface AcquisitionMetrics {
  channels: {
    name: string
    success_count: number
    fail_count: number
    success_rate: number
    last_run?: string
  }[]
  dlq_depth: number
  dedup_mode: string
  last_updated: string
}
