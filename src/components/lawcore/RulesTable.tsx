'use client'

import { useState } from 'react'
import { LawCoreRule } from '@/lib/api/lawcore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Copy, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'

interface RulesTableProps {
  rules: LawCoreRule[]
  onRuleClick?: (rule: LawCoreRule) => void
}

export default function RulesTable({ rules, onRuleClick }: RulesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRules = rules.filter((rule) => {
    const term = searchTerm.toLowerCase()
    return (
      rule.additive_name_zh.toLowerCase().includes(term) ||
      rule.additive_name_en?.toLowerCase().includes(term) ||
      rule.e_number?.toLowerCase().includes(term) ||
      rule.rule_id.toLowerCase().includes(term)
    )
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No rules found"
        description="The LawCore database has no active rules yet"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, E number, or rule ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filteredRules.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Additive Name (ZH)</th>
                  <th className="px-4 py-3 text-left font-medium">Additive Name (EN)</th>
                  <th className="px-4 py-3 text-left font-medium">E Number</th>
                  <th className="px-4 py-3 text-left font-medium">Authority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRules.map((rule) => (
                  <tr key={rule.rule_id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{rule.additive_name_zh}</td>
                    <td className="px-4 py-3">{rule.additive_name_en || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{rule.e_number || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {rule.authority_level}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={rule.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rule.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(rule.rule_id, 'Rule ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {onRuleClick && (
                          <Button variant="ghost" size="sm" onClick={() => onRuleClick(rule)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching rules"
          description={`No rules match "${searchTerm}"`}
        />
      )}

      <div className="text-sm text-muted-foreground">
        Showing {filteredRules.length} of {rules.length} rules
      </div>
    </div>
  )
}
