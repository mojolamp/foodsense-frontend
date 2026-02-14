'use client'

import { usePacDiagnostics } from '@/hooks/usePacAdmin'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { PacSubsystemCheck, PacSubsystemStatus } from '@/types/pacAdmin'

const STATUS_CONFIG: Record<PacSubsystemStatus, {
  variant: 'success' | 'destructive' | 'secondary'
  icon: typeof CheckCircle2
}> = {
  ok: { variant: 'success', icon: CheckCircle2 },
  degraded: { variant: 'secondary', icon: AlertTriangle },
  unhealthy: { variant: 'destructive', icon: XCircle },
  unavailable: { variant: 'secondary', icon: HelpCircle },
}

function getDetailSummary(check: PacSubsystemCheck, t: (key: string, params?: Record<string, string | number>) => string): string | null {
  if (!check.detail || check.status === 'ok' || check.status === 'unavailable') return null
  const d = check.detail
  const parts: string[] = []
  if (d.mode) parts.push(t('controlPlaneV2.pacDiagnostics.detail.mode', { value: String(d.mode) }))
  if (d.active_count) parts.push(t('controlPlaneV2.pacDiagnostics.detail.activeCount', { value: String(d.active_count) }))
  if (d.overdue_total) parts.push(t('controlPlaneV2.pacDiagnostics.detail.overdueTotal', { value: String(d.overdue_total) }))
  if (d.error_count) parts.push(t('controlPlaneV2.pacDiagnostics.detail.errorCount', { value: String(d.error_count) }))
  return parts.length > 0 ? parts.join(' | ') : null
}

function SubsystemRow({ check, t }: { check: PacSubsystemCheck; t: (key: string, params?: Record<string, string | number>) => string }) {
  const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.unavailable
  const Icon = config.icon
  const summary = getDetailSummary(check, t)

  // Try to get translated subsystem name, fall back to raw key
  const subsystemLabel = t(`controlPlaneV2.pacDiagnostics.subsystems.${check.subsystem}`)
  const displayLabel = subsystemLabel.startsWith('controlPlaneV2.') ? check.subsystem : subsystemLabel

  // Get translated status label
  const statusLabel = t(`controlPlaneV2.pacDiagnostics.status.${check.status}`)
  const displayStatus = statusLabel.startsWith('controlPlaneV2.') ? check.status : statusLabel

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${
          check.status === 'ok' ? 'text-green-500' :
          check.status === 'degraded' ? 'text-yellow-500' :
          check.status === 'unhealthy' ? 'text-red-500' :
          'text-muted-foreground'
        }`} />
        <span className="text-sm font-medium">
          {displayLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {summary && (
          <span className="text-xs text-muted-foreground max-w-[200px] truncate">
            {summary}
          </span>
        )}
        <Badge variant={config.variant} className="text-xs">
          {displayStatus}
        </Badge>
      </div>
    </div>
  )
}

export default function PacDiagnosticsPanel() {
  const { t } = useTranslation()
  const { data: diagnostics, isLoading, error } = usePacDiagnostics()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10">
        <p className="text-destructive text-sm">
          {t('controlPlaneV2.pacDiagnostics.unavailable', { message: (error as Error).message })}
        </p>
      </Card>
    )
  }

  if (!diagnostics) return null

  const overallConfig = diagnostics.status === 'healthy'
    ? { variant: 'success' as const, label: t('controlPlaneV2.pacDiagnostics.healthy') }
    : diagnostics.status === 'degraded'
    ? { variant: 'secondary' as const, label: t('controlPlaneV2.pacDiagnostics.degraded') }
    : { variant: 'destructive' as const, label: t('controlPlaneV2.pacDiagnostics.unhealthy') }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{t('controlPlaneV2.pacDiagnostics.overallStatus')}</span>
        <Badge variant={overallConfig.variant} className="text-xs">
          {overallConfig.label}
        </Badge>
      </div>

      {/* Subsystem Checks */}
      <div className="rounded-lg border border-border bg-muted/10 px-4">
        {diagnostics.checks.map((check) => (
          <SubsystemRow key={check.subsystem} check={check} t={t} />
        ))}
      </div>

      {/* Suggested Actions */}
      {diagnostics.suggested_actions.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">{t('controlPlaneV2.pacDiagnostics.suggestedActions')}</span>
          <ul className="space-y-1">
            {diagnostics.suggested_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
