'use client'

import { TokenRanking } from '@/types/dictionary'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { BookOpen, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  tokens: TokenRanking[]
  isLoading: boolean
  onTokenClick: (token: string) => void
  selectedToken: string | null
  hasSearch?: boolean
  onClearSearch?: () => void
}

export default function TokenRankingTable({
  tokens,
  isLoading,
  onTokenClick,
  selectedToken,
  hasSearch = false,
  onClearSearch,
}: Props) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  if (tokens.length === 0) {
    // If user is searching and no results found
    if (hasSearch) {
      return (
        <div className="bg-white rounded-lg shadow">
          <EmptyStateV2
            icon={Search}
            iconBackgroundColor="gray"
            title="沒有找到符合的 Tokens"
            description="嘗試調整搜尋關鍵字以查看更多結果"
            primaryAction={
              onClearSearch
                ? {
                    label: '清除搜尋',
                    onClick: onClearSearch,
                    icon: X,
                  }
                : undefined
            }
            variant="compact"
          />
        </div>
      )
    }

    // No tokens at all - need to import products first
    return (
      <div className="bg-white rounded-lg shadow">
        <EmptyStateV2
          icon={BookOpen}
          iconBackgroundColor="purple"
          title="字典尚未建立"
          description="匯入產品資料後將自動建立成分 Token 字典"
          helpText="字典會從成分列表自動建立。匯入並分析產品後，Tokens 將出現在此處供您校正和管理。"
          primaryAction={{
            label: '前往匯入產品',
            onClick: () => router.push('/products'),
            icon: BookOpen,
          }}
        />
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


