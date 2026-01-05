'use client'

import { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Calendar, ChevronDown, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subHours, subDays, startOfDay, endOfDay } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export type TimeRangePreset = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom'

export interface CustomTimeRange {
  start: Date
  end: Date
}

export interface TimeRangeValue {
  preset: TimeRangePreset
  custom?: CustomTimeRange
}

interface TimeRangePickerV2Props {
  value: TimeRangeValue
  onChange: (value: TimeRangeValue) => void
  className?: string
}

const PRESETS: Array<{ value: TimeRangePreset; label: string; description: string }> = [
  { value: '1h', label: '最近 1 小時', description: 'Last 1 hour' },
  { value: '6h', label: '最近 6 小時', description: 'Last 6 hours' },
  { value: '24h', label: '最近 24 小時', description: 'Last 24 hours' },
  { value: '7d', label: '最近 7 天', description: 'Last 7 days' },
  { value: '30d', label: '最近 30 天', description: 'Last 30 days' },
  { value: 'custom', label: '自定義範圍', description: 'Custom range' },
]

function getPresetTimeRange(preset: TimeRangePreset): CustomTimeRange | null {
  if (preset === 'custom') return null

  const end = new Date()
  let start: Date

  switch (preset) {
    case '1h':
      start = subHours(end, 1)
      break
    case '6h':
      start = subHours(end, 6)
      break
    case '24h':
      start = subHours(end, 24)
      break
    case '7d':
      start = subDays(end, 7)
      break
    case '30d':
      start = subDays(end, 30)
      break
    default:
      start = subHours(end, 1)
  }

  return { start, end }
}

function formatTimeRangeDisplay(value: TimeRangeValue): string {
  if (value.preset === 'custom' && value.custom) {
    const startStr = format(value.custom.start, 'MM/dd HH:mm', { locale: zhTW })
    const endStr = format(value.custom.end, 'MM/dd HH:mm', { locale: zhTW })
    return `${startStr} ~ ${endStr}`
  }

  const preset = PRESETS.find((p) => p.value === value.preset)
  return preset?.label || '選擇時間範圍'
}

export default function TimeRangePickerV2({
  value,
  onChange,
  className,
}: TimeRangePickerV2Props) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  const handlePresetChange = (preset: TimeRangePreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(true)
      // Initialize with current day
      const now = new Date()
      setCustomStart(format(startOfDay(now), "yyyy-MM-dd'T'HH:mm"))
      setCustomEnd(format(now, "yyyy-MM-dd'T'HH:mm"))
    } else {
      setShowCustomPicker(false)
      const customRange = getPresetTimeRange(preset)
      onChange({
        preset,
        custom: customRange || undefined,
      })
    }
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return

    const start = new Date(customStart)
    const end = new Date(customEnd)

    if (start >= end) {
      alert('結束時間必須晚於開始時間')
      return
    }

    onChange({
      preset: 'custom',
      custom: { start, end },
    })
    setShowCustomPicker(false)
  }

  const selectedPreset = PRESETS.find((p) => p.value === value.preset) || PRESETS[0]

  return (
    <div className={cn('relative', className)}>
      <Listbox value={value.preset} onChange={handlePresetChange}>
        {({ open }) => (
          <>
            <Listbox.Button className="relative w-full sm:w-auto min-w-[200px] cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-accent transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">
                    {formatTimeRangeDisplay(value)}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
                    open && 'transform rotate-180'
                  )}
                />
              </div>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full sm:w-auto min-w-[280px] overflow-auto rounded-lg border border-border bg-background py-1 shadow-lg focus:outline-none">
                {PRESETS.map((preset) => (
                  <Listbox.Option
                    key={preset.value}
                    value={preset.value}
                    className={({ active }) =>
                      cn(
                        'relative cursor-pointer select-none px-4 py-3 transition-colors',
                        active && 'bg-accent'
                      )
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border mt-0.5',
                            selected
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {selected && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={cn('text-sm font-medium', selected && 'text-primary')}>
                            {preset.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {preset.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </>
        )}
      </Listbox>

      {/* Custom Date/Time Picker Modal */}
      {showCustomPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">自定義時間範圍</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="customStart" className="block text-sm font-medium mb-2">
                  開始時間
                </label>
                <input
                  id="customStart"
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label htmlFor="customEnd" className="block text-sm font-medium mb-2">
                  結束時間
                </label>
                <input
                  id="customEnd"
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCustomApply}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  套用
                </button>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
