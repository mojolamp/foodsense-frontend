'use client'

import { Badge } from '@/components/ui/badge'
import EngineModePanel from '@/components/control-plane/EngineModePanel'
import KillSwitchPanel from '@/components/control-plane/KillSwitchPanel'
import QuarantineTable from '@/components/control-plane/QuarantineTable'
import StrategyLintResults from '@/components/control-plane/StrategyLintResults'
import VersionPanel from '@/components/control-plane/VersionPanel'
import PacDiagnosticsPanel from '@/components/control-plane/PacDiagnosticsPanel'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import { useEngineMode, useKillSwitch, usePacHealth } from '@/hooks/usePacAdmin'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { isFeatureEnabled } from '@/lib/featureFlags'

export default function ControlPlanePage() {
  const { t } = useTranslation()
  const { data: engineMode } = useEngineMode()
  const { data: killSwitch } = useKillSwitch()
  const { data: pacHealth } = usePacHealth()

  const isKillActive = killSwitch?.global_override || (killSwitch?.active_overrides && killSwitch.active_overrides.length > 0)
  const showPacDiagnostics = isFeatureEnabled('pac_diagnostics')
  const showTabFlattening = isFeatureEnabled('tab_flattening')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('controlPlaneV2.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('controlPlaneV2.subtitle')}
        </p>
      </div>

      {/* Status Strip (tab_flattening feature) */}
      {showTabFlattening && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg border border-border bg-muted/30 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('controlPlaneV2.statusStrip.mode')}:</span>
            <Badge
              variant={engineMode?.mode === 'NORMAL' ? 'success' : 'destructive'}
              className="text-xs"
            >
              {engineMode?.mode ?? t('controlPlaneV2.statusStrip.unknown')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('controlPlaneV2.statusStrip.killSwitch')}:</span>
            <Badge
              variant={isKillActive ? 'destructive' : 'success'}
              className="text-xs"
            >
              {isKillActive ? t('controlPlaneV2.statusStrip.active') : t('controlPlaneV2.statusStrip.inactive')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('controlPlaneV2.statusStrip.pacHealth')}:</span>
            <Badge
              variant={
                pacHealth?.status === 'ok' ? 'success' :
                pacHealth?.status === 'degraded' ? 'secondary' :
                pacHealth?.status === 'unhealthy' ? 'destructive' :
                'secondary'
              }
              className="text-xs"
            >
              {pacHealth?.status?.toUpperCase() ?? t('controlPlaneV2.statusStrip.unknown')}
            </Badge>
          </div>
        </div>
      )}

      {/* Engine Mode & Kill Switch (side by side, always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EngineModePanel />
        <KillSwitchPanel />
      </div>

      {/* Quarantine (collapsible, default expanded) */}
      <CollapsibleSection title={t('controlPlaneV2.sections.quarantine')} defaultOpen={true}>
        <QuarantineTable />
      </CollapsibleSection>

      {/* Strategy Lint + Version (side by side, collapsible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CollapsibleSection title={t('controlPlaneV2.sections.strategyLint')} defaultOpen={false}>
          <StrategyLintResults />
        </CollapsibleSection>
        <CollapsibleSection title={t('controlPlaneV2.sections.versionBuild')} defaultOpen={false}>
          <VersionPanel />
        </CollapsibleSection>
      </div>

      {/* PaC Diagnostics (collapsible, gated by feature flag) */}
      {showPacDiagnostics && (
        <CollapsibleSection title={t('controlPlaneV2.sections.pacDiagnostics')} defaultOpen={false}>
          <PacDiagnosticsPanel />
        </CollapsibleSection>
      )}
    </div>
  )
}
