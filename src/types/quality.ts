export interface QualityOverview {
  golden_record_count: number
  tier_a_count: number
  tier_b_count: number
  tier_c_count: number
  avg_source_support: number
  ingredient_coverage_rate: number
  recent_rules_count: number
  recent_corrections_count: number
}

export interface CoverageStats {
  field: string
  coverage_rate: number
  total_products: number
  covered_products: number
}

export interface SourceContribution {
  source: string
  total_products: number
  tier_a_adopted: number
  contribution_rate: number
}

export interface TimelineData {
  date: string
  golden_records: number
  corrections: number
  rules_created: number
}





