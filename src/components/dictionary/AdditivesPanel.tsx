'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useAdditivesList } from '@/hooks/useDictionary'

export default function AdditivesPanel() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdditivesList(search)

  const additives = data?.additives ?? []

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search additives (e.g. E330, 檸檬酸)..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-input rounded-md bg-background"
          />
        </div>
        {search && (
          <Button size="sm" variant="ghost" onClick={() => setSearch('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : additives.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">
          {search ? 'No additives found.' : 'No additives data available.'}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Risk</th>
                </tr>
              </thead>
              <tbody>
                {additives.map((item) => (
                  <tr key={item.code || item.name} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{item.code ?? '-'}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-xs text-muted-foreground">{item.category ?? '-'}</td>
                    <td className="p-3">
                      {item.risk_level && (
                        <Badge
                          variant={
                            item.risk_level === 'high' ? 'destructive' :
                            item.risk_level === 'medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {item.risk_level}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
