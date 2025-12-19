export interface Rule {
  rule_id: string
  pattern: string
  replacement: string
  target_field: 'ingredient_token' | 'product_name' | 'brand'
  rule_type: 'exact' | 'regex' | 'fuzzy'
  hit_count: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  description?: string
  last_hit_at?: string
}

export interface RuleCreate {
  pattern: string
  replacement: string
  target_field: 'ingredient_token' | 'product_name' | 'brand'
  rule_type: 'exact' | 'regex' | 'fuzzy'
  description?: string
}

export interface RuleUpdate {
  replacement?: string
  is_active?: boolean
  description?: string
}

export interface RuleTestRequest {
  rule_id: string
  test_input: string
}

export interface RuleTestResult {
  matched: boolean
  original: string
  transformed: string
  explanation: string
}


