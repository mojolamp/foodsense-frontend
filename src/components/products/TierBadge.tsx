import clsx from 'clsx'

export default function TierBadge({ tier }: { tier: 'A' | 'B' | 'C' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        tier === 'A' && 'bg-green-100 text-green-800',
        tier === 'B' && 'bg-yellow-100 text-yellow-800',
        tier === 'C' && 'bg-red-100 text-red-800'
      )}
    >
      Tier {tier}
    </span>
  )
}


