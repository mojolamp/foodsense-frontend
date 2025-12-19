'use client'

import { TokenRanking } from '@/types/dictionary'

interface Props {
  tokens: TokenRanking[]
  isLoading: boolean
  onTokenClick: (token: string) => void
  selectedToken: string | null
}

export default function TokenRankingTable({
  tokens,
  isLoading,
  onTokenClick,
  selectedToken,
}: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">沒有找到 Tokens</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Token 排行榜 ({tokens.length} 個)
        </h2>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {tokens.map((token) => (
          <button
            key={token.token}
            onClick={() => onTokenClick(token.token)}
            className={`
              w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors
              ${selectedToken === token.token ? 'bg-blue-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{token.token}</p>
                <p className="text-sm text-gray-500 mt-1">
                  影響 {token.affected_products} 個產品
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {token.occurrence_count}
                </p>
                <p className="text-xs text-gray-500">次</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}


