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

  // P2 Phase: Data Acquisition UI
  ocr_scanner: boolean
  etl_pipeline: boolean
  document_upload: boolean
  crawler_admin: boolean
  dlq_operations: boolean
  acquisition_metrics: boolean
  ingestion_manual_submit: boolean

  // P3 Phase: Full Coverage
  control_plane: boolean
  knowledge_graph: boolean
  benchmark_runner: boolean
  monitoring_deep: boolean
  ocr_review_queue: boolean

  // P4 Phase: Dashboard-First Redesign
  pipeline_operations: boolean
  dashboard_command_center: boolean
  crawler_full_control: boolean
  etl_review_section: boolean
  ocr_corrections: boolean
  ground_truth_panel: boolean
  dictionary_additives: boolean
  pac_diagnostics: boolean
  tab_flattening: boolean
  data_quality_flat: boolean
  monitoring_infra_flat: boolean
  dlq_flat: boolean
  products_kpi: boolean
  sparse_page_modernize: boolean
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
  ocr_scanner: false,
  etl_pipeline: false,
  document_upload: false,
  crawler_admin: false,
  dlq_operations: false,
  acquisition_metrics: false,
  ingestion_manual_submit: false,
  control_plane: false,
  knowledge_graph: false,
  benchmark_runner: false,
  monitoring_deep: false,
  ocr_review_queue: false,
  pipeline_operations: false,
  dashboard_command_center: false,
  crawler_full_control: false,
  etl_review_section: false,
  ocr_corrections: false,
  ground_truth_panel: false,
  dictionary_additives: false,
  pac_diagnostics: false,
  tab_flattening: false,
  data_quality_flat: false,
  monitoring_infra_flat: false,
  dlq_flat: false,
  products_kpi: false,
  sparse_page_modernize: false,
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

