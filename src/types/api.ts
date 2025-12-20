// API 錯誤類型定義
export interface APIError {
  message: string
  status?: number
  code?: string
}

// 建立 API 錯誤的輔助函數
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as APIError).message === 'string'
  )
}

// 獲取錯誤訊息的輔助函數
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return '發生未知錯誤'
}

// 批次審核模板類型
export interface BatchReviewTemplate {
  data_quality_score: number
  confidence_score: number
  is_gold: boolean
  review_notes?: string
}

// 通用的 JSON 資料類型 (用於替代 any)
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
