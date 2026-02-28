'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RawLawsTable from '@/components/lawcore/RawLawsTable'
import PromoteRulesForm from '@/components/lawcore/PromoteRulesForm'
import { lawCoreAPI, type ImportRawLawsPayload } from '@/lib/api/lawcore'
import ErrorState from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

const IMPORT_SOURCES = ['TFDA', 'EFSA', 'JECFA', 'MANUAL'] as const
const IMPORT_TEMPLATE = JSON.stringify([
  {
    title: "食品添加物使用範圍及限量暨規格標準",
    official_id: "衛授食字第1131300726號",
    category: "REGULATION",
    issuing_agency: "衛生福利部食品藥物管理署",
    publication_date: "2024-03-15",
    effective_date: "2024-03-15"
  }
], null, 2)

function LawCoreAdminContent() {
  const [verifying, setVerifying] = useState(false)
  const [importSource, setImportSource] = useState<typeof IMPORT_SOURCES[number]>('MANUAL')
  const [importJson, setImportJson] = useState('')
  const [importing, setImporting] = useState(false)
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

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error('Please enter JSON data')
      return
    }

    let laws: ImportRawLawsPayload['laws']
    try {
      const parsed = JSON.parse(importJson.trim())
      laws = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      toast.error('Invalid JSON format')
      return
    }

    if (laws.length === 0) {
      toast.error('No laws to import')
      return
    }

    // Validate each law has at least title and category
    for (const law of laws) {
      if (!law.title) {
        toast.error('Each law must have a "title" field')
        return
      }
      if (!law.category || !['ACT', 'REGULATION', 'ANNOUNCEMENT', 'GUIDELINE'].includes(law.category)) {
        toast.error(`Invalid category for "${law.title}". Must be ACT, REGULATION, ANNOUNCEMENT, or GUIDELINE`)
        return
      }
    }

    setImporting(true)
    try {
      const result = await lawCoreAPI.importRawLaws({ source: importSource, laws })
      toast.success(result.message)
      setImportJson('')
      await queryClient.invalidateQueries({ queryKey: ['lawcore'] })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed'
      toast.error(message)
    } finally {
      setImporting(false)
    }
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
          <TabsTrigger value="import">Import Laws</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Pending Verification</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Review and verify raw law documents before promoting to rules
              </p>
            </div>

            {error ? (
              <ErrorState
                title="Failed to load pending laws"
                message={error instanceof Error ? error.message : 'Unknown error'}
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : data?.pending_laws ? (
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

        <TabsContent value="import">
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Import Regulatory Data</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Import raw law documents from TFDA, EFSA, JECFA, or manual entry.
                Imported records will appear in &quot;Pending Raw Laws&quot; for verification.
              </p>
            </div>

            {/* Source selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Source
              </label>
              <div className="flex gap-2">
                {IMPORT_SOURCES.map((src) => (
                  <button
                    key={src}
                    onClick={() => setImportSource(src)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                      importSource === src
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* JSON input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Laws JSON (array of objects)
                </label>
                <button
                  onClick={() => setImportJson(IMPORT_TEMPLATE)}
                  className="text-[10px] text-primary hover:underline"
                >
                  Load template
                </button>
              </div>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={`[\n  {\n    "title": "...",\n    "official_id": "...",\n    "category": "REGULATION",\n    "issuing_agency": "..."\n  }\n]`}
                rows={12}
                className="w-full rounded-md border border-border bg-background p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>

            {/* Required fields reference */}
            <div className="mb-4 p-3 bg-muted/50 rounded-md">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">Required Fields</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
                <span><code className="text-primary">title</code> — Document title</span>
                <span><code className="text-primary">category</code> — ACT / REGULATION / ANNOUNCEMENT / GUIDELINE</span>
                <span><code className="text-muted-foreground">official_id</code> — Official document ID (dedup key)</span>
                <span><code className="text-muted-foreground">issuing_agency</code> — Issuing authority</span>
                <span><code className="text-muted-foreground">publication_date</code> — YYYY-MM-DD</span>
                <span><code className="text-muted-foreground">effective_date</code> — YYYY-MM-DD</span>
              </div>
            </div>

            {/* Preview count */}
            {importJson.trim() && (() => {
              try {
                const parsed = JSON.parse(importJson.trim())
                const count = Array.isArray(parsed) ? parsed.length : 1
                return (
                  <p className="text-xs text-muted-foreground mb-4">
                    Ready to import <span className="font-semibold text-foreground">{count}</span> law{count !== 1 ? 's' : ''} from <span className="font-semibold text-foreground">{importSource}</span>
                  </p>
                )
              } catch {
                return (
                  <p className="text-xs text-destructive mb-4">Invalid JSON format</p>
                )
              }
            })()}

            {/* Submit */}
            <Button
              onClick={handleImport}
              disabled={importing || !importJson.trim()}
              className="w-full"
            >
              {importing ? 'Importing...' : 'Import to Staging'}
            </Button>
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
