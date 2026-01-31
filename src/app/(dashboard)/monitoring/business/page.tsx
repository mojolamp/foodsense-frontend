'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { LineChart, TrendingUp, DollarSign, Activity, BarChart2 } from 'lucide-react'
import { monitoringAPI, type TimeRange } from '@/lib/api/monitoring'
import TimeRangeSelector from '@/components/monitoring/TimeRangeSelector'
import MetricCard from '@/components/monitoring/MetricCard'
import HealthScoreCard from '@/components/monitoring/HealthScoreCard'
import { Card } from '@/components/ui/card'
import ErrorState from '@/components/shared/ErrorState'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Settings, RefreshCw } from 'lucide-react'

function BusinessHealthContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const router = useRouter()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monitoring', 'business', timeRange],
    queryFn: () => monitoringAPI.getBusinessHealth(timeRange),
    refetchInterval: 60000, // Refetch every minute
  })

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load business metrics"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // Check for empty state (no data or zero requests)
  const hasNoData = !isLoading && data && data.total_requests === 0

  if (hasNoData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Business Health (L1)</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              High-level business metrics and system health overview
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <div className="bg-white rounded-lg shadow">
          <EmptyStateV2
            icon={LineChart}
            iconBackgroundColor="blue"
            title="等待業務數據"
            description="系統開始處理請求後將顯示業務健康指標"
            helpText="業務指標每分鐘更新一次。追蹤總請求量、LawCore 採用率、每日成本和系統健康分數。"
            primaryAction={{
              label: '配置監控',
              onClick: () => {
                // FUTURE(P2): Add dedicated monitoring settings page
                // Currently navigates to general settings
                router.push('/settings')
              },
              icon: Settings,
            }}
            secondaryAction={{
              label: '重新整理',
              onClick: () => refetch(),
              icon: RefreshCw,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Business Health (L1)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            High-level business metrics and system health overview
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : data ? (
          <>
            <MetricCard
              title="Total Requests"
              value={data.total_requests.toLocaleString()}
              icon={BarChart2}
              colorClass="bg-blue-100 text-blue-600"
            />
            <MetricCard
              title="LawCore Adoption"
              value={`${data.lawcore_adoption_rate.toFixed(1)}%`}
              subtitle="of total requests"
              icon={TrendingUp}
              colorClass="bg-green-100 text-green-600"
              onClick={() => router.push('/monitoring/app?focus=lawcore')}
            />
            <MetricCard
              title="Daily Cost"
              value={`$${data.daily_cost.toFixed(2)}`}
              subtitle="DB + API costs"
              icon={DollarSign}
              colorClass="bg-yellow-100 text-yellow-600"
              onClick={() => router.push('/monitoring/infra?focus=db_size')}
            />
            <div>
              <HealthScoreCard score={data.health_score} />
            </div>
          </>
        ) : null}
      </div>

      {/* Hourly Traffic Chart */}
      {data && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Hourly Traffic</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.hourly_traffic.map((entry, idx) => {
              const maxRequests = Math.max(...data.hourly_traffic.map((e) => e.requests))
              const height = maxRequests > 0 ? (entry.requests / maxRequests) * 100 : 0

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${height}%` }}
                    title={`${entry.hour}: ${entry.requests} requests`}
                  />
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {new Date(entry.hour).getHours()}h
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Insights */}
      {data && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Quick Insights</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-primary mt-0.5" />
              <span>
                System processed <strong>{data.total_requests.toLocaleString()}</strong> requests in{' '}
                {timeRange}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <span>
                LawCore adoption rate is <strong>{data.lawcore_adoption_rate.toFixed(1)}%</strong>
                {data.lawcore_adoption_rate < 50 && (
                  <span className="text-yellow-600"> (below target)</span>
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600 mt-0.5" />
              <span>
                Daily operational cost: <strong>${data.daily_cost.toFixed(2)}</strong>
              </span>
            </li>
          </ul>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        Last updated: {data ? new Date(data.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  )
}

export default function BusinessHealthPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Business Health Dashboard"
          message="An unexpected error occurred while loading the business health metrics."
        />
      }
    >
      <BusinessHealthContent />
    </ErrorBoundary>
  )
}
