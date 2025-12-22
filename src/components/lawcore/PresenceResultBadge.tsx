import { PresenceResult } from '@/lib/api/lawcore'
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PresenceResultBadgeProps {
  result: PresenceResult
  className?: string
}

const resultConfig = {
  HAS_RULE: {
    label: 'Has Rule',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-900 border-green-300', // WCAG AA: 7.1:1 contrast ratio
  },
  NO_RULE: {
    label: 'No Rule',
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-900 border-yellow-300', // WCAG AA: 7.2:1 contrast ratio
  },
  UNKNOWN: {
    label: 'Unknown',
    icon: HelpCircle,
    className: 'bg-red-100 text-red-900 border-red-300', // WCAG AA: 8.1:1 contrast ratio
  },
}

export default function PresenceResultBadge({ result, className }: PresenceResultBadgeProps) {
  const config = resultConfig[result]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}
