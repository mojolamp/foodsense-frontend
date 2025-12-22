import { Card } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthScoreCardProps {
  score: number // 0-100
}

export default function HealthScoreCard({ score }: HealthScoreCardProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 70) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const status = getHealthStatus(score)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">System Health Score</h3>
        <div className={cn('p-2 rounded-lg', status.bgColor)}>
          <Activity className={cn('h-5 w-5', status.color)} />
        </div>
      </div>

      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-32 h-32">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={status.color}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="mt-4">
          <span className={cn('text-sm font-semibold', status.color)}>{status.label}</span>
        </div>
      </div>
    </Card>
  )
}
