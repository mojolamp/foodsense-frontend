export interface Product {
  id: string
  golden_record_id?: string
  product_name: string
  brand?: string
  barcode?: string
  tier: 'A' | 'B' | 'C'
  source_count: number
  is_golden: boolean
  vegan_type?: string
  created_at: string
  updated_at: string
}

export interface GoldenRecord {
  golden_record_id: string
  product_name: string
  brand?: string
  vegan_type?: string
  ingredients_flat_tokens: string[]
  ingredients_structure?: IngredientsStructure
  additive_markers: AdditiveMarker[]
  nutrition_per_100g?: NutritionData
  allergens?: string[]
  tier: 'A' | 'B' | 'C'
}

export interface IngredientsStructure {
  [key: string]: any
}

export interface AdditiveMarker {
  name: string
  is_upf_marker: boolean
  risk_level: number
  e_code?: string
}

export interface NutritionData {
  [key: string]: any
}

export interface ProductVariant {
  variant_id: string
  source: string
  original_name: string
  original_ingredients: string
  url?: string
  scraped_at: string
}

export interface ProductFilters {
  search?: string
  tier?: 'A' | 'B' | 'C'
  source?: string
  is_golden?: boolean
  vegan_type?: string
}


