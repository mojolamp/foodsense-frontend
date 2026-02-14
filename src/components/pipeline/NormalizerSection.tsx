'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Info } from 'lucide-react'
import { useNormalizerVersions, useNormalize } from '@/hooks/useNormalizer'

export default function NormalizerSection() {
  const { data: versions, isLoading: versionsLoading } = useNormalizerVersions()
  const normalize = useNormalize()

  const [sourceData, setSourceData] = useState('')
  const [source, setSource] = useState<'ocr' | 'crawler' | 'api' | 'console'>('console')

  const handleNormalize = () => {
    try {
      const parsed = JSON.parse(sourceData)
      normalize.mutate({ source, source_data: parsed })
    } catch {
      // invalid JSON handled by toast
    }
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Version Info */}
      <div>
        <h4 className="text-sm font-medium mb-2">Version Info</h4>
        {versionsLoading ? (
          <div className="h-12 bg-muted rounded animate-pulse" />
        ) : versions ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Normalizer: {versions.normalizer_version}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Resolver: {versions.entity_resolver_version}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Enricher: {versions.semantic_enricher_version}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Validator: {versions.validator_version}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Version info unavailable.</p>
        )}
      </div>

      {/* Normalize Form */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Normalize Data</h4>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="px-2 py-1.5 text-sm border border-input rounded-md bg-background"
            >
              <option value="console">Console</option>
              <option value="ocr">OCR</option>
              <option value="crawler">Crawler</option>
              <option value="api">API</option>
            </select>
          </div>
          <textarea
            value={sourceData}
            onChange={(e) => setSourceData(e.target.value)}
            placeholder='{"product_name": "...", "ingredients_text": "..."}'
            rows={4}
            className="w-full px-3 py-2 text-xs font-mono border border-input rounded-md bg-background resize-y"
          />
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              onClick={handleNormalize}
              disabled={!sourceData || normalize.isPending}
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {normalize.isPending ? 'Normalizing...' : 'Normalize'}
            </Button>
          </div>
        </div>

        {/* Result */}
        {normalize.data && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium">Result</span>
              <Badge variant={normalize.data.success ? 'success' : 'destructive'}>
                {normalize.data.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-48">
              {JSON.stringify(normalize.data.normalized_data, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
