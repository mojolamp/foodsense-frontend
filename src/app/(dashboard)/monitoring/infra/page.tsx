'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Server, Database, Zap, AlertTriangle, HardDrive, DollarSign } from 'lucide-react'
import { monitoringAPI, type TimeRange } from '@/lib/api/monitoring'
import TimeRangeSelector from '@/components/monitoring/TimeRangeSelector'
import MetricCard from '@/components/monitoring/MetricCard'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Settings, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useDbStats,
  useSlowQueries,
  useOptimizationReport,
  useDbAnalyze,
  useIndexUsage,
  useConnectionPool,
  useResetMonitoring,
} from '@/hooks/useDbMonitoring'
import {
  useBudgetStatus,
  useDailySummary,
  useCostByModel,
  useCostAlerts,
} from '@/hooks/useCostMonitoring'

function InfraContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusParam = searchParams.get('focus')

  const [timeRange, setTimeRange] = useState<TimeRange>('1h')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monitoring', 'infra', timeRange],
    queryFn: () => monitoringAPI.getInfraMetrics(timeRange),
    refetchInterval: 60000,
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

  const hasNoData = !isLoading && data && data.db_stats.size_mb === 0

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
            Database performance, slow queries, cost monitoring, and resource utilization
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Infra KPI Row (always visible) */}
      {hasNoData ? (
        <EmptyStateV2
          icon={Server}
          iconBackgroundColor="purple"
          title="等待基礎設施數據"
          description="資料庫有活動後將顯示基礎設施指標"
          helpText="基礎設施監控追蹤資料庫效能、慢查詢和資源使用情況。指標每分鐘更新一次。"
          primaryAction={{ label: '配置監控', onClick: () => router.push('/settings'), icon: Settings }}
          secondaryAction={{ label: '重新整理', onClick: () => refetch(), icon: RefreshCw }}
        />
      ) : (
        <>
          {focusParam === 'db_size' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Focus:</strong> Database size and cost implications. Check table bloat section below.
              </p>
            </div>
          )}

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
                  colorClass={data.db_stats.cache_hit_ratio < 90 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}
                />
                <MetricCard
                  title="Slow Queries"
                  value={data.slow_queries.length}
                  subtitle="queries > 100ms avg"
                  icon={AlertTriangle}
                  colorClass={data.slow_queries.length > 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                />
              </>
            ) : null}
          </div>

          {/* Slow Queries Table */}
          {data && data.slow_queries.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Slow Queries (Top 10)</h3>
                <Badge variant="destructive">{data.slow_queries.length} total</Badge>
              </div>
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
                        <td className="px-4 py-3 font-mono text-xs max-w-md truncate">{query.query}</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">{query.avg_time_ms.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">{query.calls.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{query.total_time_ms.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Table Bloat + Unused Indexes (2-col) */}
          {data && (data.table_bloat.length > 0 || data.unused_indexes.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.table_bloat.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Table Bloat</h3>
                    <Badge variant="outline">{data.table_bloat.length} tables</Badge>
                  </div>
                  <div className="space-y-2">
                    {data.table_bloat.map((table, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{table.table_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Bloat: {table.bloat_ratio.toFixed(1)}% | Waste: {table.waste_mb.toFixed(1)} MB
                          </p>
                        </div>
                        {table.bloat_ratio > 50 && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {data.unused_indexes.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Unused Indexes</h3>
                    <Badge variant="outline">{data.unused_indexes.length} indexes</Badge>
                  </div>
                  <div className="space-y-2">
                    {data.unused_indexes.map((index, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium font-mono">{index.index_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Table: {index.table_name} | Size: {index.size_mb.toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* DB Deep Section (collapsible) */}
      <CollapsibleSection title="DB Deep" defaultOpen={false} icon={Database}>
        <DbDeepSection />
      </CollapsibleSection>

      {/* Cost & Budget Section (collapsible) */}
      <CollapsibleSection title="Cost & Budget" defaultOpen={false} icon={DollarSign}>
        <CostBudgetSection />
      </CollapsibleSection>

      {data && (
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}

// ── DB Deep Section ──

function DbDeepSection() {
  const { data: stats, isLoading: statsLoading } = useDbStats()
  const [slowThreshold, setSlowThreshold] = useState(100)
  const { data: slowQueries, isLoading: slowLoading } = useSlowQueries({ threshold_ms: slowThreshold, limit: 20 })
  const { data: optReport, isLoading: optLoading } = useOptimizationReport()
  const { data: indexData } = useIndexUsage()
  const { data: poolData } = useConnectionPool()
  const dbAnalyze = useDbAnalyze()
  const resetMon = useResetMonitoring()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Observations', value: stats?.total_observations },
          { label: 'Ingredients', value: stats?.total_ingredients },
          { label: 'Variants', value: stats?.total_variants },
          { label: 'Embedding Coverage', value: stats?.embedding_coverage != null ? `${(stats.embedding_coverage * 100).toFixed(0)}%` : undefined },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold">
              {statsLoading ? <div className="h-6 w-12 bg-muted rounded animate-pulse" /> : (value?.toLocaleString() ?? '—')}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => dbAnalyze.mutate()} disabled={dbAnalyze.isPending}>
          {dbAnalyze.isPending ? 'Analyzing...' : 'Run ANALYZE'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => resetMon.mutate()} disabled={resetMon.isPending}>
          Reset Monitoring
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Slow Queries</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Threshold:</label>
            <input
              type="number"
              value={slowThreshold}
              onChange={(e) => setSlowThreshold(Number(e.target.value))}
              min={0}
              className="w-20 px-2 py-1 border border-border rounded text-xs bg-background"
            />
            <span className="text-xs text-muted-foreground">ms</span>
          </div>
        </div>
        {slowLoading ? (
          <div className="h-20 bg-muted rounded animate-pulse" />
        ) : slowQueries && slowQueries.slow_queries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">Query</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {slowQueries.slow_queries.map((sq, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-2 font-mono max-w-[400px] truncate">{sq.query}</td>
                    <td className="p-2 text-right font-medium text-red-600">{sq.execution_time_ms.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No slow queries above {slowThreshold}ms threshold
          </div>
        )}
      </Card>

      {optReport && !optLoading && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Optimization Report</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold">{optReport.performance_stats.avg_query_time_ms.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg (ms)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{optReport.performance_stats.p95_query_time_ms.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">P95 (ms)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{optReport.performance_stats.p99_query_time_ms.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">P99 (ms)</div>
            </div>
          </div>
          {optReport.recommendations.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Recommendations:</div>
              {optReport.recommendations.map((rec, i) => (
                <div key={i} className="text-xs text-muted-foreground">{rec}</div>
              ))}
            </div>
          )}
        </Card>
      )}

      {indexData && indexData.indexes.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Index Usage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">Index</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Table</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Scans</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Size (MB)</th>
                </tr>
              </thead>
              <tbody>
                {indexData.indexes.slice(0, 20).map((idx, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-2 font-mono">{idx.index_name}</td>
                    <td className="p-2 text-muted-foreground">{idx.table_name}</td>
                    <td className="p-2 text-right">{idx.index_scans.toLocaleString()}</td>
                    <td className="p-2 text-right">{idx.index_size_mb.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {poolData && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Connection Pool</h3>
          <div className="text-sm text-muted-foreground">{poolData.message}</div>
          {poolData.note && <div className="text-xs text-muted-foreground mt-1">{poolData.note}</div>}
        </Card>
      )}
    </div>
  )
}

// ── Cost & Budget Section ──

function CostBudgetSection() {
  const { data: budget, isLoading: budgetLoading } = useBudgetStatus()
  const { data: dailySummary } = useDailySummary()
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const { data: modelCosts } = useCostByModel({ start_date: thirtyDaysAgo, end_date: today })
  const { data: alerts } = useCostAlerts()

  const budgetColor = (status?: string) => {
    if (status === 'critical') return 'text-red-600'
    if (status === 'warning') return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-4">
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                alert.severity === 'critical'
                  ? 'bg-destructive/10 border-destructive/30 text-destructive'
                  : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Daily Budget', tier: budget?.daily },
          { label: 'Monthly Budget', tier: budget?.monthly },
        ].map(({ label, tier }) => (
          <Card key={label} className="p-4">
            <div className="text-sm font-medium mb-2">{label}</div>
            {budgetLoading ? (
              <div className="h-16 bg-muted rounded animate-pulse" />
            ) : tier ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold ${budgetColor(tier.status)}`}>
                    ${tier.spent_usd.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ ${tier.limit_usd.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tier.status === 'critical' ? 'bg-red-500' : tier.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(tier.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{tier.percentage.toFixed(0)}%</span>
                </div>
                <Badge variant={tier.status === 'critical' ? 'destructive' : tier.status === 'warning' ? 'default' : 'success'} className="text-xs">
                  {tier.status}
                </Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </Card>
        ))}
      </div>

      {dailySummary && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Today&apos;s Total</div>
            <div className="text-lg font-bold">${dailySummary.total_cost_usd.toFixed(4)}</div>
          </div>
          <div className="text-xs text-muted-foreground">{dailySummary.date}</div>
        </Card>
      )}

      {modelCosts && modelCosts.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Cost by Model (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">Model</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Provider</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Cost</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Requests</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Input Tokens</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Output Tokens</th>
                </tr>
              </thead>
              <tbody>
                {modelCosts.map((mc, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-2 font-mono">{mc.model}</td>
                    <td className="p-2 text-muted-foreground">{mc.provider}</td>
                    <td className="p-2 text-right font-medium">${mc.total_cost_usd.toFixed(4)}</td>
                    <td className="p-2 text-right">{mc.total_requests.toLocaleString()}</td>
                    <td className="p-2 text-right">{mc.total_input_tokens.toLocaleString()}</td>
                    <td className="p-2 text-right">{mc.total_output_tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
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
