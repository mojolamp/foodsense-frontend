'use client'

import { useHotkeys } from 'react-hotkeys-hook'

function isTextInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (el.getAttribute?.('contenteditable') === 'true') return true
  return false
}

export function useReviewQueueShortcuts(params: {
  enabled: boolean
  count: number
  activeIndex: number
  setActiveIndex: (nextIndex: number) => void
  openReviewModal: () => void
  toggleSelectActive: () => void
  toggleSelectAll: () => void
}) {
  const {
    enabled,
    count,
    activeIndex,
    setActiveIndex,
    openReviewModal,
    toggleSelectActive,
    toggleSelectAll,
  } = params

  const shouldIgnore = () => !enabled || isTextInputFocused()

  useHotkeys(
    'n',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      if (count <= 0) return
      setActiveIndex(Math.min(count - 1, Math.max(0, activeIndex + 1)))
    },
    { enableOnFormTags: false }
  )

  useHotkeys(
    'p',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      if (count <= 0) return
      setActiveIndex(Math.max(0, activeIndex - 1))
    },
    { enableOnFormTags: false }
  )

  useHotkeys(
    'r',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      openReviewModal()
    },
    { enableOnFormTags: false }
  )

  useHotkeys(
    'x',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      toggleSelectActive()
    },
    { enableOnFormTags: false }
  )

  useHotkeys(
    'a',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      toggleSelectAll()
    },
    { enableOnFormTags: false }
  )
}


