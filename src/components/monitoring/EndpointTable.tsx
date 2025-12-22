import { EndpointMetrics } from '@/lib/api/monitoring'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'

interface EndpointTableProps {
  endpoints: EndpointMetrics[]
  onEndpointClick?: (endpoint: EndpointMetrics) => void
}

export default function EndpointTable({ endpoints, onEndpointClick }: EndpointTableProps) {
  if (endpoints.length === 0) {
    return <EmptyState title="No endpoint data" description="No API requests recorded in this time range" />
  }

  return (
    <>
      {/* Desktop Table View (md and up) */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Endpoint</th>
                <th className="px-4 py-3 text-left font-medium">Method</th>
                <th className="px-4 py-3 text-right font-medium">Requests</th>
                <th className="px-4 py-3 text-right font-medium">Avg (ms)</th>
                <th className="px-4 py-3 text-right font-medium">P95 (ms)</th>
                <th className="px-4 py-3 text-right font-medium">P99 (ms)</th>
                <th className="px-4 py-3 text-right font-medium">Errors</th>
                <th className="px-4 py-3 text-right font-medium">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {endpoints.map((ep, idx) => {
                const hasHighErrorRate = ep.error_rate > 5
                const isSlowP95 = ep.p95_latency_ms > 1000

                return (
                  <tr
                    key={idx}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onEndpointClick?.(ep)}
                  >
                    <td className="px-4 py-3 font-mono text-xs max-w-xs truncate">{ep.endpoint}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {ep.method}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{ep.request_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{ep.avg_latency_ms.toFixed(0)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${isSlowP95 ? 'text-red-600' : ''}`}>
                      {ep.p95_latency_ms.toFixed(0)}
                      {isSlowP95 && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </td>
                    <td className="px-4 py-3 text-right">{ep.p99_latency_ms.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">{ep.error_count}</td>
                    <td className={`px-4 py-3 text-right font-medium ${hasHighErrorRate ? 'text-red-600' : ''}`}>
                      {ep.error_rate.toFixed(2)}%
                      {hasHighErrorRate && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (sm and down) */}
      <div className="md:hidden space-y-3">
        {endpoints.map((ep, idx) => {
          const hasHighErrorRate = ep.error_rate > 5
          const isSlowP95 = ep.p95_latency_ms > 1000

          return (
            <Card
              key={idx}
              className="p-4 cursor-pointer hover:bg-muted/50 active:bg-muted"
              onClick={() => onEndpointClick?.(ep)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs truncate">{ep.endpoint}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {ep.method}
                  </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Requests</p>
                    <p className="font-medium">{ep.request_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                    <p className="font-medium">{ep.avg_latency_ms.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P95 Latency</p>
                    <p className={`font-medium ${isSlowP95 ? 'text-red-600' : ''}`}>
                      {ep.p95_latency_ms.toFixed(0)}ms
                      {isSlowP95 && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P99 Latency</p>
                    <p className="font-medium">{ep.p99_latency_ms.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Errors</p>
                    <p className="font-medium">{ep.error_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Error Rate</p>
                    <p className={`font-medium ${hasHighErrorRate ? 'text-red-600' : ''}`}>
                      {ep.error_rate.toFixed(2)}%
                      {hasHighErrorRate && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
