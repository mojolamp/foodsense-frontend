'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Activity, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { monitoringAPI, type TimeRange, type EndpointMetrics } from '@/lib/api/monitoring'
import TimeRangeSelector from '@/components/monitoring/TimeRangeSelector'
import MetricCard from '@/components/monitoring/MetricCard'
import EndpointTable from '@/components/monitoring/EndpointTable'
import IncidentCopyButton from '@/components/monitoring/IncidentCopyButton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Drawer from '@/components/shared/Drawer'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'

function AppPerformanceContent() {
  const searchParams = useSearchParams()
  const focusParam = searchParams.get('focus')

  const [timeRange, setTimeRange] = useState<TimeRange>('1h')
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointMetrics | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monitoring', 'app', timeRange],
    queryFn: () => monitoringAPI.getAppPerformance(timeRange),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: errorDetails } = useQuery({
    queryKey: ['monitoring', 'errors', selectedEndpoint?.endpoint],
    queryFn: () =>
      selectedEndpoint ? monitoringAPI.getEndpointErrors(selectedEndpoint.endpoint) : null,
    enabled: !!selectedEndpoint,
  })

  const handleEndpointClick = (endpoint: EndpointMetrics) => {
    setSelectedEndpoint(endpoint)
    setDrawerOpen(true)
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load application metrics"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
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
            <h1 className="text-2xl font-bold">Application Performance (L2)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Per-endpoint latency, error rates, and SLA compliance
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          {data && <IncidentCopyButton metrics={data} />}
        </div>
      </div>

      {/* Focus Alert */}
      {focusParam === 'lawcore' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Focus:</strong> Showing LawCore adoption metrics. Check endpoint table for
            /lawcore routes.
          </p>
        </div>
      )}

      {/* SLA Status */}
      {data && (
        <Card className={`p-6 ${!data.sla_status.is_compliant ? 'border-red-300' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold mb-2">SLA Status</h3>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">P95 Threshold</span>
                  <p className="text-lg font-bold">{data.sla_status.p95_threshold_ms}ms</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">P95 Current</span>
                  <p
                    className={`text-lg font-bold ${!data.sla_status.is_compliant ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {data.sla_status.p95_current_ms.toFixed(0)}ms
                  </p>
                </div>
              </div>
            </div>
            <Badge
              variant={data.sla_status.is_compliant ? 'default' : 'destructive'}
              className="text-base px-4 py-2"
            >
              {data.sla_status.is_compliant ? '✓ Compliant' : '✗ Violated'}
            </Badge>
          </div>
        </Card>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : data ? (
          <>
            <MetricCard
              title="Total Endpoints"
              value={data.endpoints.length}
              icon={Activity}
              colorClass="bg-blue-100 text-blue-600"
            />
            <MetricCard
              title="Slowest P95"
              value={`${Math.max(...data.endpoints.map((e) => e.p95_latency_ms)).toFixed(0)}ms`}
              subtitle={data.slowest_endpoints[0]?.endpoint || 'N/A'}
              icon={Clock}
              colorClass="bg-yellow-100 text-yellow-600"
            />
            <MetricCard
              title="Total Errors"
              value={data.endpoints.reduce((sum, e) => sum + e.error_count, 0)}
              subtitle={`${data.error_distribution.length} error types`}
              icon={XCircle}
              colorClass="bg-red-100 text-red-600"
            />
          </>
        ) : null}
      </div>

      {/* Endpoints Table */}
      {data && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Endpoint Performance</h3>
          <EndpointTable endpoints={data.endpoints} onEndpointClick={handleEndpointClick} />
        </Card>
      )}

      {/* Error Distribution */}
      {data && data.error_distribution.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Error Distribution</h3>
          <div className="space-y-2">
            {data.error_distribution.map((err, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{err.status_code}</Badge>
                  <span className="text-sm">{err.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{err.count} errors</span>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Endpoint Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Endpoint: ${selectedEndpoint?.endpoint || ''}`}
      >
        {selectedEndpoint && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Performance Metrics</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Method</dt>
                  <dd>
                    <Badge variant="outline">{selectedEndpoint.method}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Total Requests</dt>
                  <dd className="font-medium">{selectedEndpoint.request_count.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Avg Latency</dt>
                  <dd className="font-medium">{selectedEndpoint.avg_latency_ms.toFixed(0)}ms</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">P95 Latency</dt>
                  <dd className="font-medium">{selectedEndpoint.p95_latency_ms.toFixed(0)}ms</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">P99 Latency</dt>
                  <dd className="font-medium">{selectedEndpoint.p99_latency_ms.toFixed(0)}ms</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Error Count</dt>
                  <dd className="font-medium text-red-600">{selectedEndpoint.error_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Error Rate</dt>
                  <dd className="font-medium text-red-600">
                    {selectedEndpoint.error_rate.toFixed(2)}%
                  </dd>
                </div>
              </dl>
            </div>

            {errorDetails && errorDetails.errors.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold mb-3">Recent Errors (Last 20)</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {errorDetails.errors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {err.status_code}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono">{err.error_message}</p>
                      <p className="text-muted-foreground mt-1">Trace: {err.trace_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <div className="text-xs text-muted-foreground">
        Last updated: {data ? new Date(data.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  )
}

export default function AppPerformancePage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Application Performance Dashboard"
          message="An unexpected error occurred while loading the application performance metrics."
        />
      }
    >
      <AppPerformanceContent />
    </ErrorBoundary>
  )
}
