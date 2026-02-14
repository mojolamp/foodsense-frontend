'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useCreateAggregationJob } from '@/hooks/useKnowledgeGraph'
import type { AggregationType } from '@/types/knowledgeGraph'

interface NewAggregationDialogProps {
  onClose: () => void
}

export default function NewAggregationDialog({ onClose }: NewAggregationDialogProps) {
  const [aggregationType, setAggregationType] = useState<AggregationType>('ingredient_frequency')
  const [priority, setPriority] = useState(3)
  const [minObservations, setMinObservations] = useState(3)

  const createJob = useCreateAggregationJob()

  const handleCreate = () => {
    createJob.mutate(
      {
        aggregation_type: aggregationType,
        priority,
        min_observations: minObservations,
      },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Aggregation Job</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Aggregation Type</label>
            <select
              value={aggregationType}
              onChange={(e) => setAggregationType(e.target.value as AggregationType)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
            >
              <option value="ingredient_frequency">Ingredient Frequency</option>
              <option value="nutrition_stats">Nutrition Stats</option>
              <option value="anomaly_detection">Anomaly Detection</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Priority (1-5)</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Math.max(1, Math.min(5, Number(e.target.value))))}
              min={1}
              max={5}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Min Observations</label>
            <input
              type="number"
              value={minObservations}
              onChange={(e) => setMinObservations(Math.max(1, Number(e.target.value)))}
              min={1}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createJob.isPending}>
            {createJob.isPending ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
