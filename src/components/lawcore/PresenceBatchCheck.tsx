'use client'

import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { lawCoreAPI, type PresenceCheckResponse } from '@/lib/api/lawcore'
import PresenceResultBadge from './PresenceResultBadge'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/card'

export default function PresenceBatchCheck() {
  const [batchInput, setBatchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PresenceCheckResponse[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleBatchCheck = async () => {
    const lines = batchInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      toast.error('Please enter at least one additive name')
      return
    }

    if (lines.length > 100) {
      toast.error('Maximum 100 additives per batch')
      return
    }

    setLoading(true)
    setResults([])
    setProgress({ current: 0, total: lines.length })

    const batchResults: PresenceCheckResponse[] = []
    const concurrencyLimit = 5

    try {
      for (let i = 0; i < lines.length; i += concurrencyLimit) {
        const batch = lines.slice(i, i + concurrencyLimit)
        const promises = batch.map((name) => lawCoreAPI.checkPresence(name))

        const batchResponses = await Promise.allSettled(promises)

        batchResponses.forEach((response, idx) => {
          if (response.status === 'fulfilled') {
            batchResults.push(response.value)
          } else {
            // Create error result
            batchResults.push({
              additive_name: batch[idx],
              result: 'UNKNOWN',
              query_timestamp: new Date().toISOString(),
            })
          }
        })

        setProgress({ current: i + batch.length, total: lines.length })
      }

      setResults(batchResults)
      toast.success(`Checked ${batchResults.length} additives`)
    } catch (error) {
      toast.error('Batch check failed')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error('No results to export')
      return
    }

    const headers = ['Input Name', 'Result', 'Matched Name', 'E Number', 'Authority', 'Rule ID']
    const rows = results.map((r) => [
      r.additive_name,
      r.result,
      r.matched_name_zh || '',
      r.e_number || '',
      r.authority_level || '',
      r.citation?.rule_id || '',
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `lawcore_batch_check_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    toast.success('CSV exported')
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Batch Input (one per line)</label>
          <Textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder={'山梨酸鉀\nPotassium Sorbate\nE202\n...'}
            rows={8}
            className="font-mono text-sm"
            data-testid="batch-input-textarea"
          />
          <p className="text-xs text-muted-foreground mt-1">Maximum 100 items per batch</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleBatchCheck} disabled={loading} data-testid="batch-check-submit">
            <Search className="h-4 w-4 mr-2" />
            {loading ? `Checking (${progress.current}/${progress.total})...` : 'Check All'}
          </Button>
          {results.length > 0 && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <>
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Input Name</th>
                    <th className="px-4 py-3 text-left font-medium">Result</th>
                    <th className="px-4 py-3 text-left font-medium">Matched Name</th>
                    <th className="px-4 py-3 text-left font-medium">E Number</th>
                    <th className="px-4 py-3 text-left font-medium">Authority</th>
                    <th className="px-4 py-3 text-left font-medium">Citation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{result.additive_name}</td>
                      <td className="px-4 py-3">
                        <PresenceResultBadge result={result.result} />
                      </td>
                      <td className="px-4 py-3">{result.matched_name_zh || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{result.e_number || '-'}</td>
                      <td className="px-4 py-3">{result.authority_level || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{result.citation?.rule_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (sm and down) */}
          <div className="md:hidden space-y-3">
            {results.map((result, idx) => (
              <Card key={idx} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.additive_name}</p>
                    </div>
                    <PresenceResultBadge result={result.result} />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {result.matched_name_zh && (
                      <div>
                        <p className="text-xs text-muted-foreground">Matched Name</p>
                        <p>{result.matched_name_zh}</p>
                      </div>
                    )}
                    {result.e_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">E Number</p>
                        <p className="font-mono text-xs">{result.e_number}</p>
                      </div>
                    )}
                    {result.authority_level && (
                      <div>
                        <p className="text-xs text-muted-foreground">Authority</p>
                        <p>{result.authority_level}</p>
                      </div>
                    )}
                    {result.citation?.rule_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Rule ID</p>
                        <p className="font-mono text-xs">{result.citation.rule_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="No results yet"
          description="Enter additive names above and click 'Check All' to see results"
        />
      )}
    </div>
  )
}
