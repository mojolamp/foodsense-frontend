'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, ShieldOff } from 'lucide-react'
import { useKillSwitch, useActivateKillSwitch, useDeactivateKillSwitch } from '@/hooks/usePacAdmin'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { KillSwitchScope } from '@/types/pacAdmin'

export default function KillSwitchPanel() {
  const { t } = useTranslation()
  const { data, isLoading } = useKillSwitch()
  const activateKillSwitch = useActivateKillSwitch()
  const deactivateKillSwitch = useDeactivateKillSwitch()

  const [showActivateForm, setShowActivateForm] = useState(false)
  const [scope, setScope] = useState<KillSwitchScope>('global')
  const [scopeId, setScopeId] = useState('')
  const [reason, setReason] = useState('')
  const [ttl, setTtl] = useState(3600)

  const handleActivate = () => {
    if (!reason.trim()) return
    activateKillSwitch.mutate(
      {
        scope,
        scope_id: scope === 'tenant' ? scopeId : undefined,
        reason,
        ttl_seconds: ttl,
      },
      { onSuccess: () => { setShowActivateForm(false); setReason(''); setScopeId('') } }
    )
  }

  const handleDeactivate = (deactScope: KillSwitchScope, deactScopeId?: string) => {
    deactivateKillSwitch.mutate({
      scope: deactScope,
      scope_id: deactScopeId || undefined,
    })
  }

  const isActive = data?.global_override != null || (data?.active_overrides?.length ?? 0) > 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('controlPlaneV2.killSwitch.title')}</h3>
        {!isLoading && (
          <Badge variant={isActive ? 'destructive' : 'success'}>
            {isActive ? t('controlPlaneV2.killSwitch.active') : t('controlPlaneV2.killSwitch.inactive')}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-5 w-56 bg-muted rounded animate-pulse" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Resolved Mode */}
          <div className="text-sm">
            <span className="text-muted-foreground">{t('controlPlaneV2.killSwitch.resolvedMode')}</span>
            <span className="font-medium">{data.resolved_mode.mode}</span>
            {data.resolved_mode.reason && (
              <span className="text-muted-foreground ml-2">({data.resolved_mode.reason})</span>
            )}
          </div>

          {/* Active Overrides */}
          {data.active_overrides.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {t('controlPlaneV2.killSwitch.activeOverrides', { count: data.active_overrides.length })}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.killSwitch.tableScope')}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.killSwitch.tableMode')}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.killSwitch.tableReason')}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.killSwitch.tableExpires')}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.killSwitch.tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.active_overrides.map((override, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="p-2">
                          {override.scope}
                          {override.scope_id && <span className="text-xs text-muted-foreground ml-1">({override.scope_id})</span>}
                        </td>
                        <td className="p-2">
                          <Badge variant="destructive" className="text-xs">{override.mode}</Badge>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate">
                          {override.reason}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {new Date(override.expires_at).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeactivate(override.scope as KillSwitchScope, override.scope_id || undefined)}
                            disabled={deactivateKillSwitch.isPending}
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activate Form */}
          {!showActivateForm ? (
            <Button
              variant="destructive"
              onClick={() => setShowActivateForm(true)}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {t('controlPlaneV2.killSwitch.activateTitle')}
            </Button>
          ) : (
            <div className="p-4 border border-destructive/30 rounded-lg space-y-3">
              <div className="text-sm font-medium text-destructive">{t('controlPlaneV2.killSwitch.activateTitle')}</div>

              <div className="flex gap-2">
                {(['global', 'tenant'] as KillSwitchScope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      scope === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {scope === 'tenant' && (
                <input
                  type="text"
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  placeholder={t('controlPlaneV2.killSwitch.tenantIdPlaceholder')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              )}

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('controlPlaneV2.killSwitch.reasonPlaceholder')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />

              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">{t('controlPlaneV2.killSwitch.ttlLabel')}</label>
                <input
                  type="number"
                  value={ttl}
                  onChange={(e) => setTtl(Number(e.target.value))}
                  min={1}
                  className="w-24 px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
                />
                <span className="text-xs text-muted-foreground">{t('controlPlaneV2.killSwitch.ttlUnit')}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleActivate}
                  disabled={!reason.trim() || activateKillSwitch.isPending}
                >
                  {activateKillSwitch.isPending ? t('controlPlaneV2.killSwitch.activating') : t('controlPlaneV2.killSwitch.confirmActivate')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowActivateForm(false)}>
                  {t('controlPlaneV2.killSwitch.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
