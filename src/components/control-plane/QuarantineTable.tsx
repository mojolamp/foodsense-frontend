'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle, Unlock } from 'lucide-react'
import {
  useQuarantineEvents,
  useQuarantineStats,
  useQuarantineSLA,
  useReviewQuarantine,
  useReleaseQuarantine,
  useBulkReviewQuarantine,
} from '@/hooks/usePacAdmin'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { QuarantineReviewStatus, QuarantineSeverity } from '@/types/pacAdmin'

const SEVERITY_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  CRITICAL: 'destructive',
  WARN: 'default',
  INFO: 'secondary',
}

const STATUS_VARIANTS: Record<string, 'secondary' | 'success' | 'destructive' | 'default'> = {
  PENDING: 'secondary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  RELEASED: 'default',
}

export default function QuarantineTable() {
  const { t } = useTranslation()
  const [filterSeverity, setFilterSeverity] = useState<QuarantineSeverity | ''>('')
  const [filterStatus, setFilterStatus] = useState<QuarantineReviewStatus | ''>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [reviewNote, setReviewNote] = useState('')

  const { data: statsData, isLoading: statsLoading } = useQuarantineStats()
  const { data: slaData } = useQuarantineSLA()
  const { data: eventsData, isLoading: eventsLoading } = useQuarantineEvents({
    severity: filterSeverity || undefined,
    status: filterStatus || undefined,
  })

  const reviewQuarantine = useReviewQuarantine()
  const releaseQuarantine = useReleaseQuarantine()
  const bulkReview = useBulkReviewQuarantine()

  const events = eventsData?.events || []
  const stats = statsData

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkAction = (action: 'APPROVED' | 'REJECTED') => {
    if (selectedIds.size === 0) return
    bulkReview.mutate(
      { event_ids: Array.from(selectedIds), review_status: action, review_note: reviewNote || undefined },
      { onSuccess: () => { setSelectedIds(new Set()); setReviewNote('') } }
    )
  }

  return (
    <div className="space-y-4">
      {/* SLA Warning Banner */}
      {slaData && slaData.overdue_count > 0 && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-destructive font-medium">
            {t('controlPlaneV2.quarantine.overdueEvents', { count: slaData.overdue_count })}
          </span>
          <span className="text-muted-foreground">
            (CRITICAL: {slaData.backlog.CRITICAL || 0}, WARN: {slaData.backlog.WARN || 0})
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('controlPlaneV2.quarantine.statCritical'), value: stats?.CRITICAL, color: 'text-red-600' },
          { label: t('controlPlaneV2.quarantine.statWarn'), value: stats?.WARN, color: 'text-orange-600' },
          { label: t('controlPlaneV2.quarantine.statInfo'), value: stats?.INFO, color: 'text-blue-600' },
          { label: t('controlPlaneV2.quarantine.statOverdue'), value: stats?.overdue, color: 'text-destructive' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-xl font-bold ${color}`}>
              {statsLoading ? <div className="h-6 w-8 bg-muted rounded animate-pulse" /> : (value ?? 0)}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as QuarantineSeverity | '')}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">{t('controlPlaneV2.quarantine.filterAllSeverity')}</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as QuarantineReviewStatus | '')}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">{t('controlPlaneV2.quarantine.filterAllStatus')}</option>
          <option value="PENDING">{t('controlPlaneV2.quarantine.filterPending')}</option>
          <option value="APPROVED">{t('controlPlaneV2.quarantine.filterApproved')}</option>
          <option value="REJECTED">{t('controlPlaneV2.quarantine.filterRejected')}</option>
          <option value="RELEASED">{t('controlPlaneV2.quarantine.filterReleased')}</option>
        </select>

        {selectedIds.size > 0 && (
          <>
            <div className="flex-1" />
            <input
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={t('controlPlaneV2.quarantine.notePlaceholder')}
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm w-48"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('APPROVED')}
              disabled={bulkReview.isPending}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />
              {t('controlPlaneV2.quarantine.approve', { count: selectedIds.size })}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('REJECTED')}
              disabled={bulkReview.isPending}
            >
              <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" />
              {t('controlPlaneV2.quarantine.reject', { count: selectedIds.size })}
            </Button>
          </>
        )}
      </div>

      {/* Events Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === events.filter((e) => e.review_status === 'PENDING').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(events.filter((ev) => ev.review_status === 'PENDING').map((ev) => ev.id)))
                      } else {
                        setSelectedIds(new Set())
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableSeverity')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableProduct')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableReason')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableStatus')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableSLA')}</th>
                <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {eventsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground">{t('controlPlaneV2.quarantine.noEvents')}</div>
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const isOverdue = new Date(event.sla_deadline) < new Date() && event.review_status === 'PENDING'
                  return (
                    <tr key={event.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                      <td className="p-3">
                        {event.review_status === 'PENDING' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelect(event.id)}
                            className="rounded"
                          />
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={SEVERITY_VARIANTS[event.severity] || 'secondary'}>
                          {event.severity}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-xs">{event.product_id}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {event.reason}
                      </td>
                      <td className="p-3">
                        <Badge variant={STATUS_VARIANTS[event.review_status] || 'secondary'}>
                          {event.review_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {isOverdue ? (
                          <span className="text-destructive font-medium">{t('controlPlaneV2.quarantine.overdue')}</span>
                        ) : (
                          <span className="text-muted-foreground">{new Date(event.sla_deadline).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {event.review_status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => reviewQuarantine.mutate({ eventId: event.id, req: { review_status: 'APPROVED' } })}
                                disabled={reviewQuarantine.isPending}
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => reviewQuarantine.mutate({ eventId: event.id, req: { review_status: 'REJECTED' } })}
                                disabled={reviewQuarantine.isPending}
                              >
                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </>
                          )}
                          {event.review_status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => releaseQuarantine.mutate(event.id)}
                              disabled={releaseQuarantine.isPending}
                            >
                              <Unlock className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
