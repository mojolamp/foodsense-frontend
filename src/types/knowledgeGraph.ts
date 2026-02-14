// ── KG Query ──

export type SearchType = 'vector' | 'keyword' | 'hybrid'

export interface KGQueryRequest {
  query: string
  search_type?: SearchType
  limit?: number
  expand_query?: boolean
}

export interface KGQueryResponse {
  query: string
  query_variations: string[]
  search_type: string
  ingredients: Record<string, unknown>[]
  total_results: number
  execution_time_ms: number
  timestamp: string
}

export interface KGIngredientResponse {
  ingredient: string
  canonical_names: string[]
  products: Record<string, unknown>[]
  total_products: number
}

export interface KGSimilarProductsResponse {
  product_id: string
  reference_product: Record<string, unknown>
  similar_products: Record<string, unknown>[]
  total_found: number
}

export interface KGBatchQueryRequest {
  queries: string[]
  search_type?: SearchType
  limit?: number
}

export interface KGBatchQueryResponse {
  queries: string[]
  results: KGQueryResponse[]
  total_queries: number
  timestamp: string
}

export interface KGAutocompleteSuggestion {
  name: string
  type: string
  score: number
}

export interface KGAutocompleteResponse {
  query: string
  suggestions: KGAutocompleteSuggestion[]
  total_suggestions: number
}

export interface KGQueryStats {
  total_ingredients: number
  total_products: number
  total_categories: number
  embedded_variants: number
  embedding_coverage: number
  timestamp: string
}

// ── KG Variants ──

export interface VariantMatchRequest {
  variant_text: string
  auto_submit_review?: boolean
  context?: Record<string, unknown>
}

export interface VariantMatchResponse {
  canonical_name: string | null
  confidence: number
  layer: number | null
  match_type: string
  variant_text: string
  suggested_matches: { name: string; confidence: number }[] | null
  review_id: string | null
  message: string | null
}

export interface VariantBatchMatchRequest {
  variant_texts: string[]
  auto_submit_review?: boolean
  context?: Record<string, unknown>
}

export interface VariantBatchMatchResponse {
  results: VariantMatchResponse[]
  total: number
  matched: number
  pending_review: number
  errors: number
}

export interface VariantPendingReview {
  id: string
  variant_text: string
  suggested_canonical: string | null
  confidence: number
  priority: number
  context: Record<string, unknown> | null
  created_at: string
}

export interface VariantPendingReviewsResponse {
  reviews: VariantPendingReview[]
  total: number
  pending: number
  high_priority: number
}

export interface ApproveVariantRequest {
  canonical_name: string
  reviewer_id: string
  notes?: string
}

export interface ApproveVariantResponse {
  status: string
  review_id: string
  registry_id: string
  canonical_name: string
  layer: number
  message: string
}

export interface RejectVariantRequest {
  reviewer_id: string
  reason: string
  notes?: string
}

export interface RejectVariantResponse {
  status: string
  review_id: string
  reason: string
  message: string
}

export interface VariantStats {
  total_variants: number
  layer1_exact: number
  layer2_fuzzy: number
  layer3_semantic: number
  layer4_manual: number
  pending_reviews: number
  avg_confidence: number
  last_updated: string
}

// ── KG Aggregation ──

export type AggregationType = 'ingredient_frequency' | 'nutrition_stats' | 'anomaly_detection'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface CreateAggregationJobRequest {
  aggregation_type: AggregationType
  product_ids?: string[]
  priority?: number
  filters?: Record<string, unknown>
  min_observations?: number
}

export interface AggregationJob {
  id: string
  job_type: string
  status: JobStatus
  progress: number
  priority: number
  created_at: string
  completed_at: string | null
  error_message: string | null
  results: Record<string, unknown> | null
}

export interface AggregationJobListResponse {
  jobs: AggregationJob[]
  total: number
  page: number
  page_size: number
}

export interface JobExecuteResponse {
  status: string
  job_id: string
  results: Record<string, unknown>
  message: string
}

export interface JobCancelResponse {
  status: string
  job_id: string
  message: string
}

export interface PendingObservation {
  id: string
  product_id: string
  category: string
  quality_score: number
  status: string
  created_at: string
}

export interface PendingObservationsResponse {
  observations: PendingObservation[]
  total: number
  page: number
  page_size: number
}

export interface BatchObservationRequest {
  observation_ids: string[]
  reviewer_id: string
  notes?: string
}

export interface BatchRejectObservationRequest {
  observation_ids: string[]
  reviewer_id: string
  reason: string
  notes?: string
}

export interface BatchObservationResponse {
  status: string
  count: number
  observation_ids: string[]
  reviewer_id: string
  message: string
  reason?: string
}

export interface AggregationStats {
  observations: Record<string, unknown>
  jobs: Record<string, unknown>
  timestamp: string
}

export interface IngredientAggregation {
  canonical_name: string
  total_occurrences: number
  unique_products: number
  avg_position: number | null
  median_position: number | null
  common_categories: [string, number][]
  aggregated_at: string
}
