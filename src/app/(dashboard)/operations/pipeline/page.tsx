'use client'

import { Workflow, ListTodo, Cpu, ScanLine } from 'lucide-react'
import PipelineHealthRow from '@/components/pipeline/PipelineHealthRow'
import TaskQueueSection from '@/components/pipeline/TaskQueueSection'
import NormalizerSection from '@/components/pipeline/NormalizerSection'
import ScanV1Section from '@/components/pipeline/ScanV1Section'
import CollapsibleSection from '@/components/shared/CollapsibleSection'

export default function PipelineOperationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Operations</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Task Queue management, Normalizer tools, and Scan V1 pipeline — unified operations center.
        </p>
      </div>

      {/* Health Row */}
      <PipelineHealthRow />

      {/* Task Queue — always expanded (primary) */}
      <CollapsibleSection title="Task Queue" icon={ListTodo} defaultOpen badge="13 endpoints">
        <TaskQueueSection />
      </CollapsibleSection>

      {/* Normalizer — collapsible */}
      <CollapsibleSection title="Normalizer" icon={Cpu} defaultOpen={false} badge="4 endpoints">
        <NormalizerSection />
      </CollapsibleSection>

      {/* Scan V1 — collapsible */}
      <CollapsibleSection title="Scan V1" icon={ScanLine} defaultOpen={false} badge="2 endpoints">
        <ScanV1Section />
      </CollapsibleSection>
    </div>
  )
}
