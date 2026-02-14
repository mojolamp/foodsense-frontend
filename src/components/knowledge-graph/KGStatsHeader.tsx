'use client'

import { Badge } from '@/components/ui/badge'
import { useKGQueryStats } from '@/hooks/useKnowledgeGraph'

export default function KGStatsHeader() {
  const { data: stats, isLoading } = useKGQueryStats()

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
        <span className="text-muted-foreground">Ingredients:</span>
        <span className="font-semibold">{stats.total_ingredients.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Products:</span>
        <span className="font-semibold">{stats.total_products.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Categories:</span>
        <span className="font-semibold">{stats.total_categories.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Coverage:</span>
        <Badge variant={stats.embedding_coverage >= 0.9 ? 'success' : 'secondary'} className="text-xs">
          {(stats.embedding_coverage * 100).toFixed(1)}%
        </Badge>
      </div>
    </div>
  )
}
