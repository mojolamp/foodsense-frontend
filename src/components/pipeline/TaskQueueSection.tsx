'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  XCircle,
  RefreshCw,
  Play,
  Trash2,
  Wrench,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  useTaskQueueStats,
  useTaskJobStatus,
  useTaskCancelJob,
  useTaskRetryJob,
  useTriggerAggregation,
  useTriggerExport,
  useTriggerCleanupLogs,
  useTriggerDailyMaintenance,
  useTriggerEmbeddings,
  useClearQueue,
} from '@/hooks/useTaskQueue'

export default function TaskQueueSection() {
  const { data: stats, isLoading } = useTaskQueueStats()
  const [jobLookupId, setJobLookupId] = useState('')
  const [lookupEnabled, setLookupEnabled] = useState(false)
  const [productId, setProductId] = useState('')

  const { data: jobData, isLoading: jobLoading } = useTaskJobStatus(
    lookupEnabled ? jobLookupId : ''
  )

  const cancelJob = useTaskCancelJob()
  const retryJob = useTaskRetryJob()
  const triggerAggregation = useTriggerAggregation()
  const triggerExport = useTriggerExport()
  const triggerCleanup = useTriggerCleanupLogs()
  const triggerDaily = useTriggerDailyMaintenance()
  const triggerEmbeddings = useTriggerEmbeddings()
  const clearQueue = useClearQueue()

  const queues = stats?.queues ? Object.values(stats.queues) : []

  return (
    <div className="space-y-4 pt-4">
      {/* Queue Stats Grid */}
      <div>
        <h4 className="text-sm font-medium mb-2">Queue Status</h4>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : queues.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {queues.map((q) => (
              <Card key={q.name} className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate">{q.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => clearQueue.mutate(q.name)}
                    title="Clear queue"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Pending </span>
                    <span className="font-mono font-medium">{q.pending}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active </span>
                    <span className="font-mono font-medium">{q.active}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Done </span>
                    <span className="font-mono font-medium text-green-600">{q.completed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed </span>
                    <span className="font-mono font-medium text-red-600">{q.failed}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No queue data available.</p>
        )}
      </div>

      {/* Workers */}
      {stats?.workers && stats.workers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Workers ({stats.workers.length})</h4>
          <div className="flex flex-wrap gap-2">
            {stats.workers.map((w, i) => (
              <Badge key={i} variant={w.state === 'idle' ? 'secondary' : 'success'} className="text-xs">
                {w.name}: {w.state}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Job Lookup */}
      <div>
        <h4 className="text-sm font-medium mb-2">Job Lookup</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={jobLookupId}
            onChange={(e) => {
              setJobLookupId(e.target.value)
              setLookupEnabled(false)
            }}
            placeholder="Enter job ID..."
            className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
          />
          <Button
            size="sm"
            onClick={() => setLookupEnabled(true)}
            disabled={!jobLookupId || jobLoading}
          >
            <Search className="h-3.5 w-3.5 mr-1" />
            Lookup
          </Button>
        </div>
        {lookupEnabled && jobData && (
          <Card className="mt-2 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono">{jobData.job_id}</span>
              <Badge variant={
                jobData.status === 'done' ? 'success' :
                jobData.status === 'failed' ? 'destructive' :
                jobData.status === 'running' ? 'default' : 'secondary'
              }>
                {jobData.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {jobData.status === 'running' && (
                <Button size="sm" variant="destructive" onClick={() => cancelJob.mutate(jobData.job_id)}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
              )}
              {jobData.status === 'failed' && (
                <Button size="sm" variant="outline" onClick={() => retryJob.mutate(jobData.job_id)}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                </Button>
              )}
            </div>
            {jobData.error && (
              <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded overflow-x-auto">
                {jobData.error}
              </pre>
            )}
          </Card>
        )}
      </div>

      {/* Trigger Actions */}
      <div>
        <h4 className="text-sm font-medium mb-2">Trigger Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Aggregation */}
          <Card className="p-3">
            <div className="text-xs font-medium mb-2">Aggregation</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Product ID..."
                className="flex-1 px-2 py-1 text-xs border border-input rounded-md bg-background"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={!productId || triggerAggregation.isPending}
                onClick={() => triggerAggregation.mutate(productId)}
              >
                <Layers className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-3">
            <div className="text-xs font-medium mb-2">Quick Actions</div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => triggerEmbeddings.mutate({ items: [] })} disabled={triggerEmbeddings.isPending}>
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Embeddings
              </Button>
              <Button size="sm" variant="outline" onClick={() => triggerExport.mutate({})} disabled={triggerExport.isPending}>
                <FileDown className="h-3.5 w-3.5 mr-1" /> Export
              </Button>
              <Button size="sm" variant="outline" onClick={() => triggerDaily.mutate()} disabled={triggerDaily.isPending}>
                <Play className="h-3.5 w-3.5 mr-1" /> Daily
              </Button>
              <Button size="sm" variant="outline" onClick={() => triggerCleanup.mutate(30)} disabled={triggerCleanup.isPending}>
                <Wrench className="h-3.5 w-3.5 mr-1" /> Cleanup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
