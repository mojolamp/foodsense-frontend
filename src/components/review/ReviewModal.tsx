'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { OCRRecord } from '@/types/review'
import { useReviewSubmit } from '@/hooks/useReviewQueue'

interface Props {
  record: OCRRecord
  onClose: () => void
}

export default function ReviewModal({ record, onClose }: Props) {
  const [qualityScore, setQualityScore] = useState(8)
  const [confidenceScore, setConfidenceScore] = useState(0.9)
  const [notes, setNotes] = useState('')
  const [isGold, setIsGold] = useState(false)

  const { mutate: submitReview, isPending } = useReviewSubmit()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    submitReview({
      ocr_record_id: record.id,
      product_id: record.product_id,
      corrected_payload: {
        verified: true,
        verified_at: new Date().toISOString(),
        ocr_raw_text: record.ocr_raw_text,
      },
      data_quality_score: qualityScore,
      confidence_score: confidenceScore,
      review_notes: notes,
      is_gold: isGold,
    }, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Dialog.Title className="text-xl font-semibold">
              審核記錄
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Record Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">記錄 ID:</span>
                  <span className="ml-2 font-mono">{record.id.slice(0, 12)}...</span>
                </div>
                <div>
                  <span className="text-gray-600">產品 ID:</span>
                  <span className="ml-2 font-semibold">{record.product_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">驗證狀態:</span>
                  <span className="ml-2 font-semibold">{record.logic_validation_status}</span>
                </div>
                <div>
                  <span className="text-gray-600">信心水平:</span>
                  <span className="ml-2 font-semibold">{record.confidence_level}</span>
                </div>
              </div>

              {record.ocr_raw_text && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">OCR 原始文字:</p>
                  <div className="bg-white p-3 rounded border text-sm">
                    {record.ocr_raw_text}
                  </div>
                </div>
              )}
            </div>

            {/* Quality Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                資料品質分數 (1-10): {qualityScore}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={qualityScore}
                onChange={(e) => setQualityScore(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Confidence Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信心分數 (0-1): {confidenceScore.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={confidenceScore}
                onChange={(e) => setConfidenceScore(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                審核備註
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="輸入審核備註..."
              />
            </div>

            {/* Is Gold */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isGold}
                onChange={(e) => setIsGold(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                標記為黃金樣本
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? '提交中...' : '提交審核'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
