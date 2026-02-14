'use client'

import { Badge } from '@/components/ui/badge'
import { useETLHealth } from '@/hooks/useETL'

export default function ETLHealthBadge() {
  const { data: health, isLoading } = useETLHealth()

  if (isLoading) return <Badge variant="secondary" className="text-xs">ETL: ...</Badge>

  return (
    <Badge
      variant={health?.status === 'ok' || health?.status === 'healthy' ? 'success' : 'destructive'}
      className="text-xs"
    >
      ETL: {health?.status ?? 'unknown'}
      {health?.workers != null && ` (${health.workers}w)`}
    </Badge>
  )
}
