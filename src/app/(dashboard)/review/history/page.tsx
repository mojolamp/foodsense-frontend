'use client'

import { useReviewHistory } from '@/hooks/useReviewQueue'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { History } from 'lucide-react'

export default function ReviewHistoryPage() {
  const { data: history, isLoading, error } = useReviewHistory()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10">
        <p className="text-destructive">載入失敗: {(error as Error).message}</p>
      </Card>
    )
  }

  const totalRecords = history?.length || 0
  const goldCount = history?.filter(h => h.is_gold).length || 0
  const avgQuality = totalRecords > 0
    ? (history!.reduce((sum, h) => sum + h.data_quality_score, 0) / totalRecords).toFixed(1)
    : '—'
  const avgConfidence = totalRecords > 0
    ? (history!.reduce((sum, h) => sum + h.confidence_score, 0) / totalRecords).toFixed(2)
    : '—'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">審核歷史</h1>
        <p className="mt-2 text-muted-foreground">
          已審核記錄: {totalRecords} 筆
        </p>
      </div>

      {/* KPI Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">{totalRecords}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Gold Samples:</span>
          <Badge variant="success" className="text-xs">{goldCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Quality:</span>
          <span className="font-semibold">{avgQuality}/10</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Confidence:</span>
          <span className="font-semibold">{avgConfidence}</span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Ground Truth ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">產品 ID</th>
                <th className="text-right p-3 font-medium text-muted-foreground">品質分數</th>
                <th className="text-right p-3 font-medium text-muted-foreground">信心分數</th>
                <th className="text-center p-3 font-medium text-muted-foreground">黃金樣本</th>
                <th className="text-left p-3 font-medium text-muted-foreground">建立時間</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.gt_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {item.gt_id.slice(0, 8)}...
                    </td>
                    <td className="p-3">{item.product_id}</td>
                    <td className="p-3 text-right">
                      <span className={`font-medium ${item.data_quality_score >= 8 ? 'text-green-600' : item.data_quality_score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {item.data_quality_score}/10
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-xs">
                      {item.confidence_score.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={item.is_gold ? 'success' : 'secondary'} className="text-xs">
                        {item.is_gold ? '是' : '否'}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: zhTW,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground mb-2">沒有審核記錄</div>
                    <p className="text-sm text-muted-foreground/70">目前沒有審核歷史記錄</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
