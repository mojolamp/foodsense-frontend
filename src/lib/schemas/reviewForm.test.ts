/**
 * Review Form Schema Tests
 *
 * @module lib/schemas/reviewForm.test
 */

import { describe, it, expect } from 'vitest'
import {
  REVIEW_CONSTANTS,
  baseReviewFormSchema,
  reviewFormSchema,
  batchReviewTemplateSchema,
  defaultReviewFormValues,
  defaultBatchReviewTemplateValues,
  isGoldEligible,
  getQualityLevel,
  getConfidenceLevel,
} from './reviewForm'

describe('REVIEW_CONSTANTS', () => {
  it('should have correct quality score range', () => {
    expect(REVIEW_CONSTANTS.QUALITY_MIN).toBe(1)
    expect(REVIEW_CONSTANTS.QUALITY_MAX).toBe(10)
    expect(REVIEW_CONSTANTS.QUALITY_DEFAULT).toBe(8)
  })

  it('should have correct confidence score range', () => {
    expect(REVIEW_CONSTANTS.CONFIDENCE_MIN).toBe(0)
    expect(REVIEW_CONSTANTS.CONFIDENCE_MAX).toBe(1)
    expect(REVIEW_CONSTANTS.CONFIDENCE_DEFAULT).toBe(0.9)
  })

  it('should have correct gold sample thresholds', () => {
    expect(REVIEW_CONSTANTS.GOLD_MIN_QUALITY).toBe(8)
    expect(REVIEW_CONSTANTS.GOLD_MIN_CONFIDENCE).toBe(0.85)
    expect(REVIEW_CONSTANTS.GOLD_MIN_NOTES_LENGTH).toBe(10)
  })
})

describe('baseReviewFormSchema', () => {
  it('should accept valid data', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 8,
      confidence_score: 0.9,
      review_notes: 'Test notes',
      is_gold: false,
    })

    expect(result.success).toBe(true)
  })

  it('should reject quality score below min', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 0,
      confidence_score: 0.9,
      review_notes: '',
      is_gold: false,
    })

    expect(result.success).toBe(false)
  })

  it('should reject quality score above max', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 11,
      confidence_score: 0.9,
      review_notes: '',
      is_gold: false,
    })

    expect(result.success).toBe(false)
  })

  it('should reject non-integer quality score', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 7.5,
      confidence_score: 0.9,
      review_notes: '',
      is_gold: false,
    })

    expect(result.success).toBe(false)
  })

  it('should reject confidence score below min', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 8,
      confidence_score: -0.1,
      review_notes: '',
      is_gold: false,
    })

    expect(result.success).toBe(false)
  })

  it('should reject confidence score above max', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 8,
      confidence_score: 1.1,
      review_notes: '',
      is_gold: false,
    })

    expect(result.success).toBe(false)
  })

  it('should allow optional review_notes', () => {
    const result = baseReviewFormSchema.safeParse({
      data_quality_score: 8,
      confidence_score: 0.9,
      is_gold: false,
    })

    expect(result.success).toBe(true)
  })
})

describe('reviewFormSchema', () => {
  describe('gold sample validation', () => {
    it('should accept valid gold sample', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.9,
        review_notes: 'This is a valid gold sample note.',
        is_gold: true,
      })

      expect(result.success).toBe(true)
    })

    it('should reject gold sample with low quality score', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 7,
        confidence_score: 0.9,
        review_notes: 'This is a valid gold sample note.',
        is_gold: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('is_gold')
      }
    })

    it('should reject gold sample with low confidence', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.8,
        review_notes: 'This is a valid gold sample note.',
        is_gold: true,
      })

      expect(result.success).toBe(false)
    })

    it('should reject gold sample with short notes', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.9,
        review_notes: 'Short',
        is_gold: true,
      })

      expect(result.success).toBe(false)
    })

    it('should reject gold sample without notes', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.9,
        is_gold: true,
      })

      expect(result.success).toBe(false)
    })
  })

  describe('logical consistency validation', () => {
    it('should reject high quality with low confidence', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.5,
        review_notes: '',
        is_gold: false,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confidence_score')
      }
    })

    it('should accept high quality with high confidence', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 9,
        confidence_score: 0.8,
        review_notes: '',
        is_gold: false,
      })

      expect(result.success).toBe(true)
    })

    it('should reject low quality with high confidence', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 3,
        confidence_score: 0.9,
        review_notes: '',
        is_gold: false,
      })

      expect(result.success).toBe(false)
    })

    it('should accept low quality with low confidence', () => {
      const result = reviewFormSchema.safeParse({
        data_quality_score: 3,
        confidence_score: 0.5,
        review_notes: '',
        is_gold: false,
      })

      expect(result.success).toBe(true)
    })

    it('should accept medium quality with any valid confidence', () => {
      const result1 = reviewFormSchema.safeParse({
        data_quality_score: 6,
        confidence_score: 0.3,
        review_notes: '',
        is_gold: false,
      })

      const result2 = reviewFormSchema.safeParse({
        data_quality_score: 6,
        confidence_score: 0.9,
        review_notes: '',
        is_gold: false,
      })

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})

describe('batchReviewTemplateSchema', () => {
  it('should accept valid template data', () => {
    const result = batchReviewTemplateSchema.safeParse({
      data_quality_score: 8,
      confidence_score: 0.9,
    })

    expect(result.success).toBe(true)
  })

  it('should reject invalid quality score', () => {
    const result = batchReviewTemplateSchema.safeParse({
      data_quality_score: 0,
      confidence_score: 0.9,
    })

    expect(result.success).toBe(false)
  })

  it('should reject invalid confidence score', () => {
    const result = batchReviewTemplateSchema.safeParse({
      data_quality_score: 8,
      confidence_score: 1.5,
    })

    expect(result.success).toBe(false)
  })
})

describe('default values', () => {
  it('defaultReviewFormValues should be valid', () => {
    const result = reviewFormSchema.safeParse(defaultReviewFormValues)
    expect(result.success).toBe(true)
  })

  it('defaultBatchReviewTemplateValues should be valid', () => {
    const result = batchReviewTemplateSchema.safeParse(defaultBatchReviewTemplateValues)
    expect(result.success).toBe(true)
  })
})

describe('isGoldEligible', () => {
  it('should return true for eligible data', () => {
    expect(
      isGoldEligible({
        data_quality_score: 9,
        confidence_score: 0.9,
        review_notes: 'This is a long enough note for gold.',
      })
    ).toBe(true)
  })

  it('should return false for low quality', () => {
    expect(
      isGoldEligible({
        data_quality_score: 7,
        confidence_score: 0.9,
        review_notes: 'This is a long enough note for gold.',
      })
    ).toBe(false)
  })

  it('should return false for low confidence', () => {
    expect(
      isGoldEligible({
        data_quality_score: 9,
        confidence_score: 0.8,
        review_notes: 'This is a long enough note for gold.',
      })
    ).toBe(false)
  })

  it('should return false for short notes', () => {
    expect(
      isGoldEligible({
        data_quality_score: 9,
        confidence_score: 0.9,
        review_notes: 'Short',
      })
    ).toBe(false)
  })

  it('should return false for undefined notes', () => {
    expect(
      isGoldEligible({
        data_quality_score: 9,
        confidence_score: 0.9,
        review_notes: undefined,
      })
    ).toBe(false)
  })
})

describe('getQualityLevel', () => {
  it('should return low for scores <= 4', () => {
    expect(getQualityLevel(1)).toBe('low')
    expect(getQualityLevel(4)).toBe('low')
  })

  it('should return medium for scores between 5 and 7', () => {
    expect(getQualityLevel(5)).toBe('medium')
    expect(getQualityLevel(6)).toBe('medium')
    expect(getQualityLevel(7)).toBe('medium')
  })

  it('should return high for scores >= 8', () => {
    expect(getQualityLevel(8)).toBe('high')
    expect(getQualityLevel(10)).toBe('high')
  })
})

describe('getConfidenceLevel', () => {
  it('should return low for scores < 0.5', () => {
    expect(getConfidenceLevel(0)).toBe('low')
    expect(getConfidenceLevel(0.3)).toBe('low')
    expect(getConfidenceLevel(0.49)).toBe('low')
  })

  it('should return medium for scores between 0.5 and 0.7', () => {
    expect(getConfidenceLevel(0.5)).toBe('medium')
    expect(getConfidenceLevel(0.6)).toBe('medium')
    expect(getConfidenceLevel(0.69)).toBe('medium')
  })

  it('should return high for scores >= 0.7', () => {
    expect(getConfidenceLevel(0.7)).toBe('high')
    expect(getConfidenceLevel(0.9)).toBe('high')
    expect(getConfidenceLevel(1)).toBe('high')
  })
})
