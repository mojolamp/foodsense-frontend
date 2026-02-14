import { useCallback } from 'react'
import zhTW from './zh-TW.json'

/**
 * Simple i18n hook for centralized string management.
 *
 * Phase 1: Single-language (zh-TW) string centralization.
 * Supports interpolation via {key} placeholders.
 *
 * Usage:
 *   const { t } = useTranslation()
 *   t('common.loading')             // "載入中..."
 *   t('reviewQueue.pendingCount', { count: 45 })  // "待審核記錄: 45 筆"
 */
export function useTranslation() {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.')
      let value: unknown = zhTW

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k]
        } else {
          // Key not found — return the key itself as fallback
          return key
        }
      }

      if (typeof value !== 'string') {
        return key
      }

      if (!params) {
        return value
      }

      // Interpolate {key} placeholders
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return paramKey in params ? String(params[paramKey]) : `{${paramKey}}`
      })
    },
    []
  )

  return { t } as const
}

/**
 * Non-hook version for use outside React components
 * (e.g., in utility functions, constants, or tests).
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: unknown = zhTW

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  if (typeof value !== 'string') {
    return key
  }

  if (!params) {
    return value
  }

  return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
    return paramKey in params ? String(params[paramKey]) : `{${paramKey}}`
  })
}
