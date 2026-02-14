'use client'

import { useQualityOverview, useQualityTimeline, useQualitySources, useQualityCoverage } from '@/hooks/useDataQuality'
import { useDQCoverage, useDQDrift, useDQFreshness, useDQValidationErrors } from '@/hooks/useDataQualityV2'
import QualityKPICards from '@/components/quality/QualityKPICards'
import QualityTimeline from '@/components/quality/QualityTimeline'
import SourceContribution from '@/components/quality/SourceContribution'
import CoverageStats from '@/components/quality/CoverageStats'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Upload, Book, TrendingUp, Clock, AlertCircle, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DataQualityPage() {
  const router = useRouter()

  const { data: overview, isLoading: overviewLoading } = useQualityOverview()
  const { data: timeline, isLoading: timelineLoading } = useQualityTimeline(30)
  const { data: sources, isLoading: sourcesLoading } = useQualitySources()
  const { data: coverage, isLoading: coverageLoading } = useQualityCoverage()
  const { data: dqCoverage, isLoading: dqCoverageLoading } = useDQCoverage()
  const { data: driftData, isLoading: driftLoading } = useDQDrift()
  const { data: freshnessData, isLoading: freshnessLoading } = useDQFreshness()
  const { data: validationData, isLoading: validationLoading } = useDQValidationErrors(100)

  const isLoading = overviewLoading || timelineLoading || sourcesLoading || coverageLoading

  const hasNoData = !isLoading && !overview && !timeline && !sources && !coverage

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Quality</h1>
        <p className="mt-2 text-muted-foreground">
          Data governance, quality monitoring, drift detection, and validation.
        </p>
      </div>

      {/* KPI Summary Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Golden Records:</span>
          <span className="font-semibold">{overview?.golden_record_count?.toLocaleString() ?? '...'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Stale:</span>
          <span className="font-semibold">{freshnessData?.stale_count?.toLocaleString() ?? '...'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Drift Alerts:</span>
          <Badge variant={driftData?.reports?.some(r => r.is_significant) ? 'destructive' : 'success'} className="text-xs">
            {driftData?.reports?.filter(r => r.is_significant).length ?? 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Validation Errors:</span>
          <Badge variant={(validationData?.total_errors ?? 0) > 0 ? 'destructive' : 'success'} className="text-xs">
            {validationData?.total_errors?.toLocaleString() ?? 0}
          </Badge>
        </div>
      </div>

      {hasNoData ? (
        <Card>
          <EmptyStateV2
            icon={BarChart3}
            iconBackgroundColor="orange"
            title="No quality data yet"
            description="Import and process products to see quality metrics."
            helpText="Data quality tracking monitors Golden Record coverage, source contributions, and field completeness."
            primaryAction={{
              label: 'Import Products',
              onClick: () => router.push('/products'),
              icon: Upload,
            }}
            secondaryAction={{
              label: 'Documentation',
              onClick: () => window.open('https://docs.foodsense.app/data-quality', '_blank'),
              icon: Book,
            }}
          />
        </Card>
      ) : (
        <>
          {/* Overview Section */}
          {overview && <QualityKPICards data={overview} />}

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Golden Record Growth Trend</h2>
            {timeline && <QualityTimeline data={timeline} />}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Source Contributions</h2>
              {sources && <SourceContribution data={sources} />}
            </Card>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Field Coverage</h2>
              {coverage && <CoverageStats data={coverage} />}
            </Card>
          </div>

          {/* V2 Field Completion */}
          {!dqCoverageLoading && dqCoverage && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Field Completion Rates</h2>
                <span className="text-xs text-muted-foreground">({dqCoverage.total_products.toLocaleString()} products)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(dqCoverage.fields).map(([field, rate]) => (
                  <div key={field} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{field.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{(rate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rate >= 0.9 ? 'bg-green-500' : rate >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${rate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Drift Report (collapsible) */}
      <CollapsibleSection title="Drift Report" defaultOpen={false} icon={TrendingUp}
        badge={driftData?.reports?.filter(r => r.is_significant).length || undefined}
        badgeVariant={driftData?.reports?.some(r => r.is_significant) ? 'destructive' : 'secondary'}
      >
        {driftLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !driftData || driftData.reports.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">No drift reports</div>
            <p className="text-sm text-muted-foreground/70">
              Drift detection runs periodically. Check back after data has been collected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {driftData.reports.length} metric{driftData.reports.length !== 1 && 's'} analyzed
              </div>
              {driftData.last_computed && (
                <div className="text-xs text-muted-foreground">
                  Last computed: {new Date(driftData.last_computed).toLocaleString()}
                </div>
              )}
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Period</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Baseline</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Current</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Magnitude</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Significant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driftData.reports.map((report) => (
                      <tr key={report.metric_name} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{report.metric_name}</td>
                        <td className="p-3 text-muted-foreground">{report.period}</td>
                        <td className="p-3 text-right font-mono text-xs">{report.baseline_mean.toFixed(4)}</td>
                        <td className="p-3 text-right font-mono text-xs">{report.current_mean.toFixed(4)}</td>
                        <td className="p-3 text-right">
                          <span className={report.is_significant ? 'text-red-600 font-bold' : 'text-muted-foreground'}>
                            {report.drift_magnitude.toFixed(4)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={report.is_significant ? 'destructive' : 'secondary'}>
                            {report.is_significant ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </CollapsibleSection>

      {/* Freshness (collapsible) */}
      <CollapsibleSection title="Freshness" defaultOpen={false} icon={Clock}>
        {freshnessLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !freshnessData ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground">No freshness data</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total Products</div>
                <div className="text-2xl font-bold">{freshnessData.total_products.toLocaleString()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Avg Age (Days)</div>
                <div className="text-2xl font-bold">{freshnessData.avg_age_days.toFixed(1)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Stale Products</div>
                <div className={`text-2xl font-bold ${freshnessData.stale_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {freshnessData.stale_count.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Stale Rate</div>
                <div className={`text-2xl font-bold ${freshnessData.total_products > 0 && (freshnessData.stale_count / freshnessData.total_products) > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                  {freshnessData.total_products > 0 ? ((freshnessData.stale_count / freshnessData.total_products) * 100).toFixed(1) : 0}%
                </div>
              </Card>
            </div>

            {Object.keys(freshnessData.age_distribution).length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(freshnessData.age_distribution)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([bucket, count]) => {
                      const maxCount = Math.max(...Object.values(freshnessData.age_distribution))
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                      return (
                        <div key={bucket} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-28 shrink-0">{bucket}</span>
                          <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full rounded bg-primary/70 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{count.toLocaleString()}</span>
                        </div>
                      )
                    })}
                </div>
              </Card>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* Validation Errors (collapsible) */}
      <CollapsibleSection title="Validation Errors" defaultOpen={false} icon={AlertCircle}
        badge={validationData?.total_errors || undefined}
        badgeVariant={(validationData?.total_errors ?? 0) > 0 ? 'destructive' : 'secondary'}
      >
        {validationLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !validationData || validationData.total_errors === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">No validation errors</div>
            <p className="text-sm text-muted-foreground/70">All products pass validation checks.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Validation Errors</div>
              <div className="text-2xl font-bold text-red-600">{validationData.total_errors.toLocaleString()}</div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(validationData.by_type).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Errors by Type</h3>
                  <div className="space-y-2">
                    {Object.entries(validationData.by_type)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{type}</span>
                          <Badge variant="destructive">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
              {Object.keys(validationData.by_field).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Errors by Field</h3>
                  <div className="space-y-2">
                    {Object.entries(validationData.by_field)
                      .sort(([, a], [, b]) => b - a)
                      .map(([field, count]) => (
                        <div key={field} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground capitalize">{field.replace(/_/g, ' ')}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>

            {validationData.recent_errors.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {validationData.recent_errors.map((err, idx) => (
                    <div key={idx} className="text-xs bg-muted/30 p-3 rounded-lg font-mono overflow-x-auto">
                      {JSON.stringify(err, null, 2)}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
