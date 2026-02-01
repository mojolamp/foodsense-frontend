/**
 * Priority Calculator Tests
 *
 * @module lib/priorityCalculator.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculatePriorityScore,
  sortByPriority,
  getRecommendedReviews,
  getPriorityColor,
  getPriorityLabel,
} from './priorityCalculator'
import type { OCRRecord } from '@/types/review'

// Helper to create mock OCR record
function createMockRecord(overrides: Partial<OCRRecord> = {}): OCRRecord {
  return {
    id: 'record-1',
    product_id: 'prod-1',
    source_type: 'user_upload',
    ocr_raw_text: 'Sample OCR text for testing purposes',
    confidence_level: 'MEDIUM',
    logic_validation_status: 'PASS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as OCRRecord
}

describe('Priority Calculator', () => {
  describe('calculatePriorityScore', () => {
    it('should return a score between 0 and 100', () => {
      const record = createMockRecord()
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should use balanced strategy by default', () => {
      const record = createMockRecord()
      const defaultScore = calculatePriorityScore(record)
      const balancedScore = calculatePriorityScore(record, 'balanced')

      expect(defaultScore).toBe(balancedScore)
    })

    it('should give higher scores to older records', () => {
      const recentRecord = createMockRecord({
        created_at: new Date().toISOString(),
      })
      const oldRecord = createMockRecord({
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72 hours ago
      })

      const recentScore = calculatePriorityScore(recentRecord)
      const oldScore = calculatePriorityScore(oldRecord)

      expect(oldScore).toBeGreaterThan(recentScore)
    })

    it('should give higher scores to FAIL validation status', () => {
      const passRecord = createMockRecord({ logic_validation_status: 'PASS' })
      const failRecord = createMockRecord({ logic_validation_status: 'FAIL' })

      const passScore = calculatePriorityScore(passRecord)
      const failScore = calculatePriorityScore(failRecord)

      expect(failScore).toBeGreaterThan(passScore)
    })

    it('should give higher scores to LOW confidence records', () => {
      const highConfidence = createMockRecord({ confidence_level: 'HIGH' })
      const lowConfidence = createMockRecord({ confidence_level: 'LOW' })

      const highScore = calculatePriorityScore(highConfidence)
      const lowScore = calculatePriorityScore(lowConfidence)

      expect(lowScore).toBeGreaterThan(highScore)
    })

    it('should consider source_type in business score', () => {
      const officialRecord = createMockRecord({ source_type: 'official_website' })
      const scraperRecord = createMockRecord({ source_type: 'scraper' })

      const officialScore = calculatePriorityScore(officialRecord)
      const scraperScore = calculatePriorityScore(scraperRecord)

      expect(officialScore).toBeGreaterThan(scraperScore)
    })

    it('should use quick_wins strategy correctly', () => {
      const record = createMockRecord()
      const score = calculatePriorityScore(record, 'quick_wins')

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should use urgent_first strategy correctly', () => {
      const oldRecord = createMockRecord({
        created_at: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
      })
      const score = calculatePriorityScore(oldRecord, 'urgent_first')

      // urgent_first gives higher weight to urgency
      expect(score).toBeGreaterThan(50)
    })

    it('should use quality_impact strategy correctly', () => {
      const lowConfidenceRecord = createMockRecord({
        confidence_level: 'LOW',
        logic_validation_status: 'FAIL',
      })
      const score = calculatePriorityScore(lowConfidenceRecord, 'quality_impact')

      // quality_impact gives higher weight to quality
      expect(score).toBeGreaterThan(50)
    })

    it('should handle records with no ocr_raw_text', () => {
      const record = createMockRecord({ ocr_raw_text: undefined })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle short OCR text (simple complexity)', () => {
      const record = createMockRecord({ ocr_raw_text: 'Short text' })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle long OCR text (complex)', () => {
      const record = createMockRecord({
        ocr_raw_text: 'x'.repeat(1500), // Very long text
      })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle WARN validation status', () => {
      const record = createMockRecord({ logic_validation_status: 'WARN' })
      const passRecord = createMockRecord({ logic_validation_status: 'PASS' })

      const warnScore = calculatePriorityScore(record)
      const passScore = calculatePriorityScore(passRecord)

      expect(warnScore).toBeGreaterThan(passScore)
    })

    it('should handle retailer source type', () => {
      const record = createMockRecord({ source_type: 'retailer' })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle unknown source type', () => {
      const record = createMockRecord({ source_type: 'unknown_source' as any })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle medium OCR text length (100-500)', () => {
      const record = createMockRecord({ ocr_raw_text: 'x'.repeat(300) })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle complex OCR text length (500-1000)', () => {
      const record = createMockRecord({ ocr_raw_text: 'x'.repeat(750) })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle wait time 6-24 hours', () => {
      const record = createMockRecord({
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle wait time 24-72 hours', () => {
      const record = createMockRecord({
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      })
      const score = calculatePriorityScore(record)

      expect(score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('sortByPriority', () => {
    it('should sort records by priority score in descending order', () => {
      const records = [
        createMockRecord({ id: '1', confidence_level: 'HIGH' }),
        createMockRecord({ id: '2', confidence_level: 'LOW' }),
        createMockRecord({ id: '3', confidence_level: 'MEDIUM' }),
      ]

      const sorted = sortByPriority(records)

      // LOW confidence should have highest priority
      expect(sorted[0].confidence_level).toBe('LOW')
    })

    it('should add priority_score to each record', () => {
      const records = [createMockRecord()]
      const sorted = sortByPriority(records)

      expect(sorted[0].priority_score).toBeDefined()
      expect(typeof sorted[0].priority_score).toBe('number')
    })

    it('should use balanced strategy by default', () => {
      const records = [createMockRecord()]
      const sortedDefault = sortByPriority(records)
      const sortedBalanced = sortByPriority(records, 'balanced')

      expect(sortedDefault[0].priority_score).toBe(sortedBalanced[0].priority_score)
    })

    it('should work with empty array', () => {
      const sorted = sortByPriority([])
      expect(sorted).toEqual([])
    })

    it('should maintain correct order with multiple strategies', () => {
      const records = [
        createMockRecord({ id: '1', created_at: new Date().toISOString() }),
        createMockRecord({
          id: '2',
          created_at: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
        }),
      ]

      const sortedUrgent = sortByPriority(records, 'urgent_first')

      // Older record should be first with urgent_first strategy
      expect(sortedUrgent[0].id).toBe('2')
    })
  })

  describe('getRecommendedReviews', () => {
    it('should return limited number of records', () => {
      const records = Array.from({ length: 20 }, (_, i) =>
        createMockRecord({ id: `record-${i}` })
      )

      const recommended = getRecommendedReviews(records, 5)

      expect(recommended.length).toBe(5)
    })

    it('should return sorted by priority', () => {
      const records = [
        createMockRecord({ id: '1', confidence_level: 'HIGH' }),
        createMockRecord({ id: '2', confidence_level: 'LOW' }),
      ]

      const recommended = getRecommendedReviews(records, 10)

      expect(recommended[0].confidence_level).toBe('LOW')
    })

    it('should use default limit of 10', () => {
      const records = Array.from({ length: 20 }, (_, i) =>
        createMockRecord({ id: `record-${i}` })
      )

      const recommended = getRecommendedReviews(records)

      expect(recommended.length).toBe(10)
    })

    it('should return all records if less than limit', () => {
      const records = [createMockRecord(), createMockRecord()]

      const recommended = getRecommendedReviews(records, 10)

      expect(recommended.length).toBe(2)
    })

    it('should use balanced strategy by default', () => {
      const records = [createMockRecord()]
      const defaultResult = getRecommendedReviews(records)
      const balancedResult = getRecommendedReviews(records, 10, 'balanced')

      expect(defaultResult[0].priority_score).toBe(balancedResult[0].priority_score)
    })
  })

  describe('getPriorityColor', () => {
    it('should return red for score >= 80', () => {
      const color = getPriorityColor(85)
      expect(color).toContain('red')
    })

    it('should return orange for score >= 60', () => {
      const color = getPriorityColor(65)
      expect(color).toContain('orange')
    })

    it('should return yellow for score >= 40', () => {
      const color = getPriorityColor(45)
      expect(color).toContain('yellow')
    })

    it('should return blue for score >= 20', () => {
      const color = getPriorityColor(25)
      expect(color).toContain('blue')
    })

    it('should return gray for score < 20', () => {
      const color = getPriorityColor(10)
      expect(color).toContain('gray')
    })

    it('should return correct classes for score of 100', () => {
      const color = getPriorityColor(100)
      expect(color).toBe('text-red-600 bg-red-50')
    })

    it('should return correct classes for score of 0', () => {
      const color = getPriorityColor(0)
      expect(color).toBe('text-gray-600 bg-gray-50')
    })
  })

  describe('getPriorityLabel', () => {
    it('should return "緊急" for score >= 80', () => {
      const label = getPriorityLabel(85)
      expect(label).toBe('緊急')
    })

    it('should return "高" for score >= 60', () => {
      const label = getPriorityLabel(65)
      expect(label).toBe('高')
    })

    it('should return "中" for score >= 40', () => {
      const label = getPriorityLabel(45)
      expect(label).toBe('中')
    })

    it('should return "低" for score >= 20', () => {
      const label = getPriorityLabel(25)
      expect(label).toBe('低')
    })

    it('should return "極低" for score < 20', () => {
      const label = getPriorityLabel(10)
      expect(label).toBe('極低')
    })

    it('should handle edge case at 80', () => {
      expect(getPriorityLabel(80)).toBe('緊急')
    })

    it('should handle edge case at 60', () => {
      expect(getPriorityLabel(60)).toBe('高')
    })

    it('should handle edge case at 40', () => {
      expect(getPriorityLabel(40)).toBe('中')
    })

    it('should handle edge case at 20', () => {
      expect(getPriorityLabel(20)).toBe('低')
    })
  })
})
