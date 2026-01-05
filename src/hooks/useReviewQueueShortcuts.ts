'use client'

import { useHotkeys } from 'react-hotkeys-hook'
import { isFeatureEnabled } from '@/lib/featureFlags'

function isTextInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (el.getAttribute?.('contenteditable') === 'true') return true
  return false
}

export interface ReviewQueueShortcutsParams {
  enabled: boolean
  count: number
  activeIndex: number
  setActiveIndex: (nextIndex: number) => void
  openReviewModal: () => void
  toggleSelectActive: () => void
  toggleSelectAll: () => void
  // Enhanced hotkeys actions (optional, for Phase 1B)
  onApprove?: () => void
  onReject?: () => void
  onInspect?: () => void
  onFlag?: () => void
  onShowHelp?: () => void
}

export function useReviewQueueShortcuts(params: ReviewQueueShortcutsParams) {
  const {
    enabled,
    count,
    activeIndex,
    setActiveIndex,
    openReviewModal,
    toggleSelectActive,
    toggleSelectAll,
    onApprove,
    onReject,
    onInspect,
    onFlag,
    onShowHelp,
  } = params

  const enhancedHotkeysEnabled = isFeatureEnabled('review_queue_enhanced_hotkeys')
  const shouldIgnore = () => !enabled || isTextInputFocused()

  // === LEGACY HOTKEYS (backward compatible) ===

  // n - Next record (legacy)
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

  // p - Previous record (legacy)
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

  // r - Open review modal (legacy)
  useHotkeys(
    'r',
    (e) => {
      if (shouldIgnore()) return
      // Enhanced: Shift+R for reject (if feature enabled)
      if (enhancedHotkeysEnabled && e.shiftKey && onReject) {
        e.preventDefault()
        onReject()
        return
      }
      // Legacy: r for open modal
      e.preventDefault()
      openReviewModal()
    },
    { enableOnFormTags: false }
  )

  // x - Toggle select active (legacy)
  useHotkeys(
    'x',
    (e) => {
      if (shouldIgnore()) return
      e.preventDefault()
      toggleSelectActive()
    },
    { enableOnFormTags: false }
  )

  // a - Toggle select all (legacy) OR Shift+A for approve (enhanced)
  useHotkeys(
    'a',
    (e) => {
      if (shouldIgnore()) return
      // Enhanced: Shift+A for approve (if feature enabled)
      if (enhancedHotkeysEnabled && e.shiftKey && onApprove) {
        e.preventDefault()
        onApprove()
        return
      }
      // Legacy: a for toggle select all
      e.preventDefault()
      toggleSelectAll()
    },
    { enableOnFormTags: false }
  )

  // === ENHANCED HOTKEYS (vim-style J/K navigation) ===

  if (enhancedHotkeysEnabled) {
    // j - Next record (vim-style)
    useHotkeys(
      'j',
      (e) => {
        if (shouldIgnore()) return
        e.preventDefault()
        if (count <= 0) return
        setActiveIndex(Math.min(count - 1, Math.max(0, activeIndex + 1)))
      },
      { enableOnFormTags: false }
    )

    // k - Previous record (vim-style)
    useHotkeys(
      'k',
      (e) => {
        if (shouldIgnore()) return
        e.preventDefault()
        if (count <= 0) return
        setActiveIndex(Math.max(0, activeIndex - 1))
      },
      { enableOnFormTags: false }
    )

    // i - Inspect product details
    if (onInspect) {
      useHotkeys(
        'i',
        (e) => {
          if (shouldIgnore()) return
          e.preventDefault()
          onInspect()
        },
        { enableOnFormTags: false }
      )
    }

    // f - Flag for manual review
    if (onFlag) {
      useHotkeys(
        'f',
        (e) => {
          if (shouldIgnore()) return
          e.preventDefault()
          onFlag()
        },
        { enableOnFormTags: false }
      )
    }

    // ? - Show keyboard shortcuts help
    if (onShowHelp) {
      useHotkeys(
        'shift+/',
        (e) => {
          if (shouldIgnore()) return
          e.preventDefault()
          onShowHelp()
        },
        { enableOnFormTags: false }
      )
    }
  }
}

