'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAcquisitionMetrics } from '@/hooks/useAcqMetrics'
import { useDLQStats, useDedupStats } from '@/hooks/useDLQ'

export default function AcquisitionMetricsPage() {
  const { data: metricsData, isLoading: metricsLoading, refetch } = useAcquisitionMetrics()
  const { data: dlqData } = useDLQStats()
  const { data: dedupData } = useDedupStats()

  const metrics = metricsData?.metrics
  const dlqDepth = dlqData?.stats?.pending ?? 0
  const dedupMode = dedupData?.stats?.mode ?? '—'
  const lastUpdated = metrics?.last_updated

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acquisition Metrics</h1>
          <p className="mt-2 text-muted-foreground">
            Channel health and acquisition performance overview.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Channel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-5 bg-muted rounded animate-pulse mb-4 w-1/3" />
              <div className="h-8 bg-muted rounded animate-pulse mb-2 w-1/2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </Card>
          ))
        ) : metrics?.channels?.length ? (
          metrics.channels.map((channel) => {
            const ratePercent = (channel.success_rate * 100).toFixed(1)
            const isHealthy = channel.success_rate >= 0.99
            return (
              <Card key={channel.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{channel.name}</h3>
                  {isHealthy ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success</span>
                    <span className="font-medium text-green-600">{channel.success_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failures</span>
                    <span className="font-medium text-red-600">{channel.fail_count.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <Badge variant={isHealthy ? 'success' : 'default'}>
                        {ratePercent}%
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isHealthy ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${channel.success_rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="p-12 md:col-span-3 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-1">No Metrics Available</div>
            <div className="text-sm text-muted-foreground/70">
              Metrics will appear once data acquisition channels start processing.
            </div>
          </Card>
        )}
      </div>

      {/* Health Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Health Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">DLQ Depth</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{dlqDepth}</span>
              {dlqDepth > 20 && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Dedup Mode</span>
            <Badge variant="secondary">{dedupMode}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Last Refresh</span>
            <span className="text-sm">
              {lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Auto-refreshing every 30 seconds
        </div>
      </Card>
    </div>
  )
}
