'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Cpu, ScanLine } from 'lucide-react'
import { useTaskQueueHealth } from '@/hooks/useTaskQueue'
import { useNormalizerHealth } from '@/hooks/useNormalizer'

function HealthIndicator({
  label,
  icon: Icon,
  status,
  isLoading,
}: {
  label: string
  icon: React.ElementType
  status: string | undefined
  isLoading: boolean
}) {
  const variant = isLoading
    ? 'secondary'
    : status === 'ok' || status === 'healthy' || status === 'true'
      ? 'success'
      : 'destructive'

  const display = isLoading ? '...' : status ?? 'unknown'

  return (
    <Card className="flex items-center gap-3 p-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Badge variant={variant} className="text-xs mt-0.5">
          {display}
        </Badge>
      </div>
    </Card>
  )
}

export default function PipelineHealthRow() {
  const { data: tqHealth, isLoading: tqLoading } = useTaskQueueHealth()
  const { data: normHealth, isLoading: normLoading } = useNormalizerHealth()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <HealthIndicator
        label="Task Queue"
        icon={Activity}
        status={tqHealth?.available ? 'ok' : tqHealth ? 'down' : undefined}
        isLoading={tqLoading}
      />
      <HealthIndicator
        label="Normalizer"
        icon={Cpu}
        status={normHealth?.status}
        isLoading={normLoading}
      />
      <HealthIndicator
        label="Scan V1"
        icon={ScanLine}
        status="idle"
        isLoading={false}
      />
    </div>
  )
}
