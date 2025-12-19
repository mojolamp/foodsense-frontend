'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHotkeys } from 'react-hotkeys-hook'
import type { OCRRecord } from '@/types/review'
import { useReviewSubmit } from '@/hooks/useReviewQueue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from 'lucide-react'

// Zod 驗證 Schema
const reviewFormSchema = z.object({
  data_quality_score: z.number()
    .int('品質分數必須是整數')
    .min(1, '品質分數最低為 1')
    .max(10, '品質分數最高為 10'),
  confidence_score: z.number()
    .min(0, '信心分數最低為 0')
    .max(1, '信心分數最高為 1'),
  review_notes: z.string().optional(),
  is_gold: z.boolean(),
}).refine((data) => {
  // 黃金樣本驗證規則
  if (data.is_gold) {
    return data.data_quality_score >= 8 &&
           data.confidence_score >= 0.85 &&
           data.review_notes &&
           data.review_notes.length >= 10
  }
  return true
}, {
  message: "黃金樣本需要：品質分數≥8、信心度≥0.85、且備註至少10個字",
  path: ['is_gold']
}).refine((data) => {
  // 邏輯一致性驗證：高品質應該有高信心度
  if (data.data_quality_score >= 8 && data.confidence_score < 0.7) {
    return false
  }
  return true
}, {
  message: "高品質評分(≥8)應該搭配較高的信心度(≥0.7)",
  path: ['confidence_score']
}).refine((data) => {
  // 邏輯一致性驗證：低品質不應該有過高信心度
  if (data.data_quality_score <= 4 && data.confidence_score > 0.7) {
    return false
  }
  return true
}, {
  message: "低品質評分(≤4)不應搭配過高的信心度(>0.7)",
  path: ['confidence_score']
})

type ReviewFormData = z.infer<typeof reviewFormSchema>

interface Props {
  record: OCRRecord
  onClose: () => void
}

export default function ReviewModal({ record, onClose }: Props) {
  const { mutate: submitReview, isPending } = useReviewSubmit()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      data_quality_score: 8,
      confidence_score: 0.9,
      review_notes: '',
      is_gold: false
    }
  })

  const qualityScore = watch('data_quality_score')
  const confidenceScore = watch('confidence_score')
  const isGold = watch('is_gold')

  // 快捷鍵: 1-9, 0 設定品質分數
  useHotkeys('1', () => setValue('data_quality_score', 1), { enableOnFormTags: false })
  useHotkeys('2', () => setValue('data_quality_score', 2), { enableOnFormTags: false })
  useHotkeys('3', () => setValue('data_quality_score', 3), { enableOnFormTags: false })
  useHotkeys('4', () => setValue('data_quality_score', 4), { enableOnFormTags: false })
  useHotkeys('5', () => setValue('data_quality_score', 5), { enableOnFormTags: false })
  useHotkeys('6', () => setValue('data_quality_score', 6), { enableOnFormTags: false })
  useHotkeys('7', () => setValue('data_quality_score', 7), { enableOnFormTags: false })
  useHotkeys('8', () => setValue('data_quality_score', 8), { enableOnFormTags: false })
  useHotkeys('9', () => setValue('data_quality_score', 9), { enableOnFormTags: false })
  useHotkeys('0', () => setValue('data_quality_score', 10), { enableOnFormTags: false })

  // 快捷鍵: g 切換黃金樣本
  useHotkeys('g', () => setValue('is_gold', !isGold), { enableOnFormTags: false })

  // 快捷鍵: Cmd/Ctrl+Enter 快速提交
  useHotkeys('mod+enter', (e) => {
    e.preventDefault()
    handleSubmit(onSubmit)()
  }, { enableOnFormTags: true })

  const onSubmit = (data: ReviewFormData) => {
    submitReview({
      ocr_record_id: record.id,
      product_id: record.product_id,
      corrected_payload: {
        verified: true,
        verified_at: new Date().toISOString(),
        ocr_raw_text: record.ocr_raw_text,
      },
      data_quality_score: data.data_quality_score,
      confidence_score: data.confidence_score,
      review_notes: data.review_notes,
      is_gold: data.is_gold,
    }, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Review Workbench</DialogTitle>
              <DialogDescription className="mt-1">
                使用鍵盤快捷鍵快速審核
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Keyboard className="w-4 h-4" />
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border">1-9</kbd>
                <span>評分</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded border ml-2">G</kbd>
                <span>黃金</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded border ml-2">⌘↵</kbd>
                <span>提交</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 divide-x">
          {/* Left Panel: Source Data / Image */}
          <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
            <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">Source Analysis</h4>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-card p-4 rounded-lg border">
                <div>
                  <span className="text-muted-foreground">Record ID</span>
                  <div className="font-mono text-xs mt-1">{record.id.slice(0, 12)}...</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Product ID</span>
                  <div className="font-medium mt-1">{record.product_id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1 font-semibold text-xs px-2 py-0.5 rounded-full bg-accent inline-block">{record.logic_validation_status}</div>
                </div>
              </div>

              {record.ocr_raw_text && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-2 block">Raw Text Content</span>
                  <pre className="bg-card p-3 rounded-lg border text-xs whitespace-pre-wrap overflow-auto max-h-[300px] text-muted-foreground">
                    {record.ocr_raw_text}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Review Form */}
          <div className="w-[400px] p-6 flex flex-col overflow-y-auto bg-background">
            <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">Validation & Correction</h4>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality">Data Quality Score (1-10)</Label>
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">1-9</kbd>
                      <span className="text-[10px]">快速設定</span>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">0</kbd>
                      <span className="text-[10px]">=10分</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      id="quality"
                      type="number"
                      min="1"
                      max="10"
                      {...register('data_quality_score', { valueAsNumber: true })}
                    />
                    <span className="text-2xl font-bold tabular-nums text-muted-foreground">{qualityScore}</span>
                  </div>
                  {errors.data_quality_score && (
                    <p className="text-xs text-red-600">{errors.data_quality_score.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence Score (0-100%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="confidence"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      {...register('confidence_score', { valueAsNumber: true })}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{(confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  {errors.confidence_score && (
                    <p className="text-xs text-red-600">{errors.confidence_score.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('review_notes')}
                    placeholder="Add comments regarding this validation..."
                    className="min-h-[100px]"
                  />
                  {errors.review_notes && (
                    <p className="text-xs text-red-600">{errors.review_notes.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2 pt-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="gold"
                        {...register('is_gold')}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <Label htmlFor="gold" className="font-normal cursor-pointer">Mark as Gold Sample (Training Data)</Label>
                    </div>
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      <span className="text-[10px]">快捷鍵:</span>
                      <kbd className="px-1 py-0.5 bg-background rounded text-[10px] border">G</kbd>
                    </div>
                  </div>
                  {errors.is_gold && (
                    <p className="text-xs text-red-600">{errors.is_gold.message}</p>
                  )}
                  {isGold && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <Badge className="bg-amber-500">⭐ 黃金樣本</Badge>
                      <span>需要品質≥8、信心≥0.85、備註≥10字</span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-3 h-3" />
              <span>按 <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] border">Cmd/Ctrl+↵</kbd> 快速提交</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isPending} type="submit">
                {isPending ? 'Submitting...' : 'Approve & Create Ground Truth'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
