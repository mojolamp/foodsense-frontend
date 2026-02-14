'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useIngestionSubmit } from '@/hooks/useOCR'
import { Send } from 'lucide-react'

const SOURCE_TYPES = ['ocr_scan', 'veg_ecommerce', 'manual'] as const

export default function ManualSubmitForm() {
  const [sourceType, setSourceType] = useState<string>('manual')
  const [sourceId, setSourceId] = useState('')
  const [rawPayload, setRawPayload] = useState('{\n  \n}')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const { mutate: submit, isPending, data: result } = useIngestionSubmit()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setJsonError(null)

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(rawPayload)
    } catch {
      setJsonError('Invalid JSON format')
      return
    }

    submit({
      source_type: sourceType,
      source_id: sourceId,
      raw_payload: parsed,
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Source Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Source Type
        </label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          {SOURCE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Source ID */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Source ID
        </label>
        <input
          type="text"
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          placeholder="e.g. manual-upload-001"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          required
        />
      </div>

      {/* Raw Payload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Raw Payload (JSON)
        </label>
        <textarea
          value={rawPayload}
          onChange={(e) => { setRawPayload(e.target.value); setJsonError(null) }}
          rows={10}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-xs"
          spellCheck={false}
        />
        {jsonError && (
          <p className="text-xs text-status-fail mt-1">{jsonError}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending || !sourceId} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {isPending ? 'Submitting...' : 'Submit to Ingestion Gate'}
      </Button>

      {/* Result */}
      {result && (
        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Submitted</span>
            <span className={`inline-block h-2 w-2 rounded-full ${
              result.status === 'pending' ? 'bg-status-warn' :
              result.status === 'processing' ? 'bg-chart-info' : 'bg-status-fail'
            }`} />
            <span className="text-xs text-muted-foreground">{result.status}</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground space-y-1">
            <div>Record: {result.record_id}</div>
            <div>Trace: {result.trace_id}</div>
          </div>
        </div>
      )}
    </form>
  )
}
