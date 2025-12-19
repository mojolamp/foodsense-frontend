import { useState, useEffect } from 'react'
import { productsAPI } from '@/lib/api/endpoints/products'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { Product } from '@/types/product'
import type { OCRRecord } from '@/types/review'

export interface SearchResult {
  type: 'product' | 'record' | 'navigation' | 'action'
  id: string
  title: string
  subtitle?: string
  metadata?: string
  action: () => void
}

export function useCommandSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchAll = async () => {
      setIsSearching(true)
      const allResults: SearchResult[] = []

      try {
        // 產品搜尋 - 支援 ID, name, barcode
        const productResponse = await productsAPI.getProducts({
          page: 1,
          page_size: 5,
          filters: { search: query }
        })

        const productResults: SearchResult[] = productResponse.products.map((product: Product) => ({
          type: 'product' as const,
          id: product.id,
          title: product.product_name,
          subtitle: product.brand || '無品牌',
          metadata: `ID: ${product.id} | ${product.tier} 級 ${product.barcode ? `| ${product.barcode}` : ''}`,
          action: () => {
            window.location.href = `/products/${product.id}`
          }
        }))

        allResults.push(...productResults)

        // OCR 記錄搜尋 - 支援 ID 搜尋
        if (query.match(/^[a-f0-9-]{36}$/i) || query.startsWith('ocr-')) {
          const queueRecords = await reviewAPI.getQueue({ limit: 5 })
          const matchedRecords = queueRecords.filter((record: OCRRecord) =>
            record.id.toLowerCase().includes(query.toLowerCase()) ||
            record.product_id.toString().includes(query)
          )

          const recordResults: SearchResult[] = matchedRecords.map((record: OCRRecord) => ({
            type: 'record' as const,
            id: record.id,
            title: `OCR 記錄 #${record.id.slice(0, 8)}...`,
            subtitle: `產品 ID: ${record.product_id}`,
            metadata: `${record.logic_validation_status} | ${record.confidence_level} 信心`,
            action: () => {
              window.location.href = `/review/queue?record=${record.id}`
            }
          }))

          allResults.push(...recordResults)
        }

        // 產品 ID 精確搜尋
        if (query.match(/^\d+$/)) {
          const productId = parseInt(query)
          const queueRecords = await reviewAPI.getQueue({ limit: 10 })
          const matchedByProductId = queueRecords.filter((record: OCRRecord) =>
            record.product_id === productId
          )

          const recordResults: SearchResult[] = matchedByProductId.map((record: OCRRecord) => ({
            type: 'record' as const,
            id: record.id,
            title: `產品 #${record.product_id} 的 OCR 記錄`,
            subtitle: record.id.slice(0, 12),
            metadata: `${record.logic_validation_status} | ${record.confidence_level}`,
            action: () => {
              window.location.href = `/review/queue?record=${record.id}`
            }
          }))

          allResults.push(...recordResults)
        }

      } catch (error) {
        console.error('搜尋失敗:', error)
      }

      setResults(allResults)
      setIsSearching(false)
    }

    const debounceTimer = setTimeout(searchAll, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return { results, isSearching }
}

// 搜尋歷史管理
const SEARCH_HISTORY_KEY = 'command_palette_history'
const MAX_HISTORY = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('載入搜尋歷史失敗:', e)
      }
    }
  }, [])

  const addToHistory = (query: string) => {
    if (!query || query.length < 2) return

    setHistory((prev) => {
      const filtered = prev.filter(q => q !== query)
      const newHistory = [query, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  return { history, addToHistory, clearHistory }
}
