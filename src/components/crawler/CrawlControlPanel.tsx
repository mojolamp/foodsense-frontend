'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Search, Layers, CalendarClock, Radar, ShieldCheck } from 'lucide-react'
import {
  useCrawlProduct,
  useCrawlSearch,
  useCrawlAllSites,
  useCrawlScheduled,
  useCrawlerProbe,
  useCrawlerValidateQuality,
  useCrawlerList,
} from '@/hooks/useCrawlerRaw'
import type { ActiveTask, TaskSource } from '@/types/crawlerPipeline'
import ActiveTaskTracker from './ActiveTaskTracker'
import TaskStatusLookup from './TaskStatusLookup'

export default function CrawlControlPanel() {
  const { data: crawlers } = useCrawlerList()
  const sites = crawlers?.crawlers ?? []

  // Active tasks auto-tracking
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([])

  const trackTask = useCallback((taskId: string, label: string, source: TaskSource) => {
    setActiveTasks((prev) => [
      { taskId, label, source, startedAt: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const dismissTask = useCallback((taskId: string) => {
    setActiveTasks((prev) => prev.filter((t) => t.taskId !== taskId))
  }, [])

  // Form states
  const [productUrl, setProductUrl] = useState('')
  const [productSite, setProductSite] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchSite, setSearchSite] = useState('')
  const [searchLimit, setSearchLimit] = useState(10)
  const [allSitesKeyword, setAllSitesKeyword] = useState('')
  const [schedKeywords, setSchedKeywords] = useState('')
  const [schedSites, setSchedSites] = useState('')

  const crawlProduct = useCrawlProduct()
  const crawlSearch = useCrawlSearch()
  const crawlAllSites = useCrawlAllSites()
  const crawlScheduled = useCrawlScheduled()
  const probe = useCrawlerProbe()
  const validateQuality = useCrawlerValidateQuality()

  return (
    <div className="space-y-4">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Tasks</h4>
          {activeTasks.map((t) => (
            <ActiveTaskTracker
              key={t.taskId}
              taskId={t.taskId}
              label={t.label}
              onDismiss={() => dismissTask(t.taskId)}
            />
          ))}
        </div>
      )}

      {/* Crawl Product */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Crawl Product URL</h4>
        </div>
        <div className="flex gap-2">
          <select
            value={productSite}
            onChange={(e) => setProductSite(e.target.value)}
            className="px-2 py-1.5 text-sm border border-input rounded-md bg-background"
          >
            <option value="">Select site...</option>
            {sites.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="Product URL..."
            className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
          />
          <Button
            size="sm"
            disabled={!productSite || !productUrl || crawlProduct.isPending}
            onClick={() => crawlProduct.mutate(
              { site_name: productSite, url: productUrl },
              { onSuccess: (data) => trackTask(data.task_id, `Product: ${productSite}`, 'product') }
            )}
          >
            Crawl
          </Button>
        </div>
      </Card>

      {/* Search + All Sites (2-col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Search Crawl</h4>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={searchSite}
                onChange={(e) => setSearchSite(e.target.value)}
                className="px-2 py-1.5 text-sm border border-input rounded-md bg-background"
              >
                <option value="">Site...</option>
                {sites.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                value={searchLimit}
                onChange={(e) => setSearchLimit(Number(e.target.value))}
                min={1}
                max={50}
                className="w-16 px-2 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Keyword..."
                className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              />
              <Button
                size="sm"
                disabled={!searchSite || !searchKeyword || crawlSearch.isPending}
                onClick={() => crawlSearch.mutate(
                  { site_name: searchSite, keyword: searchKeyword, limit: searchLimit },
                  { onSuccess: (data) => trackTask(data.task_id, `Search: ${searchSite}/${searchKeyword}`, 'search') }
                )}
              >
                Search
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">All Sites Crawl</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={allSitesKeyword}
              onChange={(e) => setAllSitesKeyword(e.target.value)}
              placeholder="Keyword..."
              className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
            />
            <Button
              size="sm"
              disabled={!allSitesKeyword || crawlAllSites.isPending}
              onClick={() => crawlAllSites.mutate(
                { keyword: allSitesKeyword },
                { onSuccess: (data) => trackTask(data.task_id, `All Sites: ${allSitesKeyword}`, 'allSites') }
              )}
            >
              Crawl All
            </Button>
          </div>
        </Card>
      </div>

      {/* Scheduled + Probe + Quality (3-col) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Scheduled Crawl</h4>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={schedKeywords}
              onChange={(e) => setSchedKeywords(e.target.value)}
              placeholder="Keywords (comma-separated)..."
              className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
            />
            <input
              type="text"
              value={schedSites}
              onChange={(e) => setSchedSites(e.target.value)}
              placeholder="Sites (optional, comma-separated)..."
              className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!schedKeywords || crawlScheduled.isPending}
              onClick={() => {
                const kws = schedKeywords.split(',').map(k => k.trim()).filter(Boolean)
                crawlScheduled.mutate(
                  {
                    keywords: kws,
                    sites: schedSites ? schedSites.split(',').map(s => s.trim()).filter(Boolean) : null,
                  },
                  { onSuccess: (data) => trackTask(data.task_id, `Scheduled: ${kws.length} keywords`, 'scheduled') }
                )
              }}
            >
              Schedule
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radar className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Probe</h4>
          </div>
          <Button
            size="sm"
            className="w-full"
            variant="outline"
            disabled={probe.isPending}
            onClick={() => probe.mutate(
              {},
              { onSuccess: (data) => trackTask(data.task_id, 'Health Probe', 'probe') }
            )}
          >
            {probe.isPending ? 'Probing...' : 'Run Probe'}
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Quality Validate</h4>
          </div>
          <Button
            size="sm"
            className="w-full"
            variant="outline"
            disabled={validateQuality.isPending}
            onClick={() => validateQuality.mutate({ items: [], sample_ratio: 0.1 })}
          >
            Validate
          </Button>
          {validateQuality.data && (
            <div className="mt-2 text-xs text-muted-foreground">
              Pass rate: {(validateQuality.data.pass_rate * 100).toFixed(1)}%
            </div>
          )}
        </Card>
      </div>

      {/* Manual Task Lookup */}
      <TaskStatusLookup />
    </div>
  )
}
