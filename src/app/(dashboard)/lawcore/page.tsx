'use client'

import { useQuery } from '@tanstack/react-query'
import { Scale, Database, FileText, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import PresenceQuickCheck from '@/components/lawcore/PresenceQuickCheck'
import { lawCoreAPI } from '@/lib/api/lawcore'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function LawCoreOverviewContent() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['lawcore', 'stats'],
    queryFn: () => lawCoreAPI.getRulesStats(),
    refetchInterval: 60000, // Refetch every minute
  })

  const { data: pendingLaws } = useQuery({
    queryKey: ['lawcore', 'pending-laws'],
    queryFn: () => lawCoreAPI.getPendingRawLaws(),
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load LawCore status"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">LawCore Overview</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Presence Gate v1.0 - Regulatory data verification system
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Active Rules</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{stats?.active_rules_count || 0}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pending Raw Laws</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{pendingLaws?.count || 0}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">DB Status</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-lg font-semibold text-green-600">Healthy</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xs font-medium">
                  {stats?.last_updated
                    ? new Date(stats.last_updated).toLocaleString()
                    : 'N/A'}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Authority Distribution */}
      {stats?.by_authority && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Rules by Authority Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.by_authority).map(([authority, count]) => (
              <div key={authority} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{authority}</span>
                <span className="text-lg font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Check */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Quick Presence Check</h3>
        <PresenceQuickCheck />
      </Card>
    </div>
  )
}

export default function LawCoreOverviewPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load LawCore Overview"
          message="An unexpected error occurred while loading the overview page. Please refresh the page or contact support if the problem persists."
        />
      }
    >
      <LawCoreOverviewContent />
    </ErrorBoundary>
  )
}
