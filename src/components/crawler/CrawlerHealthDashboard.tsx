'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Database, BarChart3, Clock, AlertTriangle } from 'lucide-react'
import {
  useDQIngestionSummary,
  useDQCoverage,
  useDQFreshness,
  useDQValidationErrors,
} from '@/hooks/useDataQualityV2'

function MetricSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </Card>
  )
}

export default function CrawlerHealthDashboard() {
  const ingestion = useDQIngestionSummary()
  const coverage = useDQCoverage()
  const freshness = useDQFreshness()
  const validation = useDQValidationErrors()

  return (
    <div className="space-y-4">
      {/* 2x2 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingestion Summary */}
        {ingestion.isLoading ? (
          <MetricSkeleton />
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Ingestion Summary</h4>
            </div>
            {ingestion.data ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{ingestion.data.total_records.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">total records</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>
                    Today: <strong>{ingestion.data.today_count}</strong>
                  </span>
                  <Badge
                    variant={ingestion.data.pass_rate > 0.9 ? 'success' : ingestion.data.pass_rate > 0.7 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {(ingestion.data.pass_rate * 100).toFixed(1)}% pass
                  </Badge>
                </div>
                {ingestion.data.by_status && Object.keys(ingestion.data.by_status).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(ingestion.data.by_status).map(([status, count]) => (
                      <Badge key={status} variant="secondary" className="text-xs">
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </Card>
        )}

        {/* Coverage */}
        {coverage.isLoading ? (
          <MetricSkeleton />
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Field Coverage</h4>
              {coverage.data && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {coverage.data.total_products} products
                </span>
              )}
            </div>
            {coverage.data ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {Object.entries(coverage.data.fields)
                  .sort(([, a], [, b]) => b - a)
                  .map(([field, value]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24 truncate shrink-0">{field}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            value > 0.8 ? 'bg-green-500' : value > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-10 text-right shrink-0">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </Card>
        )}

        {/* Freshness */}
        {freshness.isLoading ? (
          <MetricSkeleton />
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Freshness</h4>
            </div>
            {freshness.data ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{freshness.data.avg_age_days.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">avg days old</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>
                    Total: <strong>{freshness.data.total_products}</strong>
                  </span>
                  <Badge
                    variant={freshness.data.stale_count === 0 ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {freshness.data.stale_count} stale
                  </Badge>
                </div>
                {freshness.data.age_distribution && Object.keys(freshness.data.age_distribution).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(freshness.data.age_distribution).map(([bucket, count]) => (
                      <Badge key={bucket} variant="secondary" className="text-xs">
                        {bucket}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </Card>
        )}

        {/* Validation Errors */}
        {validation.isLoading ? (
          <MetricSkeleton />
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Validation Errors</h4>
            </div>
            {validation.data ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{validation.data.total_errors}</span>
                  <span className="text-xs text-muted-foreground">total errors</span>
                </div>
                {validation.data.by_type && Object.keys(validation.data.by_type).length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {Object.entries(validation.data.by_type)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate">{type}</span>
                          <span className="font-mono shrink-0">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
                {validation.data.by_field && Object.keys(validation.data.by_field).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(validation.data.by_field)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([field, count]) => (
                        <Badge key={field} variant="destructive" className="text-xs">
                          {field}: {count}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
