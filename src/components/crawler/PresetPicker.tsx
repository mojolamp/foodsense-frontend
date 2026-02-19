'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, Trash2, ChevronDown } from 'lucide-react'
import { useCrawlerPresets } from '@/hooks/useCrawlerPresets'
import type { CrawlerPreset } from '@/types/crawlerPipeline'

interface Props {
  currentKeywords: string[]
  currentSites: string[]
  currentLimit: number
  onLoad: (preset: CrawlerPreset) => void
}

export default function PresetPicker({ currentKeywords, currentSites, currentLimit, onLoad }: Props) {
  const { presets, savePreset, deletePreset } = useCrawlerPresets()
  const [open, setOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const handleSave = () => {
    if (!saveName.trim() || currentKeywords.length === 0) return
    savePreset({
      name: saveName.trim(),
      keywords: currentKeywords,
      sites: currentSites,
      limitPerKeyword: currentLimit,
    })
    setSaveName('')
    setShowSave(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-sm border border-input rounded-md bg-background hover:bg-accent/50"
          >
            <span className="text-muted-foreground">
              {presets.length > 0 ? `${presets.length} presets` : 'No presets'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && presets.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 cursor-pointer text-sm"
                >
                  <button
                    className="flex-1 text-left truncate"
                    onClick={() => {
                      onLoad(p)
                      setOpen(false)
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.keywords.length} kw · {p.sites.length} sites
                    </span>
                  </button>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    limit {p.limitPerKeyword}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePreset(p.id)
                    }}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSave((v) => !v)}
          disabled={currentKeywords.length === 0}
        >
          <Save className="h-3.5 w-3.5 mr-1" />
          Save
        </Button>
      </div>

      {showSave && (
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" onClick={handleSave} disabled={!saveName.trim()}>
            Save
          </Button>
        </div>
      )}
    </div>
  )
}
