/**
 * Feature Flags System - Enhanced for P1 UI/UX Tasks
 *
 * Supports both environment variables (for production) and localStorage (for development).
 * All flags default to false for safe gradual rollout.
 */

export interface FeatureFlags {
  // P1 Phase 1: Quick Wins
  review_queue_enhanced_hotkeys: boolean
  monitoring_time_picker_v2: boolean
  empty_states_v2: boolean

  // P1 Phase 2: Performance
  product_virtual_scrolling: boolean
  filter_ux_v2: boolean
  mobile_rwd_fixes: boolean

  // P1 Phase 3: Advanced
  data_quality_trends: boolean
  screen_reader_enhancements: boolean
  a11y_automation: boolean
}

// Default flags (all disabled for safety)
const DEFAULT_FLAGS: FeatureFlags = {
  review_queue_enhanced_hotkeys: false,
  monitoring_time_picker_v2: false,
  empty_states_v2: false,
  product_virtual_scrolling: false,
  filter_ux_v2: false,
  mobile_rwd_fixes: false,
  data_quality_trends: false,
  screen_reader_enhancements: false,
  a11y_automation: false,
}

// Legacy function for backward compatibility
export function getBooleanFeatureFlag(name: string, defaultValue = false): boolean {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue

  switch (raw.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'y':
    case 'on':
      return true
    case '0':
    case 'false':
    case 'no':
    case 'n':
    case 'off':
      return false
    default:
      return defaultValue
  }
}

// Load flags from localStorage (client-side only)
function loadFlagsFromStorage(): Partial<FeatureFlags> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem('featureFlags')
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('[FeatureFlags] Failed to load from localStorage:', error)
    return {}
  }
}

// Get all active flags (environment + localStorage)
export function getAllFlags(): FeatureFlags {
  const envFlags: Partial<FeatureFlags> = {}

  // Check environment variables (server-side and build-time)
  Object.keys(DEFAULT_FLAGS).forEach((key) => {
    const envKey = `NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`
    const envValue = process.env[envKey]
    if (envValue !== undefined) {
      envFlags[key as keyof FeatureFlags] = getBooleanFeatureFlag(envKey, false)
    }
  })

  // Merge with localStorage (client-side overrides for development)
  const storageFlags = loadFlagsFromStorage()

  return { ...DEFAULT_FLAGS, ...envFlags, ...storageFlags }
}

// Check if a specific feature is enabled
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getAllFlags()
  return flags[flag] ?? false
}

// Development utilities (client-side only)

export function enableFeature(flag: keyof FeatureFlags): void {
  if (typeof window === 'undefined') return

  try {
    const current = loadFlagsFromStorage()
    const updated = { ...current, [flag]: true }
    localStorage.setItem('featureFlags', JSON.stringify(updated))
    console.log(`[FeatureFlags] Enabled: ${flag}`)
  } catch (error) {
    console.error(`[FeatureFlags] Failed to enable ${flag}:`, error)
  }
}

export function disableFeature(flag: keyof FeatureFlags): void {
  if (typeof window === 'undefined') return

  try {
    const current = loadFlagsFromStorage()
    const updated = { ...current, [flag]: false }
    localStorage.setItem('featureFlags', JSON.stringify(updated))
    console.log(`[FeatureFlags] Disabled: ${flag}`)
  } catch (error) {
    console.error(`[FeatureFlags] Failed to disable ${flag}:`, error)
  }
}

export function setMultipleFlags(flags: Partial<FeatureFlags>): void {
  if (typeof window === 'undefined') return

  try {
    const current = loadFlagsFromStorage()
    const updated = { ...current, ...flags }
    localStorage.setItem('featureFlags', JSON.stringify(updated))
    console.log('[FeatureFlags] Updated multiple flags:', flags)
  } catch (error) {
    console.error('[FeatureFlags] Failed to set flags:', error)
  }
}

export function resetAllFlags(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('featureFlags')
  console.log('[FeatureFlags] Reset all flags to default')
}

// Expose utilities to browser console for easy testing
if (typeof window !== 'undefined') {
  ;(window as any).__featureFlags = {
    get: getAllFlags,
    check: isFeatureEnabled,
    enable: enableFeature,
    disable: disableFeature,
    set: setMultipleFlags,
    reset: resetAllFlags,
  }

  console.log('[FeatureFlags] Development utilities available at window.__featureFlags')
}

