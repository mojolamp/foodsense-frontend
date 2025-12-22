'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lawCoreAPI, type AuthorityLevel, type PromoteRulePayload } from '@/lib/api/lawcore'
import { Loader2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface PromoteRulesFormProps {
  onSuccess?: () => void
}

export default function PromoteRulesForm({ onSuccess }: PromoteRulesFormProps) {
  const [rawRegId, setRawRegId] = useState('')
  const [authorityLevel, setAuthorityLevel] = useState<AuthorityLevel>('NATIONAL')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [additives, setAdditives] = useState<Array<{ name_zh: string; name_en?: string; e_number?: string }>>([
    { name_zh: '', name_en: '', e_number: '' }
  ])
  const [loading, setLoading] = useState(false)

  // Fetch verified raw laws for selection
  const { data: rawLaws } = useQuery({
    queryKey: ['lawcore', 'pending-laws'],
    queryFn: () => lawCoreAPI.getPendingRawLaws(),
  })

  const verifiedLaws = rawLaws?.pending_laws.filter(law => law.verification_status === 'VERIFIED') || []

  const addAdditiveRow = () => {
    setAdditives([...additives, { name_zh: '', name_en: '', e_number: '' }])
  }

  const removeAdditiveRow = (index: number) => {
    if (additives.length === 1) {
      toast.error('At least one additive is required')
      return
    }
    setAdditives(additives.filter((_, i) => i !== index))
  }

  const updateAdditive = (index: number, field: keyof typeof additives[0], value: string) => {
    const updated = [...additives]
    updated[index] = { ...updated[index], [field]: value }
    setAdditives(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rawRegId) {
      toast.error('Please select a raw regulation ID')
      return
    }

    const validAdditives = additives.filter(a => a.name_zh.trim())
    if (validAdditives.length === 0) {
      toast.error('Please add at least one additive with a Chinese name')
      return
    }

    setLoading(true)

    try {
      const payload: PromoteRulePayload = {
        raw_reg_id: rawRegId,
        additives: validAdditives,
        authority_level: authorityLevel,
        ...(effectiveFrom && { effective_from: effectiveFrom })
      }

      const response = await lawCoreAPI.promoteRule(payload)
      toast.success(`Successfully promoted ${response.rule_ids.length} rules`)

      // Reset form
      setRawRegId('')
      setAdditives([{ name_zh: '', name_en: '', e_number: '' }])
      setEffectiveFrom('')

      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to promote rules'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Raw Regulation Selection */}
      <div>
        <Label htmlFor="raw-reg-id">Raw Regulation ID *</Label>
        <select
          id="raw-reg-id"
          value={rawRegId}
          onChange={(e) => setRawRegId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select a verified raw law...</option>
          {verifiedLaws.map((law) => (
            <option key={law.raw_reg_id} value={law.raw_reg_id}>
              {law.official_id} - {law.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Only VERIFIED raw laws can be promoted
        </p>
      </div>

      {/* Authority Level */}
      <div>
        <Label htmlFor="authority-level">Authority Level *</Label>
        <select
          id="authority-level"
          value={authorityLevel}
          onChange={(e) => setAuthorityLevel(e.target.value as AuthorityLevel)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="NATIONAL">National</option>
          <option value="LOCAL">Local</option>
          <option value="INDUSTRY_STANDARD">Industry Standard</option>
        </select>
      </div>

      {/* Effective From (Optional) */}
      <div>
        <Label htmlFor="effective-from">Effective From (Optional)</Label>
        <Input
          id="effective-from"
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
        />
      </div>

      {/* Additives List */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label>Additives *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAdditiveRow}>
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
        </div>

        {additives.map((additive, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <Label className="text-xs">Chinese Name *</Label>
              <Input
                value={additive.name_zh}
                onChange={(e) => updateAdditive(index, 'name_zh', e.target.value)}
                placeholder="山梨酸鉀"
                required
              />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">English Name</Label>
              <Input
                value={additive.name_en || ''}
                onChange={(e) => updateAdditive(index, 'name_en', e.target.value)}
                placeholder="Potassium Sorbate"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">E Number</Label>
              <Input
                value={additive.e_number || ''}
                onChange={(e) => updateAdditive(index, 'e_number', e.target.value)}
                placeholder="E202"
              />
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAdditiveRow(index)}
                disabled={additives.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Promote Rules
        </Button>
      </div>
    </form>
  )
}
