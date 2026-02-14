'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, XCircle, CheckCircle, Boxes } from 'lucide-react'
import {
  useAggregationJobs,
  useExecuteAggregationJob,
  useCancelAggregationJob,
  usePendingObservations,
  useBatchApproveObservations,
  useBatchRejectObservations,
  useAggregationStats,
} from '@/hooks/useKnowledgeGraph'
import type { AggregationJob, JobStatus } from '@/types/knowledgeGraph'
import NewAggregationDialog from './NewAggregationDialog'

const STATUS_VARIANTS: Record<string, 'success' | 'default' | 'secondary' | 'destructive'> = {
  completed: 'success',
  running: 'default',
  pending: 'secondary',
  failed: 'destructive',
}

export default function AggregationJobsPanel() {
  const [filterStatus, setFilterStatus] = useState<JobStatus | ''>('')
  const [showNewJob, setShowNewJob] = useState(false)
  const [selectedObsIds, setSelectedObsIds] = useState<Set<string>>(new Set())
  const [rejectReason, setRejectReason] = useState('')

  const { data: jobsData, isLoading: jobsLoading } = useAggregationJobs({
    status: filterStatus || undefined,
  })
  const { data: obsData, isLoading: obsLoading } = usePendingObservations({ limit: 20 })
  const { data: stats } = useAggregationStats()

  const executeJob = useExecuteAggregationJob()
  const cancelJob = useCancelAggregationJob()
  const batchApprove = useBatchApproveObservations()
  const batchReject = useBatchRejectObservations()

  const jobs = jobsData?.jobs || []
  const observations = obsData?.observations || []

  const toggleObs = (id: string) => {
    setSelectedObsIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total Jobs</div>
          <div className="text-xl font-bold">{jobsData?.total ?? '—'}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Pending Observations</div>
          <div className="text-xl font-bold text-orange-600">{obsData?.total ?? '—'}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Jobs Stats</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats ? JSON.stringify(stats.jobs).slice(0, 60) + '...' : '—'}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Observations Stats</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats ? JSON.stringify(stats.observations).slice(0, 60) + '...' : '—'}
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowNewJob(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Aggregation Job
        </Button>

        <div className="flex-1" />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as JobStatus | '')}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Progress</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
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
                  <td colSpan={7} className="p-8 text-center">
                    <Boxes className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-muted-foreground">No aggregation jobs found</div>
                  </td>
                </tr>
              ) : (
                jobs.map((job: AggregationJob) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{job.id}</td>
                    <td className="p-3">{job.job_type}</td>
                    <td className="p-3">P{job.priority}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_VARIANTS[job.status] || 'secondary'}>{job.status}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {job.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => executeJob.mutate(job.id)}
                              disabled={executeJob.isPending}
                            >
                              <Play className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelJob.mutate(job.id)}
                              disabled={cancelJob.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Observations */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Pending Observations ({obsData?.total ?? 0})</h3>
          {selectedObsIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => batchApprove.mutate({
                  observation_ids: Array.from(selectedObsIds),
                  reviewer_id: 'admin',
                })}
                disabled={batchApprove.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
                Approve ({selectedObsIds.size})
              </Button>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason..."
                className="px-2 py-1 border border-border rounded text-xs bg-background w-32"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => batchReject.mutate({
                  observation_ids: Array.from(selectedObsIds),
                  reviewer_id: 'admin',
                  reason: rejectReason || 'Rejected',
                })}
                disabled={batchReject.isPending}
              >
                <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" />
                Reject
              </Button>
            </div>
          )}
        </div>
        {obsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : observations.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No pending observations</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 w-8">
                    <input
                      type="checkbox"
                      checked={selectedObsIds.size === observations.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedObsIds(new Set(observations.map((o) => o.id)))
                        else setSelectedObsIds(new Set())
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Quality</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => (
                  <tr key={obs.id} className="border-b border-border">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedObsIds.has(obs.id)}
                        onChange={() => toggleObs(obs.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2 font-mono">{obs.product_id}</td>
                    <td className="p-2">{obs.category}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${obs.quality_score}%` }}
                          />
                        </div>
                        <span>{obs.quality_score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNewJob && <NewAggregationDialog onClose={() => setShowNewJob(false)} />}
    </div>
  )
}
