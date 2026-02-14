'use client'

import { Badge } from '@/components/ui/badge'
import { useCrawlerList } from '@/hooks/useCrawlerRaw'

export default function CrawlerStatusStrip() {
  const { data: crawlers, isLoading } = useCrawlerList()

  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Sites:</span>
        {isLoading ? (
          <span className="text-muted-foreground">...</span>
        ) : (
          <span className="font-semibold">{crawlers?.total ?? 0}</span>
        )}
      </div>
      {crawlers?.crawlers && crawlers.crawlers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {crawlers.crawlers.map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
