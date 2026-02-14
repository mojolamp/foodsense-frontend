'use client'

import { Badge } from '@/components/ui/badge'
import { useDictionaryStats } from '@/hooks/useDictionary'

export default function DictionaryOverviewStrip() {
  const { data: stats, isLoading } = useDictionaryStats()

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <span className="text-muted-foreground">Loading stats...</span>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Tokens:</span>
        <span className="font-semibold">{stats.total_tokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Corrections:</span>
        <span className="font-semibold">{stats.total_corrections.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Avg Token/Product:</span>
        <span className="font-semibold">{stats.avg_token_per_product.toFixed(1)}</span>
      </div>
      {stats.top_errors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Top Errors:</span>
          <Badge variant="destructive" className="text-xs">{stats.top_errors.length}</Badge>
        </div>
      )}
    </div>
  )
}
