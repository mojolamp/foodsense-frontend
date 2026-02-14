'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEngineMode, useSetEngineMode } from '@/hooks/usePacAdmin'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { EngineModeValue } from '@/types/pacAdmin'

const MODE_COLORS: Record<EngineModeValue, 'success' | 'destructive' | 'secondary'> = {
  NORMAL: 'success',
  SAFETY_LOCKDOWN: 'destructive',
  READONLY_CACHE: 'secondary',
}

export default function EngineModePanel() {
  const { t } = useTranslation()
  const { data, isLoading } = useEngineMode()
  const setEngineMode = useSetEngineMode()

  const [selectedMode, setSelectedMode] = useState<EngineModeValue | ''>('')
  const [reason, setReason] = useState('')
  const [ttl, setTtl] = useState(3600)

  const handleApply = () => {
    if (!selectedMode || !reason.trim()) return
    setEngineMode.mutate(
      { mode: selectedMode, reason, ttl_seconds: ttl },
      { onSuccess: () => { setSelectedMode(''); setReason('') } }
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('controlPlaneV2.engineMode.title')}</h3>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3">
            <Badge variant={MODE_COLORS[data.mode]} className="text-sm px-3 py-1">
              {data.mode}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t('controlPlaneV2.engineMode.source', { source: data.source })}
            </span>
            {data.set_by && (
              <span className="text-sm text-muted-foreground">
                {t('controlPlaneV2.engineMode.setBy', { setBy: data.set_by })}
              </span>
            )}
          </div>

          {data.expires_at && (
            <div className="text-xs text-muted-foreground">
              {t('controlPlaneV2.engineMode.expires', { time: new Date(data.expires_at).toLocaleString() })}
              {data.ttl_seconds && ` ${t('controlPlaneV2.engineMode.ttlSuffix', { ttl: String(data.ttl_seconds) })}`}
            </div>
          )}

          {/* Change Mode */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="text-sm font-medium">{t('controlPlaneV2.engineMode.changeMode')}</div>
            <div className="flex flex-wrap gap-2">
              {(['NORMAL', 'SAFETY_LOCKDOWN', 'READONLY_CACHE'] as EngineModeValue[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selectedMode === mode
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {selectedMode && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('controlPlaneV2.engineMode.reasonPlaceholder')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">{t('controlPlaneV2.engineMode.ttlLabel')}</label>
                  <input
                    type="number"
                    value={ttl}
                    onChange={(e) => setTtl(Number(e.target.value))}
                    min={1}
                    className="w-24 px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
                  />
                  <Button
                    onClick={handleApply}
                    disabled={!reason.trim() || setEngineMode.isPending}
                    size="sm"
                  >
                    {setEngineMode.isPending ? t('controlPlaneV2.engineMode.applying') : t('controlPlaneV2.engineMode.apply')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
