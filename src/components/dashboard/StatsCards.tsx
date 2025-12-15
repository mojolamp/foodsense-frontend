import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Props {
  totalPending: number
  failCount: number
  warnCount: number
}

export default function StatsCards({ totalPending, failCount, warnCount }: Props) {
  const cards = [
    {
      name: '待審核總數',
      value: totalPending,
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'FAIL 狀態',
      value: failCount,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'WARN 狀態',
      value: warnCount,
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{card.name}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
