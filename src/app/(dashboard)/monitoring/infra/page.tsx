'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Server, Database, Zap, AlertTriangle, HardDrive } from 'lucide-react'
import { monitoringAPI, type TimeRange } from '@/lib/api/monitoring'
import TimeRangeSelector from '@/components/monitoring/TimeRangeSelector'
import MetricCard from '@/components/monitoring/MetricCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Settings, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

function InfraContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusParam = searchParams.get('focus')

  const [timeRange, setTimeRange] = useState<TimeRange>('1h')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monitoring', 'infra', timeRange],
    queryFn: () => monitoringAPI.getInfraMetrics(timeRange),
    refetchInterval: 60000, // Refetch every minute
  })

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load infrastructure metrics"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // Check for empty state (no database stats available)
  const hasNoData = !isLoading && data && data.db_stats.size_mb === 0

  if (hasNoData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Infrastructure (L3)</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Database performance, slow queries, and resource utilization
            </p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <div className="bg-white rounded-lg shadow">
          <EmptyStateV2
            icon={Server}
            iconBackgroundColor="purple"
            title="等待基礎設施數據"
            description="資料庫有活動後將顯示基礎設施指標"
            helpText="基礎設施監控追蹤資料庫效能、慢查詢和資源使用情況。指標每分鐘更新一次。"
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
            <Server className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Infrastructure (L3)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Database performance, slow queries, and resource utilization
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Focus Alert */}
      {focusParam === 'db_size' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Focus:</strong> Database size and cost implications. Check table bloat section
            below.
          </p>
        </div>
      )}

      {/* DB Stats Cards */}
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
              title="Database Size"
              value={`${data.db_stats.size_mb.toFixed(0)} MB`}
              subtitle={`${((data.db_stats.size_mb / 1024)).toFixed(2)} GB`}
              icon={HardDrive}
              colorClass="bg-purple-100 text-purple-600"
            />
            <MetricCard
              title="Active Connections"
              value={data.db_stats.connections_active}
              subtitle={`/ ${data.db_stats.connections_max} max`}
              icon={Zap}
              colorClass="bg-green-100 text-green-600"
            />
            <MetricCard
              title="Cache Hit Ratio"
              value={`${data.db_stats.cache_hit_ratio.toFixed(1)}%`}
              subtitle={data.db_stats.cache_hit_ratio < 90 ? 'Below target' : 'Healthy'}
              icon={Database}
              colorClass={
                data.db_stats.cache_hit_ratio < 90
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-green-100 text-green-600'
              }
            />
            <MetricCard
              title="Slow Queries"
              value={data.slow_queries.length}
              subtitle="queries > 100ms avg"
              icon={AlertTriangle}
              colorClass={
                data.slow_queries.length > 10
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }
            />
          </>
        ) : null}
      </div>

      {/* Slow Queries */}
      {data && data.slow_queries.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Slow Queries (Top 10)</h3>
            <Badge variant="destructive">{data.slow_queries.length} total</Badge>
          </div>

          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Query</th>
                    <th className="px-4 py-3 text-right font-medium">Avg Time (ms)</th>
                    <th className="px-4 py-3 text-right font-medium">Calls</th>
                    <th className="px-4 py-3 text-right font-medium">Total Time (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.slow_queries.slice(0, 10).map((query, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs max-w-md truncate">
                        {query.query}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {query.avg_time_ms.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right">{query.calls.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        {query.total_time_ms.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (sm and down) */}
          <div className="md:hidden space-y-3">
            {data.slow_queries.slice(0, 10).map((query, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Query</p>
                  <p className="font-mono text-xs break-all">{query.query}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                    <p className="font-medium text-red-600">{query.avg_time_ms.toFixed(1)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Calls</p>
                    <p className="font-medium">{query.calls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Time</p>
                    <p className="font-medium">{query.total_time_ms.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Table Bloat */}
      {data && data.table_bloat.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Table Bloat</h3>
            <Badge variant="outline">{data.table_bloat.length} tables</Badge>
          </div>
          <div className="space-y-2">
            {data.table_bloat.map((table, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{table.table_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Bloat: {table.bloat_ratio.toFixed(1)}% | Waste: {table.waste_mb.toFixed(1)} MB
                  </p>
                </div>
                {table.bloat_ratio > 50 && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unused Indexes */}
      {data && data.unused_indexes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Unused Indexes</h3>
            <Badge variant="outline">{data.unused_indexes.length} indexes</Badge>
          </div>
          <div className="space-y-2">
            {data.unused_indexes.map((index, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">{index.index_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Table: {index.table_name} | Size: {index.size_mb.toFixed(1)} MB
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* DB Maintenance Recommendations */}
      {data && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold mb-3">DB Maintenance Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            {data.slow_queries.length > 10 && (
              <li>• Consider adding indexes for frequently slow queries</li>
            )}
            {data.table_bloat.some((t) => t.bloat_ratio > 50) && (
              <li>• Run VACUUM FULL on heavily bloated tables during maintenance window</li>
            )}
            {data.unused_indexes.length > 5 && (
              <li>
                • Review and consider dropping {data.unused_indexes.length} unused indexes to save{' '}
                {data.unused_indexes.reduce((sum, idx) => sum + idx.size_mb, 0).toFixed(1)} MB
              </li>
            )}
            {data.db_stats.cache_hit_ratio < 90 && (
              <li>
                • Cache hit ratio is {data.db_stats.cache_hit_ratio.toFixed(1)}% (target: &gt;90%).
                Consider increasing shared_buffers
              </li>
            )}
          </ul>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        Last updated: {data ? new Date(data.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  )
}

export default function InfraPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Infrastructure Dashboard"
          message="An unexpected error occurred while loading the infrastructure metrics."
        />
      }
    >
      <InfraContent />
    </ErrorBoundary>
  )
}
