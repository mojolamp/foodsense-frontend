'use client'

import { useState } from 'react'
import { useTokenRankings } from '@/hooks/useDictionary'
import TokenRankingTable from '@/components/dictionary/TokenRankingTable'
import TokenDetailPanel from '@/components/dictionary/TokenDetailPanel'

export default function DictionaryPage() {
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'occurrence' | 'products'>('occurrence')

  const { data, isLoading } = useTokenRankings(sortBy, search)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">成分字典</h1>
        <p className="mt-2 text-gray-600">
          批次管理與校正成分 Tokens
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜尋 Token
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="輸入 token 關鍵字..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'occurrence' | 'products')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="occurrence">出現次數</option>
              <option value="products">影響產品數</option>
            </select>
          </div>
        </div>
      </div>

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
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              選擇左側的 Token 查看詳情
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


