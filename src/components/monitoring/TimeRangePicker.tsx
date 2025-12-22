'use client'

import { TimeRange } from '@/lib/api/monitoring'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimeRangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
]

export default function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-1">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(range.value)}
          className={cn(
            'px-3 py-1 text-xs font-medium',
            value === range.value
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-muted'
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}
