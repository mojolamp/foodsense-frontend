'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Activity,
  LineChart,
  Server,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { monitoringAPI, type TimeRange } from '@/lib/api/monitoring'
import TimeRangeSelector from '@/components/monitoring/TimeRangeSelector'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorState from '@/components/shared/ErrorState'
import ErrorBoundary from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function UnifiedMonitoringContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')

  const { data: business, isLoading: loadingBusiness, error: errorBusiness } = useQuery({
    queryKey: ['monitoring', 'business', timeRange],
    queryFn: () => monitoringAPI.getBusinessHealth(timeRange),
    refetchInterval: 60000,
  })

  const { data: app, isLoading: loadingApp, error: errorApp } = useQuery({
    queryKey: ['monitoring', 'app', timeRange],
    queryFn: () => monitoringAPI.getAppPerformance(timeRange),
    refetchInterval: 30000,
  })

  const { data: infra, isLoading: loadingInfra, error: errorInfra } = useQuery({
    queryKey: ['monitoring', 'infra', timeRange],
    queryFn: () => monitoringAPI.getInfraMetrics(timeRange),
    refetchInterval: 60000,
  })

  const hasError = errorBusiness || errorApp || errorInfra

  if (hasError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load monitoring overview"
          message="One or more monitoring layers failed to respond."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Monitoring Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Unified view across all three monitoring layers
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Three-Tier Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* L1: Business Health */}
        <TierCard
          title="Business Health"
          subtitle="L1"
          icon={LineChart}
          href="/monitoring/business"
          loading={loadingBusiness}
          metrics={business ? [
            { label: 'Health Score', value: `${business.health_score}/100`, status: business.health_score >= 80 ? 'pass' : business.health_score >= 50 ? 'warn' : 'fail' },
            { label: 'Total Requests', value: business.total_requests.toLocaleString() },
            { label: 'LawCore Adoption', value: `${business.lawcore_adoption_rate.toFixed(1)}%`, status: business.lawcore_adoption_rate >= 50 ? 'pass' : 'warn' },
            { label: 'Daily Cost', value: `$${business.daily_cost.toFixed(2)}` },
          ] : []}
        />

        {/* L2: Application Performance */}
        <TierCard
          title="Application Performance"
          subtitle="L2"
          icon={Activity}
          href="/monitoring/app"
          loading={loadingApp}
          metrics={app ? [
            { label: 'SLA Status', value: app.sla_status.is_compliant ? 'Compliant' : 'Violated', status: app.sla_status.is_compliant ? 'pass' : 'fail' },
            { label: 'P95 Latency', value: `${app.sla_status.p95_current_ms.toFixed(0)}ms`, status: app.sla_status.p95_current_ms <= app.sla_status.p95_threshold_ms ? 'pass' : 'fail' },
            { label: 'Endpoints', value: String(app.endpoints.length) },
            { label: 'Total Errors', value: String(app.endpoints.reduce((sum, e) => sum + e.error_count, 0)), status: app.endpoints.reduce((sum, e) => sum + e.error_count, 0) > 0 ? 'warn' : 'pass' },
          ] : []}
        />

        {/* L3: Infrastructure */}
        <TierCard
          title="Infrastructure"
          subtitle="L3"
          icon={Server}
          href="/monitoring/infra"
          loading={loadingInfra}
          metrics={infra ? [
            { label: 'DB Size', value: `${infra.db_stats.size_mb.toFixed(0)} MB` },
            { label: 'Connections', value: `${infra.db_stats.connections_active}/${infra.db_stats.connections_max}`, status: infra.db_stats.connections_active / infra.db_stats.connections_max > 0.8 ? 'fail' : 'pass' },
            { label: 'Cache Hit', value: `${infra.db_stats.cache_hit_ratio.toFixed(1)}%`, status: infra.db_stats.cache_hit_ratio >= 90 ? 'pass' : 'warn' },
            { label: 'Slow Queries', value: String(infra.slow_queries.length), status: infra.slow_queries.length > 10 ? 'fail' : infra.slow_queries.length > 0 ? 'warn' : 'pass' },
          ] : []}
        />
      </div>

      {/* Quick Alerts */}
      {(app && !app.sla_status.is_compliant) && (
        <Card className="p-4 border-status-fail/30 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-status-fail" />
            <div>
              <p className="font-medium text-sm">SLA Violation Detected</p>
              <p className="text-xs text-muted-foreground">
                P95 latency ({app.sla_status.p95_current_ms.toFixed(0)}ms) exceeds threshold ({app.sla_status.p95_threshold_ms}ms).{' '}
                <Link href="/monitoring/app" className="text-primary hover:underline">View details</Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      {(infra && infra.db_stats.cache_hit_ratio < 90) && (
        <Card className="p-4 border-status-warn/30 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-status-warn" />
            <div>
              <p className="font-medium text-sm">Cache Hit Ratio Below Target</p>
              <p className="text-xs text-muted-foreground">
                Current: {infra.db_stats.cache_hit_ratio.toFixed(1)}% (target: &gt;90%).{' '}
                <Link href="/monitoring/infra" className="text-primary hover:underline">View details</Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        Auto-refreshing every 30-60 seconds
      </div>
    </div>
  )
}

interface MetricItem {
  label: string
  value: string
  status?: 'pass' | 'warn' | 'fail'
}

interface TierCardProps {
  title: string
  subtitle: string
  icon: typeof Activity
  href: string
  loading: boolean
  metrics: MetricItem[]
}

function TierCard({ title, subtitle, icon: Icon, href, loading, metrics }: TierCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-chart-primary/10">
            <Icon className="h-5 w-5 text-chart-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Link
          href={href}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{metric.value}</span>
                {metric.status && <StatusDot status={metric.status} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function StatusDot({ status }: { status: 'pass' | 'warn' | 'fail' }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        status === 'pass' && 'bg-status-pass',
        status === 'warn' && 'bg-status-warn',
        status === 'fail' && 'bg-status-fail',
      )}
    />
  )
}

export default function MonitoringOverviewPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Monitoring Overview"
          message="An unexpected error occurred while loading the monitoring overview."
        />
      }
    >
      <UnifiedMonitoringContent />
    </ErrorBoundary>
  )
}
