'use client'

import { useGoldSamples } from '@/hooks/useReviewQueue'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Star } from 'lucide-react'

export default function GoldSamplesPage() {
  const { data: goldSamples, isLoading, error } = useGoldSamples()

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

  const totalSamples = goldSamples?.length || 0
  const avgQuality = totalSamples > 0
    ? (goldSamples!.reduce((sum, s) => sum + s.data_quality_score, 0) / totalSamples).toFixed(1)
    : '—'
  const avgConfidence = totalSamples > 0
    ? (goldSamples!.reduce((sum, s) => sum + s.confidence_score, 0) / totalSamples).toFixed(2)
    : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">黃金樣本</h1>
          <p className="mt-1 text-muted-foreground">
            高品質訓練樣本: {totalSamples} 筆
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Samples:</span>
          <span className="font-semibold">{totalSamples}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Quality:</span>
          <Badge variant="success" className="text-xs">{avgQuality}/10</Badge>
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
                <th className="text-left p-3 font-medium text-muted-foreground">備註</th>
                <th className="text-left p-3 font-medium text-muted-foreground">建立時間</th>
              </tr>
            </thead>
            <tbody>
              {goldSamples && goldSamples.length > 0 ? (
                goldSamples.map((item) => (
                  <tr key={item.gt_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        <span className="font-mono text-xs text-muted-foreground">{item.gt_id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-3">{item.product_id}</td>
                    <td className="p-3 text-right">
                      <Badge variant="success" className="text-xs">
                        {item.data_quality_score}/10
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {item.confidence_score.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate text-xs">
                      {item.review_notes || '—'}
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
                    <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground mb-2">沒有黃金樣本</div>
                    <p className="text-sm text-muted-foreground/70">目前沒有黃金樣本，審核產品後可建立黃金樣本。</p>
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
