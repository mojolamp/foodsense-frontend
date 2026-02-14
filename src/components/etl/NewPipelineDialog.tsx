'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Play } from 'lucide-react'
import { useETLPipeline, useVeganSites } from '@/hooks/useETL'
import type { CollectorType } from '@/types/etl'

interface NewPipelineDialogProps {
  onClose: () => void
}

export default function NewPipelineDialog({ onClose }: NewPipelineDialogProps) {
  const [collectorType, setCollectorType] = useState<CollectorType>('openfoodfacts')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(20)
  const [siteKey, setSiteKey] = useState('')
  const [autoApprove, setAutoApprove] = useState(false)

  const pipeline = useETLPipeline()
  const { data: sitesData } = useVeganSites()

  const sites = sitesData?.sites || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    pipeline.mutate(
      {
        collector_type: collectorType,
        query,
        limit,
        site_key: collectorType === 'vegan_ecommerce' ? siteKey : undefined,
        auto_approve: autoApprove,
      },
      {
        onSuccess: () => onClose(),
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl border border-border shadow-lg w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">New Pipeline Job</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Collector Type</label>
            <select
              value={collectorType}
              onChange={(e) => setCollectorType(e.target.value as CollectorType)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
            >
              <option value="openfoodfacts">OpenFoodFacts</option>
              <option value="vegan_ecommerce">Vegan Ecommerce</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. vegan snacks, organic milk"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Limit: {limit}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          {collectorType === 'vegan_ecommerce' && (
            <div>
              <label className="block text-sm font-medium mb-1">Site</label>
              <select
                value={siteKey}
                onChange={(e) => setSiteKey(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              >
                <option value="">Select site...</option>
                {sites.map((site) => (
                  <option key={site.key} value={site.key}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Auto-approve collected records</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!query || pipeline.isPending}>
              <Play className="h-4 w-4 mr-2" />
              {pipeline.isPending ? 'Starting...' : 'Run Pipeline'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
