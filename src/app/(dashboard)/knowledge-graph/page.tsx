'use client'

import { useState } from 'react'
import { Search, GitBranch, Boxes } from 'lucide-react'
import { Card } from '@/components/ui/card'
import QueryPanel from '@/components/knowledge-graph/QueryPanel'
import VariantMatchPanel from '@/components/knowledge-graph/VariantMatchPanel'
import AggregationJobsPanel from '@/components/knowledge-graph/AggregationJobsPanel'
import KGStatsHeader from '@/components/knowledge-graph/KGStatsHeader'
import GroundTruthPanel from '@/components/knowledge-graph/GroundTruthPanel'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import { useKGQueryStats, useVariantStats, useAggregationStats } from '@/hooks/useKnowledgeGraph'

type TabType = 'query' | 'variants' | 'aggregation'

const TABS: { id: TabType; label: string; icon: typeof Search }[] = [
  { id: 'query', label: 'Query & Search', icon: Search },
  { id: 'variants', label: 'Variant Matching', icon: GitBranch },
  { id: 'aggregation', label: 'Aggregation Jobs', icon: Boxes },
]

export default function KnowledgeGraphPage() {
  const [activeTab, setActiveTab] = useState<TabType>('query')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Graph</h1>
        <p className="mt-2 text-muted-foreground">
          Ingredient knowledge base query, variant matching, and aggregation management.
        </p>
      </div>

      {/* Stats Header (always visible) */}
      <KGStatsHeader />

      {/* Tabs (reduced from 4 to 3, stats promoted to header) */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'query' && <QueryPanel />}
      {activeTab === 'variants' && <VariantMatchPanel />}
      {activeTab === 'aggregation' && <AggregationJobsPanel />}

      {/* Detailed Stats (collapsible) */}
      <CollapsibleSection title="Detailed Stats" defaultOpen={false} badge="Modules">
        <KGStatsOverview />
      </CollapsibleSection>

      {/* Ground Truth (collapsible) */}
      <CollapsibleSection title="Ground Truth" defaultOpen={false} badge="4 tools">
        <GroundTruthPanel />
      </CollapsibleSection>
    </div>
  )
}

function KGStatsOverview() {
  const { data: queryStats, isLoading: queryLoading } = useKGQueryStats()
  const { data: variantStats, isLoading: variantLoading } = useVariantStats()
  const { data: aggStats, isLoading: aggLoading } = useAggregationStats()

  return (
    <div className="space-y-4">
      {/* Query Module Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Query Module</h3>
        {queryLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : queryStats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Ingredients', value: queryStats.total_ingredients.toLocaleString() },
              { label: 'Total Products', value: queryStats.total_products.toLocaleString() },
              { label: 'Categories', value: queryStats.total_categories.toLocaleString() },
              { label: 'Embedded Variants', value: queryStats.embedded_variants.toLocaleString() },
              { label: 'Embedding Coverage', value: `${(queryStats.embedding_coverage * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xl font-bold">{value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {/* Variant Module Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Variant Matching Module</h3>
        {variantLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : variantStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Variants', value: variantStats.total_variants.toLocaleString() },
              { label: 'Layer 1 (Exact)', value: variantStats.layer1_exact.toLocaleString() },
              { label: 'Layer 2 (Fuzzy)', value: variantStats.layer2_fuzzy.toLocaleString() },
              { label: 'Layer 3 (Semantic)', value: variantStats.layer3_semantic.toLocaleString() },
              { label: 'Layer 4 (Manual)', value: variantStats.layer4_manual.toLocaleString() },
              { label: 'Pending Reviews', value: variantStats.pending_reviews.toLocaleString() },
              { label: 'Avg Confidence', value: `${(variantStats.avg_confidence * 100).toFixed(1)}%` },
              { label: 'Last Updated', value: new Date(variantStats.last_updated).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-lg font-bold">{value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {/* Aggregation Module Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aggregation Module</h3>
        {aggLoading ? (
          <div className="h-24 bg-muted rounded animate-pulse" />
        ) : aggStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Observations</div>
              <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(aggStats.observations, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Jobs</div>
              <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(aggStats.jobs, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
