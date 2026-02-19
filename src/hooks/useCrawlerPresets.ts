'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CrawlerPreset } from '@/types/crawlerPipeline'

const STORAGE_KEY = 'foodsense:crawler-presets'

function loadPresets(): CrawlerPreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistPresets(presets: CrawlerPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function useCrawlerPresets() {
  const [presets, setPresets] = useState<CrawlerPreset[]>([])

  useEffect(() => {
    setPresets(loadPresets())
  }, [])

  const savePreset = useCallback(
    (data: { name: string; keywords: string[]; sites: string[]; limitPerKeyword: number }) => {
      const now = new Date().toISOString()
      const preset: CrawlerPreset = {
        id: crypto.randomUUID(),
        name: data.name,
        keywords: data.keywords,
        sites: data.sites,
        limitPerKeyword: data.limitPerKeyword,
        createdAt: now,
        updatedAt: now,
      }
      setPresets((prev) => {
        const next = [preset, ...prev]
        persistPresets(next)
        return next
      })
      return preset
    },
    []
  )

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id)
      persistPresets(next)
      return next
    })
  }, [])

  const updatePreset = useCallback(
    (id: string, updates: Partial<Pick<CrawlerPreset, 'name' | 'keywords' | 'sites' | 'limitPerKeyword'>>) => {
      setPresets((prev) => {
        const next = prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
        persistPresets(next)
        return next
      })
    },
    []
  )

  return { presets, savePreset, deletePreset, updatePreset }
}
