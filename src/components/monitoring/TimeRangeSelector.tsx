'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { isFeatureEnabled } from '@/lib/featureFlags'
import { type TimeRange } from '@/lib/api/monitoring'
import TimeRangePicker from './TimeRangePicker'
import TimeRangePickerV2, { type TimeRangeValue, type CustomTimeRange } from './TimeRangePickerV2'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

/**
 * TimeRangeSelector - Smart wrapper that switches between v1 and v2 based on feature flag
 *
 * - If monitoring_time_picker_v2 disabled: Uses legacy TimeRangePicker (3 presets)
 * - If monitoring_time_picker_v2 enabled: Uses TimeRangePickerV2 (6 presets + custom range + URL sync)
 */
export default function TimeRangeSelector({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) {
  const v2Enabled = isFeatureEnabled('monitoring_time_picker_v2')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Convert legacy TimeRange to TimeRangeValue for v2
  const convertToV2Value = (legacyRange: TimeRange): TimeRangeValue => {
    // Map legacy values to v2 presets
    if (legacyRange === '1h' || legacyRange === '24h' || legacyRange === '7d') {
      return { preset: legacyRange }
    }
    // Default to 1h if unknown
    return { preset: '1h' }
  }

  // Convert TimeRangeValue back to legacy TimeRange
  const convertToLegacy = (v2Value: TimeRangeValue): TimeRange => {
    // For custom ranges or new presets (6h, 30d), fall back to closest legacy value
    if (v2Value.preset === 'custom') return '24h' // Custom -> default to 24h
    if (v2Value.preset === '6h') return '1h' // 6h -> closest is 1h (for legacy API)
    if (v2Value.preset === '30d') return '7d' // 30d -> closest is 7d (for legacy API)
    return v2Value.preset as TimeRange
  }

  // URL parameter synchronization (v2 only)
  useEffect(() => {
    if (!v2Enabled) return

    // On mount, try to load from URL
    const startParam = searchParams.get('start_time')
    const endParam = searchParams.get('end_time')

    if (startParam && endParam) {
      // URL has custom range
      try {
        const start = new Date(startParam)
        const end = new Date(endParam)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          onChange('24h') // Trigger with 24h as fallback for legacy compatibility
        }
      } catch (error) {
        console.error('[TimeRangeSelector] Invalid URL time parameters:', error)
      }
    }
  }, []) // Only run on mount

  const handleV2Change = (v2Value: TimeRangeValue) => {
    // Update URL parameters if v2 enabled
    if (v2Enabled && v2Value.custom) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('start_time', v2Value.custom.start.toISOString())
      params.set('end_time', v2Value.custom.end.toISOString())
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    } else if (v2Enabled) {
      // Clear URL parameters for presets
      const params = new URLSearchParams(searchParams.toString())
      params.delete('start_time')
      params.delete('end_time')
      const newSearch = params.toString()
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false })
    }

    // Convert to legacy and call onChange
    const legacyValue = convertToLegacy(v2Value)
    onChange(legacyValue)
  }

  if (v2Enabled) {
    const v2Value = convertToV2Value(value)
    return (
      <TimeRangePickerV2
        value={v2Value}
        onChange={handleV2Change}
        className={className}
      />
    )
  }

  // Legacy v1
  return (
    <TimeRangePicker
      value={value}
      onChange={onChange}
    />
  )
}
