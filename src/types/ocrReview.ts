export interface OCRReviewItem {
  id: string
  image_url: string
  ocr_text: string
  confidence: number
  product_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  corrected_text: string | null
  reviewer_id: string | null
  review_note: string | null
  created_at: string
  reviewed_at: string | null
}

export interface OCRReviewStats {
  pending: number
  approved: number
  rejected: number
  avg_confidence: number
}

export interface OCRReviewListResponse {
  items: OCRReviewItem[]
  total: number
  limit: number
  offset: number
}

export interface ApproveOCRReviewRequest {
  corrected_text?: string
  reviewer_id: string
}

export interface RejectOCRReviewRequest {
  reason: string
  reviewer_id: string
}

export interface OCRReviewActionResponse {
  success: boolean
  id: string
  status: string
  message: string
}
