'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTaskQueueStats, useTaskQueueHealth } from '@/hooks/useTaskQueue'
import { useNormalizerHealth } from '@/hooks/useNormalizer'

export default function PipelineStatusPanel() {
  const { data: tqStats, isLoading: tqLoading } = useTaskQueueStats()
  const { data: tqHealth } = useTaskQueueHealth()
  const { data: normHealth } = useNormalizerHealth()

  const queues = tqStats?.queues ? Object.values(tqStats.queues) : []
  const totalPending = queues.reduce((s, q) => s + q.pending, 0)
  const totalActive = queues.reduce((s, q) => s + q.active, 0)
  const totalFailed = queues.reduce((s, q) => s + q.failed, 0)

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Pipeline Status</h3>
      {tqLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {/* Task Queue Summary */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Task Queue</span>
            <Badge variant={tqHealth?.available ? 'success' : 'destructive'} className="text-xs">
              {tqHealth?.available ? 'OK' : 'Down'}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-mono font-bold text-yellow-600">{totalPending}</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-blue-600">{totalActive}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-red-600">{totalFailed}</div>
              <div className="text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Workers */}
          {tqStats?.workers && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Workers</span>
              <span className="text-xs font-mono">{tqStats.workers.length}</span>
            </div>
          )}

          {/* Normalizer */}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Normalizer</span>
            <Badge variant={normHealth?.status === 'healthy' ? 'success' : 'destructive'} className="text-xs">
              {normHealth?.status ?? '...'}
            </Badge>
          </div>

          {/* Queue Breakdown */}
          {queues.length > 0 && (
            <div className="border-t border-border pt-2">
              <div className="text-xs text-muted-foreground mb-1">Queues ({queues.length})</div>
              {queues.map((q) => (
                <div key={q.name} className="flex items-center justify-between text-xs py-0.5">
                  <span className="font-mono truncate">{q.name}</span>
                  <span className="text-muted-foreground">
                    {q.pending}P / {q.active}A / {q.failed}F
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
