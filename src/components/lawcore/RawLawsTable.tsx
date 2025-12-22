'use client'

import { RawLaw } from '@/lib/api/lawcore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'

interface RawLawsTableProps {
  laws: RawLaw[]
  onVerify: (rawRegId: string, verified: boolean) => void
  loading?: boolean
}

export default function RawLawsTable({ laws, onVerify, loading }: RawLawsTableProps) {
  if (laws.length === 0) {
    return (
      <EmptyState
        title="No pending raw laws"
        description="All raw laws have been verified"
      />
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Official ID</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {laws.map((law) => (
              <tr key={law.raw_reg_id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium max-w-xs truncate">
                  {law.title}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{law.official_id}</td>
                <td className="px-4 py-3">{law.category}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {law.verification_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(law.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerify(law.raw_reg_id, true)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerify(law.raw_reg_id, false)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
