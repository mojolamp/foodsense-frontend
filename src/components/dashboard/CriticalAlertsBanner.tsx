'use client'

import { AlertTriangle, ShieldOff, Power } from 'lucide-react'
import { useEngineMode, useKillSwitch } from '@/hooks/usePacAdmin'

export default function CriticalAlertsBanner() {
  const { data: engineMode } = useEngineMode()
  const { data: killSwitch } = useKillSwitch()

  const alerts: { icon: React.ElementType; message: string; severity: 'critical' | 'warning' }[] = []

  if (engineMode?.mode && engineMode.mode !== 'NORMAL') {
    alerts.push({
      icon: ShieldOff,
      message: `Engine Mode: ${engineMode.mode}`,
      severity: engineMode.mode === 'SAFETY_LOCKDOWN' ? 'critical' : 'warning',
    })
  }

  if (killSwitch?.global_override || (killSwitch?.active_overrides && killSwitch.active_overrides.length > 0)) {
    const override = killSwitch.global_override ?? killSwitch.active_overrides[0]
    alerts.push({
      icon: Power,
      message: `Kill Switch: ACTIVE (${override?.scope ?? 'global'} → ${killSwitch.resolved_mode?.mode ?? 'LOCKDOWN'})`,
      severity: 'critical',
    })
  }

  if (alerts.length === 0) return null

  const hasCritical = alerts.some(a => a.severity === 'critical')

  return (
    <div className={`rounded-lg border px-4 py-3 ${
      hasCritical
        ? 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
        : 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20'
    }`}>
      <div className="flex items-center gap-3 flex-wrap">
        <AlertTriangle className={`h-4 w-4 shrink-0 ${hasCritical ? 'text-red-600' : 'text-yellow-600'}`} />
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-center gap-1.5 text-sm font-medium">
            <alert.icon className="h-3.5 w-3.5" />
            <span>{alert.message}</span>
            {i < alerts.length - 1 && <span className="text-muted-foreground mx-1">|</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
