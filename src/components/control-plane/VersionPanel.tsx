'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVersionRegistry } from '@/hooks/usePacAdmin'
import { useVersionInfo, useSupportedVersions, useDeprecations } from '@/hooks/useVersionInfo'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function VersionPanel() {
  const { t } = useTranslation()
  const { data: registry, isLoading: registryLoading } = useVersionRegistry()
  const { data: versionInfo, isLoading: versionLoading } = useVersionInfo()
  const { data: supported } = useSupportedVersions()
  const { data: deprecations } = useDeprecations()

  return (
    <div className="space-y-4">
      {/* Composite Fingerprint */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('controlPlaneV2.version.fingerprint')}</h3>
        {registryLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : registry?.fingerprint ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(registry.fingerprint).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground min-w-[120px]">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="font-mono text-xs break-all">{value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {/* API Versions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('controlPlaneV2.version.apiVersions')}</h3>
        {versionLoading ? (
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="h-5 w-56 bg-muted rounded animate-pulse" />
          </div>
        ) : versionInfo ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('controlPlaneV2.version.current')}</span>
                <span className="font-medium">{versionInfo.current_version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('controlPlaneV2.version.latest')}</span>
                <span className="font-medium">{versionInfo.latest_version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('controlPlaneV2.version.default')}</span>
                <span className="font-medium">{versionInfo.default_version}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('controlPlaneV2.version.supported')}</span>
              {versionInfo.supported_versions.map((v) => (
                <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
              ))}
            </div>

            {versionInfo.deprecated_versions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('controlPlaneV2.version.deprecated')}</span>
                {versionInfo.deprecated_versions.map((v) => (
                  <Badge key={v} variant="destructive" className="text-xs">{v}</Badge>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Card>

      {/* Supported Versions Detail */}
      {supported && supported.supported_versions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('controlPlaneV2.version.versionDetails')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.version.tableVersion')}</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.version.tablePrefix')}</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">{t('controlPlaneV2.version.tableStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {supported.supported_versions.map((v) => (
                  <tr key={v.version} className="border-b border-border">
                    <td className="p-2 font-mono">{v.version}</td>
                    <td className="p-2 font-mono text-xs text-muted-foreground">{v.endpoint_prefix}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {v.is_latest && <Badge variant="success" className="text-xs">{t('controlPlaneV2.version.badgeLatest')}</Badge>}
                        {v.is_default && <Badge variant="secondary" className="text-xs">{t('controlPlaneV2.version.badgeDefault')}</Badge>}
                        {v.is_deprecated && <Badge variant="destructive" className="text-xs">{t('controlPlaneV2.version.badgeDeprecated')}</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Deprecations */}
      {deprecations && deprecations.deprecated_versions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('controlPlaneV2.version.deprecationNotices')}</h3>
          <div className="space-y-3">
            {deprecations.deprecated_versions.map((d) => (
              <div key={d.version} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm">
                <div className="font-medium">{d.version} — {t('controlPlaneV2.version.sunset', { date: d.sunset_date })}</div>
                <div className="text-muted-foreground text-xs mt-1">
                  {d.reason} · {t('controlPlaneV2.version.replaceWith', { replacement: d.replacement })}
                </div>
              </div>
            ))}
            {deprecations.recommendation && (
              <div className="text-sm text-muted-foreground">{deprecations.recommendation}</div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
