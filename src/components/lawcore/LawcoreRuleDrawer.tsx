'use client'

import { LawCoreRule } from '@/lib/api/lawcore'
import Drawer from '@/components/shared/Drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface LawcoreRuleDrawerProps {
  open: boolean
  onClose: () => void
  rule: LawCoreRule | null
}

export default function LawcoreRuleDrawer({ open, onClose, rule }: LawcoreRuleDrawerProps) {
  if (!rule) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <Drawer open={open} onClose={onClose} title="Rule Details">
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Rule ID</dt>
              <dd className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{rule.rule_id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(rule.rule_id, 'Rule ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Additive Name (Chinese)</dt>
              <dd className="text-sm font-medium mt-1">{rule.additive_name_zh}</dd>
            </div>

            {rule.additive_name_en && (
              <div>
                <dt className="text-xs text-muted-foreground">Additive Name (English)</dt>
                <dd className="text-sm font-medium mt-1">{rule.additive_name_en}</dd>
              </div>
            )}

            {rule.e_number && (
              <div>
                <dt className="text-xs text-muted-foreground">E Number</dt>
                <dd className="text-sm font-mono mt-1">{rule.e_number}</dd>
              </div>
            )}

            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge variant={rule.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {rule.status}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Authority Level</dt>
              <dd className="mt-1">
                <Badge variant="outline">{rule.authority_level}</Badge>
              </dd>
            </div>
          </dl>
        </div>

        {/* Citation */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3">Citation Source</h3>
          <p className="text-sm bg-muted p-3 rounded-lg">{rule.citation_source}</p>
        </div>

        {/* Effective Period */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3">Effective Period</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-muted-foreground">Effective From</dt>
              <dd className="text-sm mt-1">
                {rule.effective_from
                  ? new Date(rule.effective_from).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Effective Until</dt>
              <dd className="text-sm mt-1">
                {rule.effective_until
                  ? new Date(rule.effective_until).toLocaleDateString()
                  : 'Indefinite'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Raw Regulation Reference */}
        {rule.raw_reg_id && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3">Raw Regulation Reference</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
                {rule.raw_reg_id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(rule.raw_reg_id!, 'Raw Reg ID')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3">Metadata</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-muted-foreground">Created At</dt>
              <dd className="text-sm mt-1">{new Date(rule.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Updated At</dt>
              <dd className="text-sm mt-1">{new Date(rule.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Drawer>
  )
}
