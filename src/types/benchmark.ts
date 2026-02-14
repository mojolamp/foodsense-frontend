// ── Benchmark Run ──────────────────────────────────────────

export interface IngredientExtractionMetrics {
  avg_precision: number
  avg_recall: number
  avg_f1_score: number
  avg_position_accuracy: number
}

export interface NutritionParsingMetrics {
  avg_field_accuracy: number
  avg_numeric_accuracy: number
}

export interface PerformanceMetrics {
  avg_duration_ms: number
  total_duration_ms: number
  p95_duration_ms: number
  max_duration_ms: number
}

export interface BenchmarkSummary {
  timestamp: string
  total_samples: number
  passed_samples: number
  failed_samples: number
  pass_rate: number
  average_duration_ms: number
  ingredient_extraction: IngredientExtractionMetrics
  nutrition_parsing: NutritionParsingMetrics
  performance: PerformanceMetrics
  failed_products: string[]
}

export interface BenchmarkRunResponse {
  status: string
  summary: BenchmarkSummary
}

// ── Results ────────────────────────────────────────────────

export interface BenchmarkResultsResponse {
  status: 'found' | 'no_results'
  results?: BenchmarkSummary
  message?: string
}

// ── History ────────────────────────────────────────────────

export interface BenchmarkHistoryResponse {
  status: 'found' | 'no_history'
  count?: number
  history: BenchmarkSummary[]
  message?: string
}

// ── Metrics Thresholds ─────────────────────────────────────

export interface BenchmarkMetricsResponse {
  ingredient_extraction: {
    min_precision: number
    min_recall: number
    min_f1_score: number
  }
  nutrition_parsing: {
    min_field_accuracy: number
    numeric_tolerance: number
    required_fields: string[]
  }
  performance: {
    max_processing_time_ms: number
  }
}

// ── Dataset Info ───────────────────────────────────────────

export interface DatasetInfoResponse {
  version: string
  created_date: string
  description: string
  total_samples: number
  categories: string[]
  difficulty_distribution: {
    easy: number
    medium: number
    hard: number
  }
}
