'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RawLawsTable from '@/components/lawcore/RawLawsTable'
import PromoteRulesForm from '@/components/lawcore/PromoteRulesForm'
import { lawCoreAPI } from '@/lib/api/lawcore'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

function LawCoreAdminContent() {
  const [verifying, setVerifying] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lawcore', 'pending-laws'],
    queryFn: () => lawCoreAPI.getPendingRawLaws(),
  })

  const handleVerify = async (rawRegId: string, verified: boolean) => {
    setVerifying(true)

    try {
      await lawCoreAPI.verifyRawLaw({ raw_reg_id: rawRegId, verified })
      toast.success(verified ? 'Law verified successfully' : 'Law rejected')

      // Refetch to update the list
      await queryClient.invalidateQueries({ queryKey: ['lawcore', 'pending-laws'] })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed'
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  const handlePromoteSuccess = async () => {
    // Refresh pending laws and rules stats
    await queryClient.invalidateQueries({ queryKey: ['lawcore'] })
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load admin data"
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
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">LawCore Admin</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage raw laws verification and promote rules (Admin only)
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Admin Operations</h4>
        <p className="text-xs text-yellow-700">
          Verifying and promoting rules directly affects the LawCore database.
          All operations are logged and auditable. Use with caution.
        </p>
      </div>

      {/* Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Raw Laws</TabsTrigger>
          <TabsTrigger value="promote">Promote Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Pending Verification</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Review and verify raw law documents before promoting to rules
              </p>
            </div>

            {isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : data ? (
              <>
                <RawLawsTable
                  laws={data.pending_laws.filter(law => law.verification_status === 'PENDING')}
                  onVerify={handleVerify}
                  loading={verifying}
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  Total pending: {data.pending_laws.filter(law => law.verification_status === 'PENDING').length}
                </div>
              </>
            ) : null}
          </Card>
        </TabsContent>

        <TabsContent value="promote">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold">Promote Rules</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Create active rules from verified raw law documents
              </p>
            </div>

            <PromoteRulesForm onSuccess={handlePromoteSuccess} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function LawCoreAdminPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load LawCore Admin"
          message="An unexpected error occurred while loading the admin panel."
        />
      }
    >
      <LawCoreAdminContent />
    </ErrorBoundary>
  )
}
