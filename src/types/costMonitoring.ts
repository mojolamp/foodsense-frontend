export interface BudgetTier {
  spent_usd: number
  limit_usd: number
  percentage: number
  status: 'healthy' | 'warning' | 'critical'
}

export interface BudgetStatusResponse {
  daily: BudgetTier
  monthly: BudgetTier
}

export interface DailySummaryResponse {
  date: string
  tenant_id: string | null
  total_cost_usd: number
}

export interface TenantCostBreakdown {
  tenant_id: string
  total_cost_usd: number
  total_requests: number
  avg_cost_per_request: number
}

export interface ModelCostBreakdown {
  model: string
  provider: string
  total_cost_usd: number
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
}

export interface CostAlert {
  severity: 'warning' | 'critical'
  type: string
  message: string
  cost: number
  threshold: number
  timestamp: string
}

export interface TrackCostRequest {
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  tenant_id?: string | null
  user_id?: string | null
  endpoint?: string | null
  input_tokens?: number
  output_tokens?: number
  metadata?: Record<string, unknown>
}

export interface TrackCostResponse {
  success: boolean
  cost_usd: number
  timestamp: string
}

export interface CostHealthResponse {
  status: string
  service: string
  timestamp: string
}
