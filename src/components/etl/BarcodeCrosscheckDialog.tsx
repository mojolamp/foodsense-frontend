'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, GitCompare } from 'lucide-react'
import { useBarcodeCrosscheck } from '@/hooks/useETL'

interface BarcodeCrosscheckDialogProps {
  onClose: () => void
}

export default function BarcodeCrosscheckDialog({ onClose }: BarcodeCrosscheckDialogProps) {
  const [barcode, setBarcode] = useState('')
  const [sources, setSources] = useState<string[]>(['openfoodfacts', 'vegan_ecommerce'])

  const crosscheck = useBarcodeCrosscheck()

  const toggleSource = (source: string) => {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode || sources.length === 0) return
    crosscheck.mutate({ barcode, sources })
  }

  const result = crosscheck.data?.result

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl border border-border shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Barcode Crosscheck</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 4710088412345"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sources</label>
            <div className="flex gap-3">
              {[
                { key: 'openfoodfacts', label: 'OpenFoodFacts' },
                { key: 'vegan_ecommerce', label: 'Vegan Ecommerce' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sources.includes(key)}
                    onChange={() => toggleSource(key)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!barcode || sources.length === 0 || crosscheck.isPending}>
            <GitCompare className="h-4 w-4 mr-2" />
            {crosscheck.isPending ? 'Checking...' : 'Compare'}
          </Button>
        </form>

        {/* Results */}
        {result && (
          <div className="p-6 pt-0 space-y-4">
            {/* Source Comparison */}
            <div>
              <h3 className="text-sm font-medium mb-2">Source Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground">Source</th>
                      <th className="text-left p-2 text-muted-foreground">Found</th>
                      <th className="text-left p-2 text-muted-foreground">Product</th>
                      <th className="text-left p-2 text-muted-foreground">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.sources.map((src) => (
                      <tr key={src.source} className="border-b border-border">
                        <td className="p-2 font-medium">{src.source}</td>
                        <td className="p-2">
                          <Badge variant={src.found ? 'success' : 'destructive'}>
                            {src.found ? 'Found' : 'Not Found'}
                          </Badge>
                        </td>
                        <td className="p-2">{src.product_name || '—'}</td>
                        <td className="p-2">{src.brand || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Conflicts */}
            {result.conflicts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Conflicts ({result.conflicts.length})
                </h3>
                <div className="space-y-2">
                  {result.conflicts.map((conflict, i) => (
                    <div key={i} className="p-3 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-xs">{conflict.field}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {Object.entries(conflict.values).map(([source, value]) => (
                          <div key={source}>
                            <span className="font-medium">{source}:</span> {value}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-orange-700 dark:text-orange-400 mt-1 font-medium">
                        Suggestion: {conflict.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
