'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RulesTable from '@/components/lawcore/RulesTable'
import LawcoreRuleDrawer from '@/components/lawcore/LawcoreRuleDrawer'
import { lawCoreAPI, type LawCoreRule } from '@/lib/api/lawcore'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorBoundary from '@/components/ErrorBoundary'

function RulesBrowserContent() {
  const [selectedRule, setSelectedRule] = useState<LawCoreRule | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 50

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lawcore', 'rules', page],
    queryFn: () => lawCoreAPI.getRules({ limit: pageSize, offset: page * pageSize }),
  })

  const handleRuleClick = (rule: LawCoreRule) => {
    setSelectedRule(rule)
    setDrawerOpen(true)
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load rules"
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
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">LawCore Rules Browser</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse and search active regulatory rules (ACTIVE status only)
        </p>
      </div>

      {/* Stats */}
      {data && (
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Rules:</span>{' '}
            <span className="font-semibold">{data.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Showing:</span>{' '}
            <span className="font-semibold">
              {page * pageSize + 1} - {Math.min((page + 1) * pageSize, data.total)}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : data ? (
          <>
            <RulesTable rules={data.rules} onRuleClick={handleRuleClick} />

            {/* Pagination */}
            {data.total > pageSize && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {Math.ceil(data.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * pageSize >= data.total}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : null}
      </Card>

      {/* Rule Detail Drawer */}
      <LawcoreRuleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rule={selectedRule}
      />
    </div>
  )
}

export default function RulesBrowserPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Rules Browser"
          message="An unexpected error occurred while loading the rules browser."
        />
      }
    >
      <RulesBrowserContent />
    </ErrorBoundary>
  )
}
