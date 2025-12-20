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

// 符合 react-tree-graph 的 Data 介面
export interface TreeNode {
  name: string
  children?: TreeNode[]
}

export interface IngredientNode extends TreeNode {
  percentage?: number
  origin?: string
}

// IngredientsStructure 必須是 TreeNode 類型以供 AnimatedTree 使用
export type IngredientsStructure = TreeNode

export interface AdditiveMarker {
  name: string
  is_upf_marker: boolean
  risk_level: number
  e_code?: string
}

export interface NutritionData {
  energy_kcal?: number
  protein_g?: number
  carbohydrate_g?: number
  sugar_g?: number
  fat_g?: number
  saturated_fat_g?: number
  fiber_g?: number
  sodium_mg?: number
  [key: string]: number | string | undefined
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


