'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { monitoringAPI } from '@/lib/api/monitoring'

export default function RecentErrorsList() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard', 'dashboard-data'],
    queryFn: () => monitoringAPI.getDashboardData(),
    refetchInterval: 30_000,
    retry: 1,
  })

  const alerts = dashData?.alerts ?? []

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Recent Alerts</h3>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Badge
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-[10px] shrink-0 mt-0.5"
              >
                {alert.severity}
              </Badge>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{alert.type}</div>
                <div className="text-[11px] text-muted-foreground truncate">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground py-2">
          No active alerts — system healthy.
        </div>
      )}
    </Card>
  )
}
