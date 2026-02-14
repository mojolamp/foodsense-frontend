'use client'

import { useState } from 'react'
import { BookOpen, FlaskConical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useTokenRankings } from '@/hooks/useDictionary'
import TokenRankingTable from '@/components/dictionary/TokenRankingTable'
import TokenDetailPanel from '@/components/dictionary/TokenDetailPanel'
import DictionaryOverviewStrip from '@/components/dictionary/DictionaryOverviewStrip'
import AdditivesPanel from '@/components/dictionary/AdditivesPanel'
import CollapsibleSection from '@/components/shared/CollapsibleSection'

type TabType = 'tokens' | 'additives'

export default function DictionaryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tokens')
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'occurrence' | 'products'>('occurrence')

  const { data, isLoading } = useTokenRankings(sortBy, search)

  const tabs: { key: TabType; label: string; icon: typeof BookOpen }[] = [
    { key: 'tokens', label: 'Token Rankings', icon: BookOpen },
    { key: 'additives', label: 'Additives Registry', icon: FlaskConical },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">成分字典</h1>
        <p className="mt-2 text-muted-foreground">
          批次管理與校正成分 Tokens
        </p>
      </div>

      {/* Overview Strip */}
      <DictionaryOverviewStrip />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Token Rankings Tab */}
      {activeTab === 'tokens' && (
        <>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  搜尋 Token
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="輸入 token 關鍵字..."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  排序方式
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'occurrence' | 'products')}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
                >
                  <option value="occurrence">出現次數</option>
                  <option value="products">影響產品數</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TokenRankingTable
                tokens={data?.tokens || []}
                isLoading={isLoading}
                onTokenClick={(token) => setSelectedToken(token)}
                selectedToken={selectedToken}
                hasSearch={search.trim().length > 0}
                onClearSearch={() => setSearch('')}
              />
            </div>
            <div>
              {selectedToken ? (
                <TokenDetailPanel token={selectedToken} />
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  選擇左側的 Token 查看詳情
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Additives Tab */}
      {activeTab === 'additives' && <AdditivesPanel />}
    </div>
  )
}
