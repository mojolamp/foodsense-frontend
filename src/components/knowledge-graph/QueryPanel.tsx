'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useKGQuery, useKGAutocomplete, useKGQueryStats } from '@/hooks/useKnowledgeGraph'
import type { SearchType, KGQueryResponse } from '@/types/knowledgeGraph'

export default function QueryPanel() {
  const [searchText, setSearchText] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('hybrid')
  const [queryResult, setQueryResult] = useState<KGQueryResponse | null>(null)

  const kgQuery = useKGQuery()
  const { data: autocomplete } = useKGAutocomplete(searchText)
  const { data: stats, isLoading: statsLoading } = useKGQueryStats()

  const handleSearch = () => {
    if (!searchText.trim()) return
    kgQuery.mutate(
      { query: searchText, search_type: searchType, limit: 20 },
      { onSuccess: (data) => setQueryResult(data) }
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search ingredients..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm"
            />
            {/* Autocomplete Dropdown */}
            {autocomplete && autocomplete.suggestions.length > 0 && searchText.length >= 2 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {autocomplete.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setSearchText(suggestion.name); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{suggestion.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{suggestion.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="hybrid">Hybrid</option>
            <option value="vector">Vector</option>
            <option value="keyword">Keyword</option>
          </select>
          <Button onClick={handleSearch} disabled={kgQuery.isPending || !searchText.trim()}>
            {kgQuery.isPending ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </Card>

      {/* KG Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Ingredients', value: stats?.total_ingredients },
          { label: 'Products', value: stats?.total_products },
          { label: 'Categories', value: stats?.total_categories },
          { label: 'Embedded', value: stats?.embedded_variants },
          { label: 'Coverage', value: stats?.embedding_coverage != null ? `${(stats.embedding_coverage * 100).toFixed(0)}%` : undefined },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold">
              {statsLoading ? <div className="h-6 w-12 bg-muted rounded animate-pulse" /> : (value?.toLocaleString() ?? '—')}
            </div>
          </Card>
        ))}
      </div>

      {/* Results */}
      {queryResult && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Results ({queryResult.total_results})
            </h3>
            <span className="text-xs text-muted-foreground">
              {queryResult.execution_time_ms.toFixed(0)}ms · {queryResult.search_type}
            </span>
          </div>
          {queryResult.query_variations.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {queryResult.query_variations.map((v, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>
              ))}
            </div>
          )}
          {queryResult.ingredients.length > 0 ? (
            <div className="space-y-2">
              {queryResult.ingredients.map((item, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">No results found</div>
          )}
        </Card>
      )}
    </div>
  )
}
