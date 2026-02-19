'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rocket, Square, RotateCcw, FlaskConical } from 'lucide-react'
import { usePipelineRun } from '@/hooks/useCrawlerPipeline'
import { useCrawlerList } from '@/hooks/useCrawlerRaw'
import PipelinePhaseCard from './PipelinePhaseCard'
import PresetPicker from './PresetPicker'
import type { CrawlerPreset } from '@/types/crawlerPipeline'

export default function PipelineLaunchPanel() {
  const { data: crawlers } = useCrawlerList()
  const sites = crawlers?.crawlers ?? []
  const pipeline = usePipelineRun()

  // Config form
  const [keywords, setKeywords] = useState('')
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [limit, setLimit] = useState(5)

  const parsedKeywords = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  const isRunning = pipeline.state.status === 'running'
  const isDone =
    pipeline.state.status === 'completed' ||
    pipeline.state.status === 'failed' ||
    pipeline.state.status === 'aborted'

  const canLaunch = parsedKeywords.length > 0 && !isRunning

  const handleLaunch = useCallback(
    (dryRun: boolean) => {
      if (!canLaunch) return
      pipeline.start({
        keywords: parsedKeywords,
        sites: selectedSites,
        limitPerKeyword: limit,
        dryRun,
      })
    },
    [canLaunch, parsedKeywords, selectedSites, limit, pipeline]
  )

  const handlePresetLoad = useCallback((preset: CrawlerPreset) => {
    setKeywords(preset.keywords.join(', '))
    setSelectedSites(preset.sites)
    setLimit(preset.limitPerKeyword)
  }, [])

  const toggleSite = useCallback((site: string) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
    )
  }, [])

  const overallStatusLabel = () => {
    switch (pipeline.state.status) {
      case 'running':
        return 'Running'
      case 'completed':
        return 'Complete'
      case 'failed':
        return 'Failed'
      case 'aborted':
        return 'Aborted'
      default:
        return 'Idle'
    }
  }

  const overallBadgeVariant = () => {
    switch (pipeline.state.status) {
      case 'completed':
        return 'success' as const
      case 'failed':
      case 'aborted':
        return 'destructive' as const
      case 'running':
        return 'default' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <div className="space-y-4">
      {/* Configuration */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Pipeline Configuration</h4>
          {pipeline.state.status !== 'idle' && (
            <Badge variant={overallBadgeVariant()} className="ml-auto text-xs">
              {overallStatusLabel()}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Keywords */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Keywords (comma-separated)
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="豆腐, 牛奶, 醬油..."
              rows={2}
              disabled={isRunning}
              className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background resize-none disabled:opacity-50"
            />
            {parsedKeywords.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {parsedKeywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sites */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Sites (click to toggle, empty = all)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sites.map((site) => (
                <button
                  key={site}
                  onClick={() => toggleSite(site)}
                  disabled={isRunning}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-colors disabled:opacity-50 ${
                    selectedSites.includes(site)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent/50'
                  }`}
                >
                  {site}
                </button>
              ))}
              {sites.length === 0 && (
                <span className="text-xs text-muted-foreground">Loading sites...</span>
              )}
            </div>
          </div>

          {/* Limit + Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Limit per keyword
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Math.max(1, Number(e.target.value)))}
                min={1}
                max={200}
                disabled={isRunning}
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Presets
              </label>
              <PresetPicker
                currentKeywords={parsedKeywords}
                currentSites={selectedSites}
                currentLimit={limit}
                onLoad={handlePresetLoad}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!isRunning && !isDone && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleLaunch(false)}
                  disabled={!canLaunch}
                >
                  <Rocket className="h-3.5 w-3.5 mr-1.5" />
                  Launch Pipeline
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLaunch(true)}
                  disabled={!canLaunch}
                >
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                  Dry Run
                </Button>
              </>
            )}
            {isRunning && (
              <Button size="sm" variant="destructive" onClick={pipeline.abort}>
                <Square className="h-3.5 w-3.5 mr-1.5" />
                Abort
              </Button>
            )}
            {isDone && (
              <Button size="sm" variant="outline" onClick={pipeline.reset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Phase Progress */}
      {pipeline.state.status !== 'idle' && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Phase Progress
          </h4>
          {pipeline.state.phases.map((phase) => (
            <PipelinePhaseCard key={phase.phase} result={phase} />
          ))}

          {/* Timing summary */}
          {isDone && pipeline.state.startedAt && (
            <div className="text-xs text-muted-foreground text-right">
              Total: {formatTotalDuration(pipeline.state.startedAt, pipeline.state.completedAt)}
              {' · '}
              {pipeline.state.phases.filter((p) => p.status === 'passed').length}/
              {pipeline.state.phases.length} passed
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatTotalDuration(start: string, end?: string): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rs = s % 60
  return `${m}m ${rs}s`
}
