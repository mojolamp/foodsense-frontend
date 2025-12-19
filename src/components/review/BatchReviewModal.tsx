'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { OCRRecord } from '@/types/review'
import { DEFAULT_TEMPLATES, type ReviewTemplate } from '@/types/reviewTemplate'
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
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const batchReviewSchema = z.object({
  data_quality_score: z.number().int().min(1).max(10),
  confidence_score: z.number().min(0).max(1),
  review_notes: z.string().optional(),
  is_gold: z.boolean(),
})

type BatchReviewFormData = z.infer<typeof batchReviewSchema>

interface Props {
  records: OCRRecord[]
  onClose: () => void
  onSubmit: (data: BatchReviewFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export default function BatchReviewModal({ records, onClose, onSubmit, isSubmitting }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BatchReviewFormData>({
    resolver: zodResolver(batchReviewSchema),
    defaultValues: {
      data_quality_score: 8,
      confidence_score: 0.85,
      review_notes: '',
      is_gold: false
    }
  })

  const qualityScore = watch('data_quality_score')
  const confidenceScore = watch('confidence_score')
  const isGold = watch('is_gold')

  const applyTemplate = (template: ReviewTemplate) => {
    setSelectedTemplate(template)
    setValue('data_quality_score', template.data_quality_score)
    setValue('confidence_score', template.confidence_score)
    setValue('is_gold', template.is_gold)
    if (template.default_notes) {
      setValue('review_notes', template.default_notes)
    }
  }

  const handleFormSubmit = (data: BatchReviewFormData) => {
    onSubmit(data)
  }

  // 統計資訊
  const stats = {
    total: records.length,
    fail: records.filter(r => r.logic_validation_status === 'FAIL').length,
    warn: records.filter(r => r.logic_validation_status === 'WARN').length,
    pass: records.filter(r => r.logic_validation_status === 'PASS').length,
    lowConfidence: records.filter(r => r.confidence_level === 'LOW').length,
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">批次審核 - {records.length} 筆記錄</DialogTitle>
          <DialogDescription>
            選擇評分模板或自訂評分，將套用到所有選擇的記錄
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 記錄摘要 */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              記錄摘要
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">總計</span>
                <Badge variant="outline">{stats.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">FAIL</span>
                <Badge variant="destructive">{stats.fail}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WARN</span>
                <Badge className="bg-yellow-500">{stats.warn}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">LOW 信心</span>
                <Badge variant="secondary">{stats.lowConfidence}</Badge>
              </div>
            </div>

            {/* 警告提示 */}
            {(stats.fail > 0 || stats.lowConfidence > 0) && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-yellow-800">
                  <p className="font-medium">注意：批次中包含品質問題記錄</p>
                  <p className="text-xs mt-1">
                    {stats.fail > 0 && `${stats.fail} 筆驗證失敗、`}
                    {stats.lowConfidence > 0 && `${stats.lowConfidence} 筆低信心度`}
                    。建議謹慎評分或分批處理。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 快速模板選擇 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">1. 選擇評分模板（可選）</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : template.color
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          品質 {template.data_quality_score}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          信心 {(template.confidence_score * 100).toFixed(0)}%
                        </Badge>
                        {template.is_gold && (
                          <Badge className="bg-amber-500 text-xs">⭐ 黃金</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 自訂評分 */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <Label className="text-base font-medium">2. 確認或調整評分</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quality">資料品質分數 (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="quality"
                    type="number"
                    min="1"
                    max="10"
                    {...register('data_quality_score', { valueAsNumber: true })}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold tabular-nums text-muted-foreground min-w-[3ch]">
                    {qualityScore}
                  </span>
                </div>
                {errors.data_quality_score && (
                  <p className="text-xs text-red-600">{errors.data_quality_score.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">信心分數 (0-1)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="confidence"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register('confidence_score', { valueAsNumber: true })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[4ch]">
                    {(confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                {errors.confidence_score && (
                  <p className="text-xs text-red-600">{errors.confidence_score.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">批次審核備註（可選）</Label>
              <Textarea
                id="notes"
                {...register('review_notes')}
                placeholder="為此批次記錄添加統一備註..."
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                此備註將套用到所有 {records.length} 筆記錄
              </p>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <input
                type="checkbox"
                id="gold"
                {...register('is_gold')}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <Label htmlFor="gold" className="font-normal cursor-pointer flex-1">
                標記為黃金樣本 (批次套用)
              </Label>
              {isGold && (
                <Badge className="bg-amber-500">
                  ⭐ 將標記 {records.length} 筆
                </Badge>
              )}
            </div>
          </form>

          {/* 確認提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">批次操作確認</p>
                <p className="mt-1">
                  將對 <strong>{records.length} 筆記錄</strong> 套用品質分數 <strong>{qualityScore}</strong>、
                  信心分數 <strong>{(confidenceScore * 100).toFixed(0)}%</strong>
                  {isGold && <span>，並<strong>標記為黃金樣本</strong></span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                處理中...
              </>
            ) : (
              `批次提交 ${records.length} 筆`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
