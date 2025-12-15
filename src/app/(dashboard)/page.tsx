'use client'

import { useReviewStats } from '@/hooks/useReviewQueue'
import StatsCards from '@/components/dashboard/StatsCards'
import type { QueueStat } from '@/types/review'

export default function DashboardPage() {
  const { data: stats, isLoading } = useReviewStats()

  if (isLoading) {
    return <div className="text-gray-600">載入中...</div>
  }

  const queueStats = stats?.queue_stats || []

  // Calculate totals
  const totalPending = queueStats.reduce((sum: number, stat: QueueStat) =>
    sum + (stat.pending_count || 0), 0
  )

  const failCount = queueStats
    .filter((s: QueueStat) => s.logic_validation_status === 'FAIL')
    .reduce((sum: number, s: QueueStat) => sum + s.pending_count, 0)

  const warnCount = queueStats
    .filter((s: QueueStat) => s.logic_validation_status === 'WARN')
    .reduce((sum: number, s: QueueStat) => sum + s.pending_count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">統計儀表板</h1>
        <p className="mt-2 text-gray-600">審核系統總覽</p>
      </div>

      <StatsCards
        totalPending={totalPending}
        failCount={failCount}
        warnCount={warnCount}
      />

      {/* Queue Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">佇列統計明細</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  驗證狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  信心水平
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  待審核數量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  平均等待時間
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {queueStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    目前沒有統計資料
                  </td>
                </tr>
              ) : (
                queueStats.map((stat: QueueStat, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium">
                      {stat.logic_validation_status}
                    </td>
                    <td className="px-6 py-4 text-sm">{stat.confidence_level}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {stat.pending_count}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {stat.avg_wait_hours ? `${stat.avg_wait_hours.toFixed(1)} 小時` : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
