'use client'

import { useState, useCallback } from 'react'
import { ScanLine, FileEdit, History, Upload, Settings2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DropZone from '@/components/shared/DropZone'
import OCRResultPreview from '@/components/ocr/OCRResultPreview'
import ManualSubmitForm from '@/components/ocr/ManualSubmitForm'
import OCRReviewPanel from '@/components/ocr/OCRReviewPanel'
import { useOCRScan, useIngestionSubmit, useIngestionStatus, useIngestionTrace } from '@/hooks/useOCR'
import OCRCorrectionsPanel from '@/components/ocr/OCRCorrectionsPanel'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import type { OCRSmartNormalizeResponse } from '@/types/ocr'

type TabType = 'scan' | 'manual' | 'history' | 'review'

export default function OCRScannerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('scan')

  // Scan tab state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [enableTriple, setEnableTriple] = useState(true)
  const [enableProvenance, setEnableProvenance] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRSmartNormalizeResponse | null>(null)
  const [showOptions, setShowOptions] = useState(false)

  // History tab state
  const [historyRecordId, setHistoryRecordId] = useState('')
  const [traceId, setTraceId] = useState('')

  const ocrScan = useOCRScan()
  const ingestionSubmit = useIngestionSubmit()
  const ingestionStatus = useIngestionStatus()
  const ingestionTrace = useIngestionTrace()

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file)
    setOcrResult(null)
  }, [])

  const handleStartScan = useCallback(() => {
    if (!selectedFile) return
    ocrScan.mutate(
      { image: selectedFile, enableTriple, enableProvenance },
      {
        onSuccess: (data) => {
          setOcrResult(data)
        },
      }
    )
  }, [selectedFile, enableTriple, enableProvenance, ocrScan])

  const handleSubmitToPipeline = useCallback(() => {
    if (!ocrResult?.normalized) return
    ingestionSubmit.mutate({
      source_type: 'ocr_scan',
      source_id: `ocr-${ocrResult.image_id || Date.now()}`,
      raw_payload: ocrResult.normalized as Record<string, unknown>,
    })
  }, [ocrResult, ingestionSubmit])

  const handleRescan = useCallback(() => {
    setOcrResult(null)
    if (selectedFile) {
      ocrScan.mutate(
        { image: selectedFile, enableTriple, enableProvenance },
        {
          onSuccess: (data) => {
            setOcrResult(data)
          },
        }
      )
    }
  }, [selectedFile, enableTriple, enableProvenance, ocrScan])

  const handleLookupStatus = useCallback(() => {
    if (!historyRecordId.trim()) return
    ingestionStatus.mutate(historyRecordId.trim())
  }, [historyRecordId, ingestionStatus])

  const tabs: { key: TabType; label: string; icon: typeof ScanLine }[] = [
    { key: 'scan', label: 'OCR Scan', icon: ScanLine },
    { key: 'manual', label: 'Manual Submit', icon: FileEdit },
    { key: 'history', label: 'History', icon: History },
    { key: 'review', label: 'Review Queue', icon: Eye },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OCR Scanner</h1>
        <p className="mt-2 text-muted-foreground">
          Scan product labels, submit data to the ingestion pipeline, or check submission status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column — Upload + Options */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
              <DropZone
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={20}
                onFile={handleFileSelected}
                isUploading={ocrScan.isPending}
                hint="Supports JPG, PNG, WebP up to 20MB"
              />
            </Card>

            {/* OCR Options */}
            <Card className="p-6">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Scan Options</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {[enableTriple && 'Triple', enableProvenance && 'Provenance'].filter(Boolean).join(', ') || 'Default'}
                </Badge>
              </button>

              {showOptions && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTriple}
                      onChange={(e) => setEnableTriple(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <div className="text-sm font-medium">Triple Verification</div>
                      <div className="text-xs text-muted-foreground">Cross-validate with multiple sources</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableProvenance}
                      onChange={(e) => setEnableProvenance(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <div className="text-sm font-medium">Provenance Tracking</div>
                      <div className="text-xs text-muted-foreground">Track data origin and transformations</div>
                    </div>
                  </label>
                </div>
              )}
            </Card>

            {/* Scan Button */}
            <Button
              onClick={handleStartScan}
              disabled={!selectedFile || ocrScan.isPending}
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {ocrScan.isPending ? 'Scanning...' : 'Start Scan'}
            </Button>

            {/* Ingestion Result */}
            {ingestionSubmit.data && (
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Pipeline Submission</span>
                  <Badge variant="success">Submitted</Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground space-y-1">
                  <div>Record: {ingestionSubmit.data.record_id}</div>
                  <div>Trace: {ingestionSubmit.data.trace_id}</div>
                  <div>Status: {ingestionSubmit.data.status}</div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column — Result Preview */}
          <div>
            {ocrResult ? (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Scan Result</h2>
                <OCRResultPreview
                  result={ocrResult}
                  onSubmitToPipeline={handleSubmitToPipeline}
                  onRescan={handleRescan}
                  isSubmitting={ingestionSubmit.isPending}
                />
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ScanLine className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Scan Result
                  </h3>
                  <p className="text-sm text-muted-foreground/70 max-w-sm">
                    Upload a product label image and click &quot;Start Scan&quot; to process it with the OCR pipeline.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="max-w-2xl">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Manual Ingestion Submit</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Manually submit structured data to the Ingestion Gate pipeline.
            </p>
            <ManualSubmitForm />
          </Card>
        </div>
      )}

      {activeTab === 'review' && <OCRReviewPanel />}

      {activeTab === 'history' && (
        <div className="max-w-2xl space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Lookup Submission Status</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a record ID or trace ID to check the status of a previous submission.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={historyRecordId}
                onChange={(e) => setHistoryRecordId(e.target.value)}
                placeholder="Record ID (e.g. abc-123-def)"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleLookupStatus()}
              />
              <Button
                onClick={handleLookupStatus}
                disabled={!historyRecordId.trim() || ingestionStatus.isPending}
              >
                {ingestionStatus.isPending ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
          </Card>

          {/* Trace ID Lookup */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Trace ID Lookup</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Look up all records associated with a trace ID.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={traceId}
                onChange={(e) => setTraceId(e.target.value)}
                placeholder="Trace ID (e.g. abc-123-def)"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && traceId.trim()) {
                    ingestionTrace.mutate(traceId.trim())
                  }
                }}
              />
              <Button
                onClick={() => ingestionTrace.mutate(traceId.trim())}
                disabled={!traceId.trim() || ingestionTrace.isPending}
              >
                {ingestionTrace.isPending ? 'Looking up...' : 'Trace Lookup'}
              </Button>
            </div>
            {ingestionTrace.data && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">{ingestionTrace.data.length} record(s) found</div>
                {ingestionTrace.data.map((record) => (
                  <Card key={record.id} className="p-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs">{record.id}</span>
                      <Badge
                        variant={
                          record.status === 'done' ? 'success' :
                          record.status === 'processing' ? 'default' :
                          record.status === 'dlq' ? 'destructive' : 'secondary'
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {record.source_type} / {record.source_id} | {new Date(record.created_at).toLocaleString()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Status Result */}
          {ingestionStatus.data && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Submission Detail</h3>
                <Badge
                  variant={
                    ingestionStatus.data.status === 'done' ? 'success' :
                    ingestionStatus.data.status === 'processing' ? 'default' :
                    ingestionStatus.data.status === 'dlq' ? 'destructive' :
                    'secondary'
                  }
                >
                  {ingestionStatus.data.status}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-muted-foreground">Record ID</div>
                  <div className="font-mono text-xs">{ingestionStatus.data.id}</div>

                  <div className="text-muted-foreground">Source</div>
                  <div>{ingestionStatus.data.source_type} / {ingestionStatus.data.source_id}</div>

                  <div className="text-muted-foreground">Schema Version</div>
                  <div>{ingestionStatus.data.schema_version}</div>

                  <div className="text-muted-foreground">Trace ID</div>
                  <div className="font-mono text-xs">{ingestionStatus.data.trace_id}</div>

                  <div className="text-muted-foreground">Dedup Key</div>
                  <div className="font-mono text-xs truncate">{ingestionStatus.data.dedup_key}</div>

                  <div className="text-muted-foreground">Retries</div>
                  <div>{ingestionStatus.data.retry_count} / {ingestionStatus.data.max_retries}</div>

                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(ingestionStatus.data.created_at).toLocaleString()}</div>

                  <div className="text-muted-foreground">Updated</div>
                  <div>{new Date(ingestionStatus.data.updated_at).toLocaleString()}</div>
                </div>

                {ingestionStatus.data.last_error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                    <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                      Error: {ingestionStatus.data.error_class}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-300 font-mono">
                      {ingestionStatus.data.last_error}
                    </div>
                  </div>
                )}

                {ingestionStatus.data.dlq_reason && (
                  <div className="mt-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
                    <div className="text-xs font-medium text-orange-700 dark:text-orange-400">
                      DLQ Reason: {ingestionStatus.data.dlq_reason}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* OCR Corrections (below tabs) */}
      <CollapsibleSection title="OCR Corrections" defaultOpen={false} badge="Correction Rules">
        <OCRCorrectionsPanel />
      </CollapsibleSection>
    </div>
  )
}
