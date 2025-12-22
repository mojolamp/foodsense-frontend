'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { lawCoreAPI, type PresenceCheckResponse } from '@/lib/api/lawcore'
import PresenceResultBadge from './PresenceResultBadge'
import toast from 'react-hot-toast'

export default function PresenceQuickCheck() {
  const [additiveName, setAdditiveName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PresenceCheckResponse | null>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = additiveName.trim()
    if (!trimmed) {
      toast.error('Please enter an additive name')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await lawCoreAPI.checkPresence(trimmed)
      setResult(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check presence'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Exact Match Only</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Full-width and half-width characters must match exactly</li>
          <li>• Chinese and English names are different entries</li>
          <li>• Whitespace is automatically trimmed</li>
        </ul>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2" data-testid="presence-quick-check-form">
        <Input
          type="text"
          placeholder="Enter additive name (e.g., 山梨酸鉀 or Potassium Sorbate)"
          value={additiveName}
          onChange={(e) => setAdditiveName(e.target.value)}
          className="flex-1"
          data-testid="additive-name-input"
          aria-label="Additive name"
        />
        <Button type="submit" disabled={loading} data-testid="presence-check-submit">
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </form>

      {result && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Query: {result.additive_name}</span>
            <PresenceResultBadge result={result.result} />
          </div>

          {result.result === 'HAS_RULE' && (
            <div className="space-y-2 border-t pt-3">
              <div className="grid grid-cols-2 gap-4">
                {result.matched_name_zh && (
                  <div>
                    <span className="text-xs text-muted-foreground">Matched Name (ZH)</span>
                    <p className="text-sm font-medium">{result.matched_name_zh}</p>
                  </div>
                )}
                {result.e_number && (
                  <div>
                    <span className="text-xs text-muted-foreground">E Number</span>
                    <p className="text-sm font-medium">{result.e_number}</p>
                  </div>
                )}
                {result.authority_level && (
                  <div>
                    <span className="text-xs text-muted-foreground">Authority</span>
                    <p className="text-sm font-medium">{result.authority_level}</p>
                  </div>
                )}
                {result.citation?.rule_id && (
                  <div>
                    <span className="text-xs text-muted-foreground">Rule ID</span>
                    <p className="text-sm font-medium font-mono">{result.citation.rule_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Query time: {new Date(result.query_timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
