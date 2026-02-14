'use client'

import { useState } from 'react'
import { Plus, GitCompare, RefreshCw, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useETLJobs, useETLClean } from '@/hooks/useETL'
import NewPipelineDialog from '@/components/etl/NewPipelineDialog'
import BarcodeCrosscheckDialog from '@/components/etl/BarcodeCrosscheckDialog'
import ETLHealthBadge from '@/components/etl/ETLHealthBadge'
import ETLReviewSection from '@/components/etl/ETLReviewSection'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import type { ETLJob, CollectorType } from '@/types/etl'

const STAGE_COLORS: Record<string, string> = {
  collect: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  clean: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  normalize: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const STATUS_VARIANTS: Record<string, 'success' | 'default' | 'secondary' | 'destructive'> = {
  done: 'success',
  running: 'default',
  queued: 'secondary',
  failed: 'destructive',
}

export default function ETLJobsPage() {
  const [filterCollector, setFilterCollector] = useState<CollectorType | ''>('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showNewPipeline, setShowNewPipeline] = useState(false)
  const [showCrosscheck, setShowCrosscheck] = useState(false)

  const cleanMutation = useETLClean()

  const { data, isLoading, refetch } = useETLJobs({
    collector_type: filterCollector || undefined,
    status: filterStatus || undefined,
  })

  const jobs = data?.jobs || []

  // Compute KPIs
  const kpis = {
    collected: jobs.reduce((sum, j) => sum + j.records_collected, 0),
    cleaned: jobs.reduce((sum, j) => sum + j.records_cleaned, 0),
    inReview: jobs.reduce((sum, j) => sum + j.records_in_review, 0),
    errors: jobs.reduce((sum, j) => sum + j.errors, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ETL Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            Manage batch collection tasks, monitor progress, and cross-check barcodes.
          </p>
        </div>
        <ETLHealthBadge />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Collected', value: kpis.collected, color: 'text-blue-600' },
          { label: 'Cleaned', value: kpis.cleaned, color: 'text-purple-600' },
          { label: 'In Review', value: kpis.inReview, color: 'text-orange-600' },
          { label: 'Errors', value: kpis.errors, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>
              {value.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowNewPipeline(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Pipeline Job
        </Button>
        <Button variant="outline" onClick={() => setShowCrosscheck(true)}>
          <GitCompare className="h-4 w-4 mr-2" />
          Barcode Crosscheck
        </Button>
        <Button
          variant="outline"
          disabled={cleanMutation.isPending || !jobs.some(j => j.status === 'done')}
          onClick={() => {
            const doneJob = jobs.find(j => j.status === 'done')
            if (doneJob) cleanMutation.mutate(doneJob.id)
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {cleanMutation.isPending ? 'Cleaning...' : 'Run Clean'}
        </Button>

        <div className="flex-1" />

        <select
          value={filterCollector}
          onChange={(e) => setFilterCollector(e.target.value as CollectorType | '')}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Collectors</option>
          <option value="openfoodfacts">OpenFoodFacts</option>
          <option value="vegan_ecommerce">Vegan Ecommerce</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </select>

        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Job ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Source</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Stage</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Records</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No jobs found. Click &quot;New Pipeline Job&quot; to get started.
                  </td>
                </tr>
              ) : (
                jobs.map((job: ETLJob) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{job.id}</td>
                    <td className="p-3">{job.collector_type}</td>
                    <td className="p-3">{job.source}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[job.stage] || ''}`}>
                        {job.stage}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {job.records_collected}
                      {job.errors > 0 && (
                        <span className="text-red-500 ml-1">({job.errors} err)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_VARIANTS[job.status] || 'secondary'}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ETL Reviews */}
      <CollapsibleSection title="ETL Reviews" defaultOpen={false} badge="Review Queue">
        <ETLReviewSection />
      </CollapsibleSection>

      {/* Dialogs */}
      {showNewPipeline && (
        <NewPipelineDialog onClose={() => setShowNewPipeline(false)} />
      )}
      {showCrosscheck && (
        <BarcodeCrosscheckDialog onClose={() => setShowCrosscheck(false)} />
      )}
    </div>
  )
}
