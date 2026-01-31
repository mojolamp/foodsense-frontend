/**
 * Zod schemas for Ingestion Gate API responses
 * 提供運行時類型驗證，確保 API 回應符合預期格式
 */

import { z } from 'zod'

// Evidence schema
export const EvidenceSchema = z.object({
  evidence_id: z.string(),
  source_type: z.enum(['OCR_SPAN', 'IMAGE_ROI', 'MANUAL']),
  image_ref: z.string(),
  page: z.number(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  span_id: z.string().optional(),
  text: z.string(),
  char_range: z.tuple([z.number(), z.number()]).optional(),
  ocr_confidence: z.number().optional(),
  preprocess_profile: z.string().optional(),
  created_at: z.string(),
})

// FieldState schema
export const FieldStateSchema = z.object({
  path: z.string(),
  label: z.string(),
  status: z.enum(['EXACT', 'AMBIGUOUS', 'NOT_FOUND']),
  confidence: z.number(),
  source_type: z.enum(['OCR_SPAN', 'IMAGE_ROI', 'MANUAL']),
  evidence: z.array(EvidenceSchema),
})

// Finding schema
export const FindingSchema = z.object({
  rule_id: z.string(),
  rule_version: z.string(),
  severity: z.enum(['BLOCK', 'WARN', 'INFO']),
  field_paths: z.array(z.string()),
  message: z.string(),
  evidence_refs: z.array(z.unknown()),
  suggested_patch: z.array(z.unknown()),
  actionability: z.enum(['ONE_CLICK_FIX', 'NEED_RESCAN', 'NEED_REVIEW', 'NONE']),
})

// ReviewQueueItem schema
export const ReviewQueueItemSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  scan_id: z.string(),
  gate_run_id: z.string(),
  priority: z.number(),
  reason_codes: z.array(z.string()),
  ui_payload: z.object({
    gate_decision: z.enum(['PASS', 'WARN_ALLOW', 'BLOCK']),
    priority: z.number(),
    reason_codes: z.array(z.string()),
    counts: z.object({
      block_findings: z.number(),
      warn_findings: z.number(),
      no_evidence_fields: z.number(),
      ambiguous_fields: z.number(),
      one_click_fix_count: z.number(),
    }),
    field_quality: z.object({
      missing_required_fields: z.array(z.string()),
      low_confidence_fields: z.array(z.string()),
      no_evidence_fields: z.array(z.string()),
    }),
    field_states: z.array(FieldStateSchema).optional(),
    findings: z.array(FindingSchema),
    one_click_fix_count: z.number(),
    missing_evidence_count: z.number(),
  }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED']),
  assignee: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Review Queue Response (array of items)
export const ReviewQueueResponseSchema = z.array(ReviewQueueItemSchema)

// Resolve Review Response
export const ResolveReviewResponseSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  status: z.string().optional(),
})

// Bulk Resolve Response
export const BulkResolveResponseSchema = z.object({
  success: z.boolean(),
  resolved: z.number().optional(),
  failed: z.number().optional(),
  errors: z.array(z.object({
    id: z.string(),
    error: z.string(),
  })).optional(),
})

// Entity Suggest Response
export const EntitySuggestResponseSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  canonical_name: z.string().optional(),
  type: z.string().optional(),
  score: z.number().optional(),
}))

// Type exports
export type ReviewQueueItemValidated = z.infer<typeof ReviewQueueItemSchema>
export type ReviewQueueResponseValidated = z.infer<typeof ReviewQueueResponseSchema>
export type ResolveReviewResponseValidated = z.infer<typeof ResolveReviewResponseSchema>
export type BulkResolveResponseValidated = z.infer<typeof BulkResolveResponseSchema>
export type EntitySuggestResponseValidated = z.infer<typeof EntitySuggestResponseSchema>

/**
 * 驗證 API 回應並返回類型安全的結果
 * 如果驗證失敗，返回 null 並記錄錯誤
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.error(`[API Validation] ${context} validation failed:`, result.error.issues)
    return null
  }
  return result.data
}

/**
 * 驗證 API 回應，失敗時拋出錯誤
 */
export function validateResponseStrict<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(`[API Validation] ${context}: ${errorMsg}`)
  }
  return result.data
}
