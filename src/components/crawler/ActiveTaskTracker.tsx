'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useCrawlerTaskStatus } from '@/hooks/useCrawlerRaw'

interface Props {
  taskId: string
  label: string
  onDismiss: () => void
}

function elapsed(start: string): string {
  const ms = Date.now() - new Date(start).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rs = s % 60
  return `${m}m ${rs}s`
}

export default function ActiveTaskTracker({ taskId, label, onDismiss }: Props) {
  const { data: task } = useCrawlerTaskStatus(taskId)
  const [showResult, setShowResult] = useState(false)
  const [elapsedStr, setElapsedStr] = useState('0s')

  const startTime = task?.created_at ?? new Date().toISOString()
  const isDone = task?.status === 'done' || task?.status === 'failed'

  useEffect(() => {
    if (isDone) return
    const iv = setInterval(() => setElapsedStr(elapsed(startTime)), 1000)
    return () => clearInterval(iv)
  }, [startTime, isDone])

  useEffect(() => {
    if (isDone) setElapsedStr(elapsed(startTime))
  }, [isDone, startTime])

  const statusVariant = task?.status === 'done'
    ? 'success' as const
    : task?.status === 'failed'
      ? 'destructive' as const
      : task?.status === 'running'
        ? 'default' as const
        : 'secondary' as const

  return (
    <Card className="p-3 border-l-4 border-l-primary">
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant} className="text-xs shrink-0">
          {task?.status ?? 'queued'}
        </Badge>
        <span className="text-sm font-medium truncate flex-1">{label}</span>
        <span className="text-xs text-muted-foreground font-mono shrink-0">{elapsedStr}</span>
        {isDone && (
          <button
            onClick={() => setShowResult((v) => !v)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showResult ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onDismiss}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
        {taskId}
      </div>

      {task?.error && (
        <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded overflow-x-auto max-h-24">
          {String(task.error)}
        </pre>
      )}

      {showResult && task?.result != null && (
        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
          {JSON.stringify(task.result, null, 2)}
        </pre>
      )}
    </Card>
  )
}
