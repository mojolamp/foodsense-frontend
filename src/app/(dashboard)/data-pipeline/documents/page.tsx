'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import DropZone from '@/components/shared/DropZone'
import { useDocuments, useDocumentUpload } from '@/hooks/useDocuments'
import type { DocumentDetail } from '@/types/document'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const STATUS_VARIANTS: Record<string, 'success' | 'default' | 'destructive'> = {
  ready: 'success',
  processing: 'default',
  failed: 'destructive',
}

export default function DocumentsPage() {
  const { data, isLoading } = useDocuments()
  const upload = useDocumentUpload()

  const documents = data?.documents || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage knowledge documents (PDF, CSV, JSON, XLSX).
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
        <DropZone
          accept=".pdf,.csv,.json,.xlsx,.xls"
          maxSizeMB={20}
          onFile={(file) => upload.mutate(file)}
          isUploading={upload.isPending}
          hint="Supports PDF, CSV, JSON, XLSX up to 20MB"
        />
      </Card>

      {/* Documents Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Size</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Pages</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Nutrition</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground mb-1">No Documents</div>
                    <div className="text-sm text-muted-foreground/70">
                      Upload PDF, CSV, or XLSX files to expand the knowledge base.
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc: DocumentDetail) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{doc.filename}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {doc.file_type}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatFileSize(doc.file_size)}</td>
                    <td className="p-3 text-muted-foreground">{doc.pages ?? '—'}</td>
                    <td className="p-3">
                      {doc.has_nutrition_data != null ? (
                        <span className={doc.has_nutrition_data ? 'text-green-600' : 'text-muted-foreground'}>
                          {doc.has_nutrition_data ? '✓' : '—'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_VARIANTS[doc.status] || 'secondary'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
