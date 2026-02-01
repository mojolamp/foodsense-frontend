/**
 * Ingestion Gate Schemas Tests
 *
 * @module lib/api/schemas/ingestionGate.test
 */

import { describe, it, expect, vi } from 'vitest'
import {
  EvidenceSchema,
  FieldStateSchema,
  FindingSchema,
  ReviewQueueItemSchema,
  ReviewQueueResponseSchema,
  ResolveReviewResponseSchema,
  BulkResolveResponseSchema,
  EntitySuggestResponseSchema,
  validateResponse,
  validateResponseStrict,
} from './ingestionGate'

describe('EvidenceSchema', () => {
  const validEvidence = {
    evidence_id: 'ev-001',
    source_type: 'OCR_SPAN' as const,
    image_ref: 'img-001.png',
    page: 1,
    bbox: [10, 20, 100, 50] as [number, number, number, number],
    text: 'Sample OCR text',
    created_at: '2024-01-01T00:00:00Z',
  }

  it('should validate valid evidence', () => {
    const result = EvidenceSchema.safeParse(validEvidence)
    expect(result.success).toBe(true)
  })

  it('should validate evidence with optional fields', () => {
    const evidenceWithOptional = {
      ...validEvidence,
      span_id: 'span-001',
      char_range: [0, 15] as [number, number],
      ocr_confidence: 0.95,
      preprocess_profile: 'default',
    }
    const result = EvidenceSchema.safeParse(evidenceWithOptional)
    expect(result.success).toBe(true)
  })

  it('should reject invalid source_type', () => {
    const invalid = { ...validEvidence, source_type: 'INVALID' }
    const result = EvidenceSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject invalid bbox format', () => {
    const invalid = { ...validEvidence, bbox: [10, 20] }
    const result = EvidenceSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should accept all valid source_types', () => {
    const sourceTypes = ['OCR_SPAN', 'IMAGE_ROI', 'MANUAL'] as const
    sourceTypes.forEach((sourceType) => {
      const result = EvidenceSchema.safeParse({ ...validEvidence, source_type: sourceType })
      expect(result.success).toBe(true)
    })
  })
})

describe('FieldStateSchema', () => {
  const validEvidence = {
    evidence_id: 'ev-001',
    source_type: 'OCR_SPAN' as const,
    image_ref: 'img-001.png',
    page: 1,
    bbox: [10, 20, 100, 50] as [number, number, number, number],
    text: 'Sample text',
    created_at: '2024-01-01T00:00:00Z',
  }

  const validFieldState = {
    path: 'product.name',
    label: 'Product Name',
    status: 'EXACT' as const,
    confidence: 0.95,
    source_type: 'OCR_SPAN' as const,
    evidence: [validEvidence],
  }

  it('should validate valid field state', () => {
    const result = FieldStateSchema.safeParse(validFieldState)
    expect(result.success).toBe(true)
  })

  it('should accept all valid statuses', () => {
    const statuses = ['EXACT', 'AMBIGUOUS', 'NOT_FOUND'] as const
    statuses.forEach((status) => {
      const result = FieldStateSchema.safeParse({ ...validFieldState, status })
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid status', () => {
    const invalid = { ...validFieldState, status: 'INVALID' }
    const result = FieldStateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should validate empty evidence array', () => {
    const withEmptyEvidence = { ...validFieldState, evidence: [] }
    const result = FieldStateSchema.safeParse(withEmptyEvidence)
    expect(result.success).toBe(true)
  })
})

describe('FindingSchema', () => {
  const validFinding = {
    rule_id: 'rule-001',
    rule_version: '1.0.0',
    severity: 'WARN' as const,
    field_paths: ['product.name', 'product.description'],
    message: 'Name field confidence is low',
    evidence_refs: [],
    suggested_patch: [],
    actionability: 'ONE_CLICK_FIX' as const,
  }

  it('should validate valid finding', () => {
    const result = FindingSchema.safeParse(validFinding)
    expect(result.success).toBe(true)
  })

  it('should accept all valid severities', () => {
    const severities = ['BLOCK', 'WARN', 'INFO'] as const
    severities.forEach((severity) => {
      const result = FindingSchema.safeParse({ ...validFinding, severity })
      expect(result.success).toBe(true)
    })
  })

  it('should accept all valid actionabilities', () => {
    const actionabilities = ['ONE_CLICK_FIX', 'NEED_RESCAN', 'NEED_REVIEW', 'NONE'] as const
    actionabilities.forEach((actionability) => {
      const result = FindingSchema.safeParse({ ...validFinding, actionability })
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid severity', () => {
    const invalid = { ...validFinding, severity: 'CRITICAL' }
    const result = FindingSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('ReviewQueueItemSchema', () => {
  const validItem = {
    id: 'review-001',
    tenant_id: 'tenant-001',
    scan_id: 'scan-001',
    gate_run_id: 'gate-001',
    priority: 1,
    reason_codes: ['LOW_CONFIDENCE', 'MISSING_FIELD'],
    ui_payload: {
      gate_decision: 'WARN_ALLOW' as const,
      priority: 1,
      reason_codes: ['LOW_CONFIDENCE'],
      counts: {
        block_findings: 0,
        warn_findings: 2,
        no_evidence_fields: 1,
        ambiguous_fields: 3,
        one_click_fix_count: 1,
      },
      field_quality: {
        missing_required_fields: ['expiry_date'],
        low_confidence_fields: ['brand'],
        no_evidence_fields: ['origin'],
      },
      findings: [],
      one_click_fix_count: 1,
      missing_evidence_count: 1,
    },
    status: 'OPEN' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('should validate valid review queue item', () => {
    const result = ReviewQueueItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('should validate item with optional assignee', () => {
    const withAssignee = { ...validItem, assignee: 'user@example.com' }
    const result = ReviewQueueItemSchema.safeParse(withAssignee)
    expect(result.success).toBe(true)
  })

  it('should accept all valid statuses', () => {
    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'] as const
    statuses.forEach((status) => {
      const result = ReviewQueueItemSchema.safeParse({ ...validItem, status })
      expect(result.success).toBe(true)
    })
  })

  it('should accept all valid gate_decisions', () => {
    const decisions = ['PASS', 'WARN_ALLOW', 'BLOCK'] as const
    decisions.forEach((gate_decision) => {
      const item = {
        ...validItem,
        ui_payload: { ...validItem.ui_payload, gate_decision },
      }
      const result = ReviewQueueItemSchema.safeParse(item)
      expect(result.success).toBe(true)
    })
  })

  it('should validate item with optional field_states', () => {
    const withFieldStates = {
      ...validItem,
      ui_payload: {
        ...validItem.ui_payload,
        field_states: [
          {
            path: 'product.name',
            label: 'Name',
            status: 'EXACT' as const,
            confidence: 0.95,
            source_type: 'OCR_SPAN' as const,
            evidence: [],
          },
        ],
      },
    }
    const result = ReviewQueueItemSchema.safeParse(withFieldStates)
    expect(result.success).toBe(true)
  })
})

describe('ReviewQueueResponseSchema', () => {
  it('should validate empty array', () => {
    const result = ReviewQueueResponseSchema.safeParse([])
    expect(result.success).toBe(true)
  })

  it('should validate array of items', () => {
    const items = [
      {
        id: 'review-001',
        tenant_id: 'tenant-001',
        scan_id: 'scan-001',
        gate_run_id: 'gate-001',
        priority: 1,
        reason_codes: [],
        ui_payload: {
          gate_decision: 'PASS',
          priority: 1,
          reason_codes: [],
          counts: {
            block_findings: 0,
            warn_findings: 0,
            no_evidence_fields: 0,
            ambiguous_fields: 0,
            one_click_fix_count: 0,
          },
          field_quality: {
            missing_required_fields: [],
            low_confidence_fields: [],
            no_evidence_fields: [],
          },
          findings: [],
          one_click_fix_count: 0,
          missing_evidence_count: 0,
        },
        status: 'OPEN',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]
    const result = ReviewQueueResponseSchema.safeParse(items)
    expect(result.success).toBe(true)
  })
})

describe('ResolveReviewResponseSchema', () => {
  it('should validate success response', () => {
    const response = { success: true }
    const result = ResolveReviewResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate response with optional fields', () => {
    const response = { success: true, id: 'review-001', status: 'RESOLVED' }
    const result = ResolveReviewResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should reject invalid response', () => {
    const response = { success: 'yes' }
    const result = ResolveReviewResponseSchema.safeParse(response)
    expect(result.success).toBe(false)
  })
})

describe('BulkResolveResponseSchema', () => {
  it('should validate minimal response', () => {
    const response = { success: true }
    const result = BulkResolveResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate full response', () => {
    const response = {
      success: true,
      resolved: 5,
      failed: 1,
      errors: [{ id: 'review-001', error: 'Not found' }],
    }
    const result = BulkResolveResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })
})

describe('EntitySuggestResponseSchema', () => {
  it('should validate empty array', () => {
    const result = EntitySuggestResponseSchema.safeParse([])
    expect(result.success).toBe(true)
  })

  it('should validate array of suggestions', () => {
    const suggestions = [
      { id: 'entity-001', name: 'Sugar' },
      { id: 'entity-002', name: 'Salt', canonical_name: 'Sodium Chloride' },
      { id: 'entity-003', name: 'MSG', type: 'additive', score: 0.95 },
    ]
    const result = EntitySuggestResponseSchema.safeParse(suggestions)
    expect(result.success).toBe(true)
  })
})

describe('validateResponse', () => {
  it('should return data on valid input', () => {
    const schema = ResolveReviewResponseSchema
    const data = { success: true }
    const result = validateResponse(schema, data, 'test')
    expect(result).toEqual({ success: true })
  })

  it('should return null on invalid input', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const schema = ResolveReviewResponseSchema
    const data = { invalid: 'data' }
    const result = validateResponse(schema, data, 'test context')
    expect(result).toBeNull()
    consoleSpy.mockRestore()
  })

  it('should log error on validation failure', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const schema = ResolveReviewResponseSchema
    const data = { invalid: 'data' }
    validateResponse(schema, data, 'test context')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[API Validation] test context validation failed:'),
      expect.any(Array)
    )
    consoleSpy.mockRestore()
  })
})

describe('validateResponseStrict', () => {
  it('should return data on valid input', () => {
    const schema = ResolveReviewResponseSchema
    const data = { success: true }
    const result = validateResponseStrict(schema, data, 'test')
    expect(result).toEqual({ success: true })
  })

  it('should throw error on invalid input', () => {
    const schema = ResolveReviewResponseSchema
    const data = { invalid: 'data' }
    expect(() => validateResponseStrict(schema, data, 'test context')).toThrow(
      '[API Validation] test context:'
    )
  })

  it('should include field path in error message', () => {
    const schema = ResolveReviewResponseSchema
    const data = { success: 'not a boolean' }
    expect(() => validateResponseStrict(schema, data, 'test')).toThrow('success:')
  })
})
