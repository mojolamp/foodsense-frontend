'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Check, X, Loader2, Clock, SkipForward } from 'lucide-react'
import type { PipelinePhaseResult, PhaseStatus } from '@/types/crawlerPipeline'

const PHASE_LABELS: Record<string, string> = {
  preflight: 'Pre-flight',
  probe: 'Health Probe',
  pilot: 'Pilot Crawl',
  batch: 'Batch Crawl',
  verify: 'Verification',
}

const PHASE_NUMBERS: Record<string, number> = {
  preflight: 0,
  probe: 1,
  pilot: 2,
  batch: 3,
  verify: 4,
}

function StatusIcon({ status }: { status: PhaseStatus }) {
  switch (status) {
    case 'passed':
      return <Check className="h-4 w-4 text-green-600" />
    case 'failed':
      return <X className="h-4 w-4 text-red-600" />
    case 'running':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    case 'skipped':
      return <SkipForward className="h-4 w-4 text-muted-foreground" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function statusBadgeVariant(status: PhaseStatus) {
  switch (status) {
    case 'passed':
      return 'success' as const
    case 'failed':
      return 'destructive' as const
    case 'running':
      return 'default' as const
    default:
      return 'secondary' as const
  }
}

function formatDuration(start?: string, end?: string): string {
  if (!start) return ''
  const endMs = end ? new Date(end).getTime() : Date.now()
  const ms = endMs - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  const s = (ms / 1000).toFixed(1)
  return `${s}s`
}

interface Props {
  result: PipelinePhaseResult
}

export default function PipelinePhaseCard({ result }: Props) {
  const [expanded, setExpanded] = useState(result.status === 'running' || result.status === 'failed')
  const hasChecks = result.checks.length > 0
  const isActive = result.status === 'running' || result.status === 'failed' || result.status === 'passed'

  return (
    <Card
      className={`p-3 transition-colors ${
        result.status === 'running' ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10' :
        result.status === 'failed' ? 'border-l-4 border-l-red-500' :
        result.status === 'passed' ? 'border-l-4 border-l-green-500' :
        'opacity-60'
      }`}
    >
      <button
        onClick={() => hasChecks && setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full text-left"
        disabled={!hasChecks}
      >
        <StatusIcon status={result.status} />
        <span className="text-xs font-mono text-muted-foreground w-4">
          {PHASE_NUMBERS[result.phase]}
        </span>
        <span className={`text-sm font-medium flex-1 ${isActive ? '' : 'text-muted-foreground'}`}>
          {PHASE_LABELS[result.phase] ?? result.phase}
        </span>
        <Badge variant={statusBadgeVariant(result.status)} className="text-xs">
          {result.status}
        </Badge>
        {result.startedAt && (
          <span className="text-xs text-muted-foreground font-mono">
            {formatDuration(result.startedAt, result.completedAt)}
          </span>
        )}
        {hasChecks && (
          <span className="text-muted-foreground">
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        )}
      </button>

      {expanded && result.checks.length > 0 && (
        <div className="mt-2 ml-7 space-y-1">
          {result.checks.map((check, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {check.passed ? (
                <Check className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
              )}
              <span className={check.passed ? 'text-muted-foreground' : 'text-red-600'}>
                {check.name}
              </span>
              {check.detail && (
                <span className="text-muted-foreground/60 truncate ml-auto">{check.detail}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
