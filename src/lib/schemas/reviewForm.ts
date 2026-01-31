/**
 * Review Form Schemas
 *
 * 共用的審核表單 Zod 驗證 Schema
 * 用於 ReviewModal 和 BatchReviewModal
 */

import { z } from 'zod'

/**
 * Review 常數定義
 */
export const REVIEW_CONSTANTS = {
  /** 品質分數範圍 */
  QUALITY_MIN: 1,
  QUALITY_MAX: 10,
  QUALITY_DEFAULT: 8,

  /** 信心度範圍 */
  CONFIDENCE_MIN: 0,
  CONFIDENCE_MAX: 1,
  CONFIDENCE_DEFAULT: 0.9,

  /** 黃金樣本條件 */
  GOLD_MIN_QUALITY: 8,
  GOLD_MIN_CONFIDENCE: 0.85,
  GOLD_MIN_NOTES_LENGTH: 10,

  /** 邏輯一致性閾值 */
  HIGH_QUALITY_THRESHOLD: 8,
  LOW_QUALITY_THRESHOLD: 4,
  HIGH_CONFIDENCE_THRESHOLD: 0.7,

  /** 緊急閾值 */
  URGENT_HOURS: 24,
} as const

/**
 * 基礎審核表單 Schema
 */
export const baseReviewFormSchema = z.object({
  data_quality_score: z
    .number()
    .int('品質分數必須是整數')
    .min(REVIEW_CONSTANTS.QUALITY_MIN, `品質分數最低為 ${REVIEW_CONSTANTS.QUALITY_MIN}`)
    .max(REVIEW_CONSTANTS.QUALITY_MAX, `品質分數最高為 ${REVIEW_CONSTANTS.QUALITY_MAX}`),
  confidence_score: z
    .number()
    .min(REVIEW_CONSTANTS.CONFIDENCE_MIN, `信心分數最低為 ${REVIEW_CONSTANTS.CONFIDENCE_MIN}`)
    .max(REVIEW_CONSTANTS.CONFIDENCE_MAX, `信心分數最高為 ${REVIEW_CONSTANTS.CONFIDENCE_MAX}`),
  review_notes: z.string().optional(),
  is_gold: z.boolean(),
})

/**
 * 完整審核表單 Schema（含驗證邏輯）
 */
export const reviewFormSchema = baseReviewFormSchema
  .refine(
    (data) => {
      // 黃金樣本驗證規則
      if (data.is_gold) {
        return (
          data.data_quality_score >= REVIEW_CONSTANTS.GOLD_MIN_QUALITY &&
          data.confidence_score >= REVIEW_CONSTANTS.GOLD_MIN_CONFIDENCE &&
          data.review_notes &&
          data.review_notes.length >= REVIEW_CONSTANTS.GOLD_MIN_NOTES_LENGTH
        )
      }
      return true
    },
    {
      message: `黃金樣本需要：品質分數≥${REVIEW_CONSTANTS.GOLD_MIN_QUALITY}、信心度≥${REVIEW_CONSTANTS.GOLD_MIN_CONFIDENCE}、且備註至少${REVIEW_CONSTANTS.GOLD_MIN_NOTES_LENGTH}個字`,
      path: ['is_gold'],
    }
  )
  .refine(
    (data) => {
      // 邏輯一致性驗證：高品質應該有高信心度
      if (
        data.data_quality_score >= REVIEW_CONSTANTS.HIGH_QUALITY_THRESHOLD &&
        data.confidence_score < REVIEW_CONSTANTS.HIGH_CONFIDENCE_THRESHOLD
      ) {
        return false
      }
      return true
    },
    {
      message: `高品質評分(≥${REVIEW_CONSTANTS.HIGH_QUALITY_THRESHOLD})應該搭配較高的信心度(≥${REVIEW_CONSTANTS.HIGH_CONFIDENCE_THRESHOLD})`,
      path: ['confidence_score'],
    }
  )
  .refine(
    (data) => {
      // 邏輯一致性驗證：低品質不應該有過高信心度
      if (
        data.data_quality_score <= REVIEW_CONSTANTS.LOW_QUALITY_THRESHOLD &&
        data.confidence_score > REVIEW_CONSTANTS.HIGH_CONFIDENCE_THRESHOLD
      ) {
        return false
      }
      return true
    },
    {
      message: `低品質評分(≤${REVIEW_CONSTANTS.LOW_QUALITY_THRESHOLD})不應搭配過高的信心度(>${REVIEW_CONSTANTS.HIGH_CONFIDENCE_THRESHOLD})`,
      path: ['confidence_score'],
    }
  )

/**
 * 批次審核模板 Schema
 */
export const batchReviewTemplateSchema = z.object({
  data_quality_score: z
    .number()
    .int('品質分數必須是整數')
    .min(REVIEW_CONSTANTS.QUALITY_MIN)
    .max(REVIEW_CONSTANTS.QUALITY_MAX),
  confidence_score: z.number().min(REVIEW_CONSTANTS.CONFIDENCE_MIN).max(REVIEW_CONSTANTS.CONFIDENCE_MAX),
})

/**
 * 型別定義
 */
export type ReviewFormData = z.infer<typeof reviewFormSchema>
export type BatchReviewTemplateData = z.infer<typeof batchReviewTemplateSchema>

/**
 * 預設值
 */
export const defaultReviewFormValues: ReviewFormData = {
  data_quality_score: REVIEW_CONSTANTS.QUALITY_DEFAULT,
  confidence_score: REVIEW_CONSTANTS.CONFIDENCE_DEFAULT,
  review_notes: '',
  is_gold: false,
}

export const defaultBatchReviewTemplateValues: BatchReviewTemplateData = {
  data_quality_score: REVIEW_CONSTANTS.QUALITY_DEFAULT,
  confidence_score: REVIEW_CONSTANTS.CONFIDENCE_DEFAULT,
}

/**
 * 驗證輔助函數
 */
export function isGoldEligible(data: Pick<ReviewFormData, 'data_quality_score' | 'confidence_score' | 'review_notes'>) {
  return (
    data.data_quality_score >= REVIEW_CONSTANTS.GOLD_MIN_QUALITY &&
    data.confidence_score >= REVIEW_CONSTANTS.GOLD_MIN_CONFIDENCE &&
    (data.review_notes?.length || 0) >= REVIEW_CONSTANTS.GOLD_MIN_NOTES_LENGTH
  )
}

export function getQualityLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= REVIEW_CONSTANTS.LOW_QUALITY_THRESHOLD) return 'low'
  if (score >= REVIEW_CONSTANTS.HIGH_QUALITY_THRESHOLD) return 'high'
  return 'medium'
}

export function getConfidenceLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 0.5) return 'low'
  if (score >= REVIEW_CONSTANTS.HIGH_CONFIDENCE_THRESHOLD) return 'high'
  return 'medium'
}
