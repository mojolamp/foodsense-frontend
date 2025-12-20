'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'

export function useGlobalShortcuts() {
  const router = useRouter()
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Command Palette: Cmd+K / Ctrl+K
  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    setIsCommandPaletteOpen(true)
  }, { enableOnFormTags: true })

  // Navigation shortcuts
  useHotkeys('g,d', (e) => {
    e.preventDefault()
    router.push('/dashboard')
  })

  useHotkeys('g,q', (e) => {
    e.preventDefault()
    router.push('/review/queue')
  })

  useHotkeys('g,a', (e) => {
    e.preventDefault()
    router.push('/review/analytics')
  })

  useHotkeys('g,h', (e) => {
    e.preventDefault()
    router.push('/review/history')
  })

  useHotkeys('g,g', (e) => {
    e.preventDefault()
    router.push('/gold-samples')
  })

  useHotkeys('g,p', (e) => {
    e.preventDefault()
    router.push('/products')
  })

  useHotkeys('g,x', (e) => {
    e.preventDefault()
    router.push('/data-quality')
  })

  // 重新整理: Ctrl+R (保留瀏覽器預設行為，不攔截)

  // Help: Show shortcuts
  useHotkeys('shift+/', (e) => {
    e.preventDefault()
    setIsCommandPaletteOpen(true)
  })

  return {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen
  }
}
