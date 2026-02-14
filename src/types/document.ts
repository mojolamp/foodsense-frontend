export interface DocumentUploadResponse {
  success: boolean
  document_id: string
  filename: string
  file_type: string
  file_size: number
  pages?: number
  has_nutrition_data?: boolean
  message: string
}

export interface DocumentDetail {
  id: string
  filename: string
  file_type: string
  file_size: number
  pages?: number
  has_nutrition_data?: boolean
  status: 'processing' | 'ready' | 'failed'
  error_message?: string
  uploaded_at: string
  processed_at?: string
  metadata?: Record<string, unknown>
}

export interface DocumentListResponse {
  success: boolean
  documents: DocumentDetail[]
  total: number
}
