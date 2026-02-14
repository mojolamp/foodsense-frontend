import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = 'currentColor',
  className,
}: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const padding = 1
  const effectiveWidth = width - padding * 2
  const effectiveHeight = height - padding * 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * effectiveWidth
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('inline-block', className)}
      role="img"
      aria-label="Sparkline chart"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
