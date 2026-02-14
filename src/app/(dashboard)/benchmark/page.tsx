'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, Play, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useBenchmarkRun, useBenchmarkResults, useBenchmarkHistory, useBenchmarkMetrics, useDatasetInfo } from '@/hooks/useBenchmark'
import type { BenchmarkSummary } from '@/types/benchmark'

export default function BenchmarkPage() {
  const [expandedRun, setExpandedRun] = useState<number | null>(null)

  const benchmarkRun = useBenchmarkRun()
  const { data: results, isLoading: resultsLoading } = useBenchmarkResults()
  const { data: history, isLoading: historyLoading } = useBenchmarkHistory(20)
  const { data: metrics, isLoading: metricsLoading } = useBenchmarkMetrics()
  const { data: datasetInfo, isLoading: datasetLoading } = useDatasetInfo()

  const latestSummary = results?.status === 'found' ? results.results : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benchmark</h1>
          <p className="mt-2 text-muted-foreground">
            Golden dataset benchmark — run tests, review results, and track quality over time.
          </p>
        </div>
        <Button
          onClick={() => benchmarkRun.mutate()}
          disabled={benchmarkRun.isPending}
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          {benchmarkRun.isPending ? 'Running...' : 'Run Benchmark'}
        </Button>
      </div>

      {/* Dataset Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Dataset Info</h2>
        {datasetLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : datasetInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Version</div>
                <div className="text-lg font-bold">{datasetInfo.version}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Samples</div>
                <div className="text-lg font-bold">{datasetInfo.total_samples}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Categories</div>
                <div className="text-lg font-bold">{datasetInfo.categories.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="text-lg font-bold">{datasetInfo.created_date}</div>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Difficulty:</span>
              <div className="flex gap-2">
                <Badge variant="success">Easy: {datasetInfo.difficulty_distribution.easy}</Badge>
                <Badge variant="secondary">Medium: {datasetInfo.difficulty_distribution.medium}</Badge>
                <Badge variant="destructive">Hard: {datasetInfo.difficulty_distribution.hard}</Badge>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1">
              {datasetInfo.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>

            {datasetInfo.description && (
              <p className="text-sm text-muted-foreground">{datasetInfo.description}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No dataset info available.</p>
        )}
      </Card>

      {/* Latest Results */}
      {resultsLoading ? (
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      ) : latestSummary ? (
        <BenchmarkSummaryCard summary={latestSummary} title="Latest Results" />
      ) : (
        <Card className="p-12 text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <div className="text-lg font-medium text-muted-foreground mb-2">No benchmark results</div>
          <p className="text-sm text-muted-foreground/70">
            Click &quot;Run Benchmark&quot; to execute the golden dataset test suite.
          </p>
        </Card>
      )}

      {/* Metric Thresholds */}
      {!metricsLoading && metrics && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pass/Fail Thresholds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Ingredient Extraction</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Min Precision: <span className="font-mono font-medium text-foreground">{(metrics.ingredient_extraction.min_precision * 100).toFixed(0)}%</span></div>
                <div>Min Recall: <span className="font-mono font-medium text-foreground">{(metrics.ingredient_extraction.min_recall * 100).toFixed(0)}%</span></div>
                <div>Min F1: <span className="font-mono font-medium text-foreground">{(metrics.ingredient_extraction.min_f1_score * 100).toFixed(0)}%</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Nutrition Parsing</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Min Field Accuracy: <span className="font-mono font-medium text-foreground">{(metrics.nutrition_parsing.min_field_accuracy * 100).toFixed(0)}%</span></div>
                <div>Numeric Tolerance: <span className="font-mono font-medium text-foreground">{(metrics.nutrition_parsing.numeric_tolerance * 100).toFixed(0)}%</span></div>
                <div>Required Fields: <span className="font-medium text-foreground">{metrics.nutrition_parsing.required_fields.join(', ')}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Max Processing: <span className="font-mono font-medium text-foreground">{metrics.performance.max_processing_time_ms.toLocaleString()}ms</span></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : history?.history && history.history.length > 0 ? (
          <div className="space-y-2">
            {history.history.map((run, idx) => (
              <div key={idx} className="border border-border rounded-lg">
                <button
                  onClick={() => setExpandedRun(expandedRun === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.pass_rate >= 1 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(run.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {run.total_samples} samples
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={run.pass_rate >= 0.9 ? 'success' : run.pass_rate >= 0.7 ? 'secondary' : 'destructive'}>
                      {(run.pass_rate * 100).toFixed(1)}% pass
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {run.average_duration_ms.toFixed(0)}ms avg
                    </span>
                    {expandedRun === idx ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedRun === idx && (
                  <div className="px-4 pb-4 border-t border-border">
                    <BenchmarkSummaryDetail summary={run} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Clock className="h-4 w-4" />
            No benchmark history available.
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────

function BenchmarkSummaryCard({ summary, title }: { summary: BenchmarkSummary; title: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Badge variant={summary.pass_rate >= 0.9 ? 'success' : summary.pass_rate >= 0.7 ? 'secondary' : 'destructive'}>
            {(summary.pass_rate * 100).toFixed(1)}% pass rate
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(summary.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-bold">{summary.total_samples}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Passed</div>
          <div className="text-xl font-bold text-green-600">{summary.passed_samples}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Failed</div>
          <div className="text-xl font-bold text-red-600">{summary.failed_samples}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Avg Duration</div>
          <div className="text-xl font-bold">{summary.average_duration_ms.toFixed(0)}ms</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">P95 Duration</div>
          <div className="text-xl font-bold">{summary.performance.p95_duration_ms.toFixed(0)}ms</div>
        </div>
      </div>

      <BenchmarkSummaryDetail summary={summary} />
    </Card>
  )
}

function BenchmarkSummaryDetail({ summary }: { summary: BenchmarkSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      {/* Ingredient Extraction */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Ingredient Extraction</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'Precision', value: summary.ingredient_extraction.avg_precision },
            { label: 'Recall', value: summary.ingredient_extraction.avg_recall },
            { label: 'F1 Score', value: summary.ingredient_extraction.avg_f1_score },
            { label: 'Position Acc', value: summary.ingredient_extraction.avg_position_accuracy },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className={`font-mono font-medium ${value >= 0.9 ? 'text-green-600' : value >= 0.7 ? 'text-yellow-600' : 'text-red-600'}`}>
                {(value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Parsing */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Nutrition Parsing</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Field Acc</span>
            <span className={`font-mono font-medium ${summary.nutrition_parsing.avg_field_accuracy >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
              {(summary.nutrition_parsing.avg_field_accuracy * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Numeric Acc</span>
            <span className={`font-mono font-medium ${summary.nutrition_parsing.avg_numeric_accuracy >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
              {(summary.nutrition_parsing.avg_numeric_accuracy * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Failed Products */}
      {summary.failed_products.length > 0 && (
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium mb-2">Failed Products ({summary.failed_products.length})</h4>
          <div className="flex flex-wrap gap-1">
            {summary.failed_products.map((pid) => (
              <Badge key={pid} variant="destructive" className="text-xs font-mono">
                {pid}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
