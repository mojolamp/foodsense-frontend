export interface TokenRanking {
  token: string
  occurrence_count: number
  affected_products: number
  sample_products: string[]
  last_seen: string
}

export interface TokenDetail {
  token: string
  occurrence_count: number
  affected_products: number
  sample_products: ProductSample[]
  contexts: TokenContext[]
}

export interface ProductSample {
  product_id: string
  product_name: string
  context: string
}

export interface TokenContext {
  parent_token?: string
  position: string
  full_text: string
}

export interface CorrectionRequest {
  token: string
  standard_name: string
  create_rule: boolean
  affected_product_ids?: string[]
}

export interface Additive {
  code?: string
  name: string
  category?: string
  risk_level?: 'low' | 'medium' | 'high'
  description?: string
}

export interface AdditivesListResponse {
  additives: Additive[]
  total: number
}

export interface DictionaryStatsResponse {
  total_tokens: number
  total_corrections: number
  avg_token_per_product: number
  top_errors: Array<{ token: string; count: number }>
}





