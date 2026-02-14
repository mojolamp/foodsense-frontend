'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, ShieldCheck, ArrowRightLeft, HeartPulse } from 'lucide-react'
import { useGTHealth, useGTSuggest, useGTValidate, useGTConvert } from '@/hooks/useGroundTruth'

export default function GroundTruthPanel() {
  const { data: health } = useGTHealth()
  const suggestMutation = useGTSuggest()
  const validateMutation = useGTValidate()
  const convertMutation = useGTConvert()

  // Suggest form
  const [suggestData, setSuggestData] = useState('')
  // Validate form
  const [validateData, setValidateData] = useState('')
  // Convert form
  const [convertFile, setConvertFile] = useState('')

  return (
    <div className="space-y-4">
      {/* Health Strip */}
      {health && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <HeartPulse className="h-3.5 w-3.5" />
          <span>GT Service: <Badge variant="success" className="text-xs">{health.status}</Badge></span>
          <span>v{health.version}</span>
          <span>Features: {health.features.join(', ')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Suggest */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Suggest</h4>
          </div>
          <textarea
            value={suggestData}
            onChange={(e) => setSuggestData(e.target.value)}
            placeholder='{"product_name": "...", "ingredients": [...]}'
            className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background min-h-[80px] font-mono"
          />
          <Button
            size="sm"
            className="w-full mt-2"
            disabled={suggestMutation.isPending || !suggestData.trim()}
            onClick={() => {
              try {
                const parsed = JSON.parse(suggestData)
                suggestMutation.mutate({ ocr_data: parsed })
              } catch {
                suggestMutation.mutate({ ocr_file: suggestData.trim() })
              }
            }}
          >
            {suggestMutation.isPending ? 'Suggesting...' : 'Get Suggestions'}
          </Button>
          {suggestMutation.data && (
            <div className="mt-2 text-xs">
              <Badge variant="success">{suggestMutation.data.total_suggestions} suggestions</Badge>
              <pre className="mt-1 bg-muted/50 p-2 rounded text-xs overflow-x-auto max-h-32">
                {JSON.stringify(suggestMutation.data.suggestions, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Validate */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Validate</h4>
          </div>
          <textarea
            value={validateData}
            onChange={(e) => setValidateData(e.target.value)}
            placeholder='{"items": [...]}'
            className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background min-h-[80px] font-mono"
          />
          <Button
            size="sm"
            className="w-full mt-2"
            disabled={validateMutation.isPending || !validateData.trim()}
            onClick={() => {
              try {
                const parsed = JSON.parse(validateData)
                validateMutation.mutate({ gt_data: parsed })
              } catch {
                validateMutation.mutate({ gt_file: validateData.trim() })
              }
            }}
          >
            {validateMutation.isPending ? 'Validating...' : 'Validate'}
          </Button>
          {validateMutation.data && (
            <div className="mt-2 text-xs">
              <Badge variant={validateMutation.data.is_valid ? 'success' : 'destructive'}>
                {validateMutation.data.is_valid ? 'Valid' : 'Invalid'}
              </Badge>
              <div className="mt-1 text-muted-foreground">
                {validateMutation.data.valid_items}/{validateMutation.data.total_items} items valid
              </div>
              {validateMutation.data.errors.length > 0 && (
                <ul className="mt-1 text-red-500 list-disc list-inside">
                  {validateMutation.data.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </Card>

        {/* Convert */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Convert to Engine Input</h4>
          </div>
          <input
            type="text"
            value={convertFile}
            onChange={(e) => setConvertFile(e.target.value)}
            placeholder="GT file path..."
            className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
          />
          <Button
            size="sm"
            className="w-full mt-2"
            disabled={convertMutation.isPending || !convertFile.trim()}
            onClick={() => convertMutation.mutate({ gt_file: convertFile.trim() })}
          >
            {convertMutation.isPending ? 'Converting...' : 'Convert'}
          </Button>
          {convertMutation.data && (
            <div className="mt-2 text-xs">
              <Badge variant="success">{convertMutation.data.total_converted} converted</Badge>
              {convertMutation.data.output_file && (
                <div className="mt-1 text-muted-foreground font-mono text-xs truncate">
                  Output: {convertMutation.data.output_file}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
