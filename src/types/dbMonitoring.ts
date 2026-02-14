export interface DbStats {
  total_observations: number
  total_ingredients: number
  total_variants: number
  total_categories: number
  pending_observations: number
  pending_reviews: number
  embedding_coverage: number
  timestamp: string
}

export interface SlowQuery {
  query: string
  execution_time_ms: number
  timestamp: string
  metadata: Record<string, unknown>
}

export interface SlowQueriesResponse {
  threshold_ms: number
  slow_queries: SlowQuery[]
  total_found: number
}

export interface OptimizationReport {
  timestamp: string
  n1_queries: {
    pattern: string
    count: number
    recommendation: string
  }[]
  performance_stats: {
    avg_query_time_ms: number
    p95_query_time_ms: number
    p99_query_time_ms: number
  }
  slow_queries: SlowQuery[]
  recommendations: string[]
}

export interface IndexUsage {
  index_name: string
  table_name: string
  index_scans: number
  tuples_read: number
  tuples_fetched: number
  index_size_mb: number
}

export interface IndexUsageResponse {
  message: string
  note: string
  indexes: IndexUsage[]
  recommendations: string[]
}

export interface ConnectionPoolResponse {
  message: string
  note: string
  timestamp: string
}

export interface DbActionResponse {
  status: string
  message: string
  timestamp: string
  analyzed_tables?: string[]
}

export interface DbHealthResponse {
  status: string
  service: string
  timestamp: string
}
