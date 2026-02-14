'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useStrategyLint } from '@/hooks/usePacAdmin'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { LintSeverity } from '@/types/pacAdmin'

const SEVERITY_ICONS: Record<LintSeverity, typeof AlertTriangle> = {
  ERROR: XCircle,
  WARNING: AlertTriangle,
  INFO: Info,
}

const SEVERITY_COLORS: Record<LintSeverity, string> = {
  ERROR: 'text-red-600',
  WARNING: 'text-orange-600',
  INFO: 'text-blue-600',
}

const SEVERITY_VARIANTS: Record<LintSeverity, 'destructive' | 'default' | 'secondary'> = {
  ERROR: 'destructive',
  WARNING: 'default',
  INFO: 'secondary',
}

export default function StrategyLintResults() {
  const { t } = useTranslation()
  const { data, isLoading } = useStrategyLint()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <Card className={`p-4 ${data.passed ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
        <div className="flex items-center gap-3">
          {data.passed ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
          <div>
            <div className="font-semibold">
              {data.passed ? t('controlPlaneV2.strategyLint.allPassed') : t('controlPlaneV2.strategyLint.failuresDetected')}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('controlPlaneV2.strategyLint.errors', { count: data.error_count })} · {t('controlPlaneV2.strategyLint.warnings', { count: data.warning_count })} · {t('controlPlaneV2.strategyLint.info', { count: data.info_count })}
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      {data.results.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.strategyLint.tableSeverity')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.strategyLint.tableRule')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.strategyLint.tableMessage')}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t('controlPlaneV2.strategyLint.tableFile')}</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((result, i) => {
                  const Icon = SEVERITY_ICONS[result.severity]
                  return (
                    <tr key={i} className="border-b border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${SEVERITY_COLORS[result.severity]}`} />
                          <Badge variant={SEVERITY_VARIANTS[result.severity]} className="text-xs">
                            {result.severity}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{result.rule}</td>
                      <td className="p-3 text-xs">
                        {result.message}
                        {result.detail && (
                          <div className="text-muted-foreground mt-1">{result.detail}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{result.file}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
