'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarClock, Plus } from 'lucide-react'
import { useCrawlerList } from '@/hooks/useCrawlerRaw'
import { useCrawlerSchedules, useCreateCrawlerSchedule } from '@/hooks/useCrawlerAdmin'

export default function ScheduleManager() {
  const { data: crawlers } = useCrawlerList()
  const sites = crawlers?.crawlers ?? []
  const { data: schedulesData, isLoading } = useCrawlerSchedules()
  const createSchedule = useCreateCrawlerSchedule()

  const schedules = schedulesData?.schedules ?? []

  // Form state
  const [siteName, setSiteName] = useState('')
  const [cronExpr, setCronExpr] = useState('')
  const [maxProducts, setMaxProducts] = useState(100)
  const [enabled, setEnabled] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const handleCreate = () => {
    if (!siteName) return
    createSchedule.mutate(
      {
        site_name: siteName,
        cron_expression: cronExpr.trim() || null,
        max_products: maxProducts,
        enabled,
      },
      {
        onSuccess: () => {
          setSiteName('')
          setCronExpr('')
          setMaxProducts(100)
          setShowForm(false)
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Header + Create Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Crawler Schedules</h4>
          <Badge variant="secondary" className="text-xs">{schedules.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {showForm ? 'Cancel' : 'New Schedule'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Site</label>
              <select
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              >
                <option value="">Select site...</option>
                {sites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Cron Expression (optional)
              </label>
              <input
                type="text"
                value={cronExpr}
                onChange={(e) => setCronExpr(e.target.value)}
                placeholder="0 2 * * * (daily at 2am)"
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Max Products
              </label>
              <input
                type="number"
                value={maxProducts}
                onChange={(e) => setMaxProducts(Math.max(1, Number(e.target.value)))}
                min={1}
                max={1000}
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded"
                />
                Enabled
              </label>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!siteName || createSchedule.isPending}
                className="ml-auto"
              >
                Create Schedule
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Schedule List */}
      <Card>
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 ml-auto" />
              </div>
            ))
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarClock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <div className="text-lg font-medium text-muted-foreground mb-1">No Schedules</div>
              <div className="text-sm text-muted-foreground/70">
                Create a schedule to automate crawler runs.
              </div>
            </div>
          ) : (
            schedules.map((sched) => (
              <div key={sched.schedule_id} className="p-4 flex items-center gap-4">
                <span className="font-medium text-sm">{sched.site_name}</span>
                {sched.cron_expression ? (
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {sched.cron_expression}
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {sched.type ?? 'immediate'}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  max {sched.max_products}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant={sched.enabled ? 'success' : 'secondary'} className="text-xs">
                    {sched.enabled ? 'enabled' : 'disabled'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sched.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
