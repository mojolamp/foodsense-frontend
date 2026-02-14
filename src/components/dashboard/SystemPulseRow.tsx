'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HeartPulse,
  Zap,
  ClipboardList,
  Scale,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { monitoringAPI } from '@/lib/api/monitoring'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { LucideIcon } from 'lucide-react'

function PulseCard({
  label,
  value,
  sub,
  icon: Icon,
  alert,
  loading,
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  alert?: boolean
  loading?: boolean
}) {
  return (
    <Card className={`p-3 ${alert ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${alert ? 'text-red-500' : 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <>
          <div className="text-lg font-bold leading-tight">{value}</div>
          {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
        </>
      )}
    </Card>
  )
}

export default function SystemPulseRow() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard', 'dashboard-data'],
    queryFn: () => monitoringAPI.getDashboardData(),
    refetchInterval: 30_000,
    retry: 1,
  })

  const { data: reviewStats, isLoading: reviewLoading } = useQuery({
    queryKey: ['dashboard', 'reviewStats'],
    queryFn: () => reviewAPI.getStats(),
    refetchInterval: 30_000,
    retry: 1,
  })

  const totalPending = reviewStats?.queue_stats?.reduce(
    (sum, s) => sum + s.pending_count, 0
  ) ?? 0

  const healthIndicators = dashData?.health_indicators
  const cost = dashData?.cost as { daily_spent_usd?: number; daily_limit_usd?: number } | undefined
  const errors = dashData?.errors as { total_errors?: number; dlq_messages?: number } | undefined

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <PulseCard
        label="Health"
        value={healthIndicators
          ? `${(healthIndicators.http_success_rate * 100).toFixed(1)}%`
          : '-'}
        sub={healthIndicators ? `Cache: ${(healthIndicators.cache_hit_rate * 100).toFixed(0)}%` : undefined}
        icon={HeartPulse}
        loading={dashLoading}
        alert={healthIndicators ? healthIndicators.http_success_rate < 0.95 : false}
      />
      <PulseCard
        label="AI Requests/hr"
        value={dashData?.recent_activity?.ai_requests_last_hour ?? '-'}
        sub={`Products/hr: ${dashData?.recent_activity?.products_created_last_hour ?? '-'}`}
        icon={Zap}
        loading={dashLoading}
      />
      <PulseCard
        label="Review Queue"
        value={totalPending}
        sub={`${reviewStats?.queue_stats?.length ?? 0} groups`}
        icon={ClipboardList}
        loading={reviewLoading}
        alert={totalPending > 50}
      />
      <PulseCard
        label="Budget"
        value={healthIndicators?.budget_health ?? '-'}
        sub={cost ? `$${(cost.daily_spent_usd ?? 0).toFixed(2)} / $${(cost.daily_limit_usd ?? 0).toFixed(0)}` : undefined}
        icon={DollarSign}
        loading={dashLoading}
        alert={healthIndicators?.budget_health === 'critical'}
      />
      <PulseCard
        label="Queue Health"
        value={healthIndicators?.queue_health ?? '-'}
        icon={Scale}
        loading={dashLoading}
        alert={healthIndicators?.queue_health === 'critical' || healthIndicators?.queue_health === 'no_workers'}
      />
      <PulseCard
        label="DLQ / Errors"
        value={errors?.dlq_messages ?? '-'}
        sub={`Errors/hr: ${dashData?.recent_activity?.errors_last_hour ?? '-'}`}
        icon={AlertTriangle}
        loading={dashLoading}
        alert={(errors?.dlq_messages ?? 0) > 0}
      />
    </div>
  )
}
