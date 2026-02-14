'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2 } from 'lucide-react'
import { useScanV1Submit, useScanV1JobResult } from '@/hooks/useScanV1'
import DropZone from '@/components/shared/DropZone'

export default function ScanV1Section() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeJobId, setActiveJobId] = useState('')

  const submitScan = useScanV1Submit()
  const { data: jobResult, isLoading: jobLoading } = useScanV1JobResult(activeJobId)

  const handleSubmit = () => {
    if (!selectedFile) return
    submitScan.mutate(selectedFile, {
      onSuccess: (data) => {
        if (data.status === 'queued') {
          setActiveJobId(data.job_id)
        }
      },
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Scan Image (V1 Pipeline)</h4>
        </div>

        <DropZone
          accept=".jpg,.jpeg,.png,.webp"
          maxSizeMB={10}
          onFile={setSelectedFile}
          hint="JPG, PNG, WebP up to 10MB"
        />

        <div className="mt-3">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedFile || submitScan.isPending}
          >
            {submitScan.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Scanning...</>
            ) : (
              <><Upload className="h-3.5 w-3.5 mr-1" /> Submit Scan</>
            )}
          </Button>
        </div>

        {/* Inline result */}
        {submitScan.data?.status === 'done' && submitScan.data.result && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium">Result</span>
              <Badge variant="success">Done</Badge>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-48">
              {JSON.stringify(submitScan.data.result, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Job polling result */}
      {activeJobId && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium">Polling Job</span>
            <span className="text-xs font-mono text-muted-foreground">{activeJobId}</span>
            {jobLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          {jobResult && (
            <>
              <Badge variant={
                jobResult.status === 'done' ? 'success' :
                jobResult.status === 'failed' ? 'destructive' : 'secondary'
              }>
                {jobResult.status}
              </Badge>
              {(jobResult.status === 'done' || jobResult.status === 'failed') && (
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-48">
                  {JSON.stringify(jobResult, null, 2)}
                </pre>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
