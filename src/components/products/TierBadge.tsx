import clsx from 'clsx'
import type { TierLevel } from '@/types/product'

export default function TierBadge({ tier }: { tier: TierLevel }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        tier === 'A+' && 'bg-amber-200 text-amber-900 ring-1 ring-amber-400',
        tier === 'A' && 'bg-green-100 text-green-800',
        tier === 'B' && 'bg-yellow-100 text-yellow-800',
        tier === 'C' && 'bg-red-100 text-red-800'
      )}
    >
      Tier {tier}
    </span>
  )
}
