import { cn } from '@/lib/utils'

interface MiniBarChartProps {
  data: number[]
  height?: number
  barColor?: string
  className?: string
}

export function MiniBarChart({
  data,
  height = 64,
  barColor = 'bg-chart-primary',
  className,
}: MiniBarChartProps) {
  if (data.length === 0) return null

  const max = Math.max(...data)
  if (max === 0) return null

  return (
    <div
      className={cn('flex items-end gap-px', className)}
      style={{ height }}
      role="img"
      aria-label="Bar chart"
    >
      {data.map((val, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-t transition-all', barColor)}
          style={{ height: `${(val / max) * 100}%` }}
          title={String(val)}
        />
      ))}
    </div>
  )
}
