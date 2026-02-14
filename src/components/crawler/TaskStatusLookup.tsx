'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useCrawlerTaskStatus } from '@/hooks/useCrawlerRaw'

export default function TaskStatusLookup() {
  const [taskId, setTaskId] = useState('')
  const [activeTaskId, setActiveTaskId] = useState('')

  const { data: taskStatus, isLoading } = useCrawlerTaskStatus(activeTaskId)

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-3">Task Status Lookup</h4>
      <div className="flex gap-2">
        <input
          type="text"
          value={taskId}
          onChange={(e) => {
            setTaskId(e.target.value)
            setActiveTaskId('')
          }}
          placeholder="Enter task ID..."
          className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
        />
        <Button
          size="sm"
          onClick={() => setActiveTaskId(taskId)}
          disabled={!taskId || isLoading}
        >
          <Search className="h-3.5 w-3.5 mr-1" /> Lookup
        </Button>
      </div>
      {activeTaskId && taskStatus && (
        <div className="mt-3 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono">{taskStatus.task_id}</span>
            <Badge variant={
              taskStatus.status === 'done' ? 'success' :
              taskStatus.status === 'failed' ? 'destructive' :
              taskStatus.status === 'running' ? 'default' : 'secondary'
            }>
              {taskStatus.status}
            </Badge>
          </div>
          {taskStatus.error && (
            <pre className="text-xs text-red-600 mt-1">{String(taskStatus.error)}</pre>
          )}
          {taskStatus.result != null && (
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-32">
              {JSON.stringify(taskStatus.result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </Card>
  )
}
