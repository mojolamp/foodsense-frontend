'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Archive, Inbox, Fingerprint, Trash2, HeartPulse, Search } from 'lucide-react'
import { useDLQStats, useDLQMessages, useReplayMessage, useReplayQueue, useArchiveMessage, useDedupStats } from '@/hooks/useDLQ'
import { useDedupStatsV2, useDedupHealth, useDedupCheck, useDedupClear } from '@/hooks/useDedup'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import type { DLQMessage } from '@/types/dlq'

const STATUS_VARIANTS: Record<string, 'secondary' | 'destructive' | 'success' | 'default'> = {
  pending: 'secondary',
  failed: 'destructive',
  replayed: 'success',
  archived: 'default',
}

export default function DLQPage() {
  const [filterQueueType, setFilterQueueType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: statsData, isLoading: statsLoading } = useDLQStats()
  const { data: messagesData, isLoading: messagesLoading } = useDLQMessages({
    queue_type: filterQueueType || undefined,
    status: filterStatus || undefined,
  })
  const { data: dedupData, isLoading: dedupLoading } = useDedupStats()

  const replayMessage = useReplayMessage()
  const replayQueue = useReplayQueue()
  const archiveMessage = useArchiveMessage()

  const stats = statsData?.stats
  const messages = messagesData?.messages || []
  const dedupStats = dedupData?.stats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dead Letter Queue</h1>
        <p className="mt-2 text-muted-foreground">
          Manage failed messages, replay, and archive operations.
        </p>
      </div>

      {/* DLQ KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats?.total, color: 'text-foreground' },
          { label: 'Pending', value: stats?.pending, color: 'text-orange-600' },
          { label: 'Failed', value: stats?.failed, color: 'text-red-600' },
          { label: 'Processing', value: stats?.processing, color: 'text-blue-600' },
          { label: 'Replayed', value: stats?.replayed, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>
              {statsLoading ? <div className="h-7 w-12 bg-muted rounded animate-pulse" /> : (value ?? 0)}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => replayQueue.mutate(filterQueueType || undefined)}
          disabled={replayQueue.isPending}
          variant="outline"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {replayQueue.isPending ? 'Replaying...' : 'Replay All Pending'}
        </Button>

        <div className="flex-1" />

        <select
          value={filterQueueType}
          onChange={(e) => setFilterQueueType(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Queues</option>
          <option value="ocr">OCR</option>
          <option value="ingestion">Ingestion</option>
          <option value="etl">ETL</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="replayed">Replayed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Messages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Queue</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Error</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Retries</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messagesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground">Queue is empty</div>
                  </td>
                </tr>
              ) : (
                messages.map((msg: DLQMessage) => (
                  <tr key={msg.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{msg.id}</td>
                    <td className="p-3">{msg.queue_type}</td>
                    <td className="p-3">
                      <Badge variant={STATUS_VARIANTS[msg.status] || 'secondary'}>
                        {msg.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[300px] truncate">
                      {msg.error_message}
                    </td>
                    <td className="p-3 text-xs">
                      {msg.retry_count}/{msg.max_retries}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {msg.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => replayMessage.mutate(msg.id)}
                            disabled={replayMessage.isPending}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(msg.status === 'pending' || msg.status === 'failed') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archiveMessage.mutate(msg.id)}
                            disabled={archiveMessage.isPending}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dedup Service (collapsible) */}
      <CollapsibleSection title="Dedup Service" defaultOpen={false} icon={Fingerprint}>
        <DedupPanel dedupStats={dedupStats} dedupLoading={dedupLoading} />
      </CollapsibleSection>
    </div>
  )
}

// ── Dedup Panel ────────────────────────────────────────────

interface DedupPanelProps {
  dedupStats: { mode?: string; total_checked?: number; duplicates_found?: number; dedup_rate?: number; last_updated?: string } | undefined
  dedupLoading: boolean
}

function DedupPanel({ dedupStats, dedupLoading }: DedupPanelProps) {
  const [checkContent, setCheckContent] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const { data: v2Stats, isLoading: v2Loading } = useDedupStatsV2()
  const { data: health, isLoading: healthLoading } = useDedupHealth()
  const dedupCheck = useDedupCheck()
  const dedupClear = useDedupClear()

  const handleCheck = () => {
    if (!checkContent.trim()) return
    try {
      const parsed = JSON.parse(checkContent)
      dedupCheck.mutate({ content: parsed })
    } catch {
      dedupCheck.mutate({ content: { text: checkContent.trim() } })
    }
  }

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    dedupClear.mutate(undefined)
    setConfirmClear(false)
  }

  return (
    <div className="space-y-6">
      {/* Legacy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Dedup Mode', value: dedupStats?.mode || '—' },
          { label: 'Total Checked', value: dedupStats?.total_checked?.toLocaleString() || '—' },
          { label: 'Duplicates Found', value: dedupStats?.duplicates_found?.toLocaleString() || '—' },
        ].map(({ label, value }) => (
          <Card key={label} className="p-6">
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <div className="text-2xl font-bold">
              {dedupLoading ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : value}
            </div>
          </Card>
        ))}

        {dedupStats?.dedup_rate != null && (
          <Card className="p-6 md:col-span-3">
            <div className="text-sm text-muted-foreground mb-2">Dedup Rate</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${dedupStats.dedup_rate * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold">{(dedupStats.dedup_rate * 100).toFixed(1)}%</span>
            </div>
            {dedupStats.last_updated && (
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(dedupStats.last_updated).toLocaleString()}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Service Stats + Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Service Stats</h3>
          </div>
          {v2Loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : v2Stats ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <Badge variant="secondary">{v2Stats.mode}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Fingerprints</span>
                <span className="font-bold">{v2Stats.total_fingerprints?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Redis Available</span>
                <Badge variant={v2Stats.redis_available ? 'success' : 'destructive'}>
                  {v2Stats.redis_available ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Health</h3>
          </div>
          {healthLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : health ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'secondary' : 'destructive'}>
                  {health.status}
                </Badge>
              </div>
              {health.mode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">{health.mode}</span>
                </div>
              )}
              {health.redis_available !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Redis</span>
                  <Badge variant={health.redis_available ? 'success' : 'secondary'}>
                    {health.redis_available ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              )}
              {health.error && (
                <div className="text-xs text-destructive mt-2 p-2 rounded bg-destructive/10">
                  {health.error}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Dedup Check Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Duplicate Check</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Test if content would be flagged as duplicate. Enter JSON or plain text.
        </p>
        <textarea
          value={checkContent}
          onChange={(e) => setCheckContent(e.target.value)}
          placeholder='{"barcode": "4710088412345", "name": "Sample Product"}'
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono resize-none"
        />
        <div className="flex items-center gap-3 mt-3">
          <Button onClick={handleCheck} disabled={!checkContent.trim() || dedupCheck.isPending}>
            {dedupCheck.isPending ? 'Checking...' : 'Check'}
          </Button>
          {dedupCheck.data && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={dedupCheck.data.is_duplicate ? 'destructive' : 'success'}>
                {dedupCheck.data.is_duplicate ? 'Duplicate' : 'Unique'}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                {dedupCheck.data.fingerprint}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Admin Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={dedupClear.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {dedupClear.isPending ? 'Clearing...' : confirmClear ? 'Confirm Clear All?' : 'Clear All Fingerprints'}
          </Button>
          {confirmClear && (
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          )}
          {dedupClear.data && (
            <span className="text-sm text-muted-foreground">
              Cleared {dedupClear.data.cleared} fingerprints ({dedupClear.data.mode})
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}
