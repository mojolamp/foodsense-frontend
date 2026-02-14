export interface DOMRepairItem {
  id: string
  site_name: string
  selector_path: string
  suggested_fix: string
  failure_signature: string
  last_working: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface DOMRepairStats {
  pending: number
  approved: number
  rejected: number
  avg_confidence: number
}

export interface RepairActionResponse {
  success: boolean
  repair_id: string
  status: string
  message: string
}

export interface RepairsPendingResponse {
  success: boolean
  repairs: DOMRepairItem[]
  total: number
}
