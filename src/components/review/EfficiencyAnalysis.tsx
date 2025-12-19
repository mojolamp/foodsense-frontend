'use client'

import { useReviewQueue, useReviewStats } from '@/hooks/useReviewQueue'
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EfficiencyAnalysis() {
  const { data: queue } = useReviewQueue()
  const { data: stats } = useReviewStats()

  if (!queue || !stats) return null

  // 計算漏斗數據
  const totalRecords = queue.length
  const failCount = queue.filter(r => r.logic_validation_status === 'FAIL').length
  const warnCount = queue.filter(r => r.logic_validation_status === 'WARN').length
  const passCount = queue.filter(r => r.logic_validation_status === 'PASS').length

  // 計算低信心度記錄
  const lowConfidence = queue.filter(r => r.confidence_level === 'LOW').length
  const mediumConfidence = queue.filter(r => r.confidence_level === 'MEDIUM').length
  const highConfidence = queue.filter(r => r.confidence_level === 'HIGH').length

  // 計算等待時間統計
  const waitTimes = queue.map(record => {
    const now = new Date()
    const created = new Date(record.created_at)
    return (now.getTime() - created.getTime()) / (1000 * 60 * 60) // 小時
  })

  const avgWaitTime = waitTimes.length > 0
    ? waitTimes.reduce((sum, t) => sum + t, 0) / waitTimes.length
    : 0

  const maxWaitTime = waitTimes.length > 0 ? Math.max(...waitTimes) : 0

  // 積壓預警
  const urgentRecords = queue.filter(record => {
    const hours = (new Date().getTime() - new Date(record.created_at).getTime()) / (1000 * 60 * 60)
    return hours > 24
  }).length

  return (
    <div className="space-y-6">
      {/* 審核漏斗 */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">審核流程漏斗</h3>
            <p className="text-sm text-muted-foreground mt-1">待處理記錄分佈</p>
          </div>
          <Activity className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {/* FAIL */}
          <FunnelBar
            label="FAIL - 需修正"
            count={failCount}
            total={totalRecords}
            color="red"
            icon={AlertTriangle}
          />

          {/* WARN */}
          <FunnelBar
            label="WARN - 需注意"
            count={warnCount}
            total={totalRecords}
            color="amber"
            icon={AlertTriangle}
          />

          {/* PASS */}
          <FunnelBar
            label="PASS - 待確認"
            count={passCount}
            total={totalRecords}
            color="green"
            icon={CheckCircle2}
          />
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">總待審核</span>
            <span className="font-bold text-lg">{totalRecords} 筆</span>
          </div>
        </div>
      </div>

      {/* 信心度分佈 & 等待時間分析 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 信心度分佈 */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">信心度分佈</h3>
          <div className="space-y-3">
            <ConfidenceBar label="LOW" count={lowConfidence} total={totalRecords} color="red" />
            <ConfidenceBar label="MEDIUM" count={mediumConfidence} total={totalRecords} color="amber" />
            <ConfidenceBar label="HIGH" count={highConfidence} total={totalRecords} color="green" />
          </div>
        </div>

        {/* 等待時間分析 */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">等待時間分析</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">平均等待時間</span>
              <span className="font-bold">{avgWaitTime.toFixed(1)} 小時</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最長等待時間</span>
              <span className="font-bold">{maxWaitTime.toFixed(1)} 小時</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">超過 24 小時</span>
              <span className={cn("font-bold", urgentRecords > 0 ? "text-red-600" : "text-green-600")}>
                {urgentRecords} 筆
              </span>
            </div>
          </div>

          {urgentRecords > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">積壓預警：{urgentRecords} 筆記錄等待超過 24 小時</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 效率指標 */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="需要緊急處理"
          value={urgentRecords}
          total={totalRecords}
          color={urgentRecords > 10 ? "red" : urgentRecords > 0 ? "amber" : "green"}
          icon={Clock}
        />
        <MetricCard
          title="高優先級 (FAIL)"
          value={failCount}
          total={totalRecords}
          color={failCount > 20 ? "red" : failCount > 10 ? "amber" : "green"}
          icon={AlertTriangle}
        />
        <MetricCard
          title="低信心度記錄"
          value={lowConfidence}
          total={totalRecords}
          color={lowConfidence > 15 ? "red" : lowConfidence > 5 ? "amber" : "green"}
          icon={TrendingUp}
        />
      </div>
    </div>
  )
}

// 漏斗條形圖組件
function FunnelBar({ label, count, total, color, icon: Icon }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colorClasses = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", `text-${color}-500`)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
          <span className="text-sm font-bold min-w-[3rem] text-right">{count} 筆</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={cn("h-full transition-all", colorClasses[color as keyof typeof colorClasses])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// 信心度條形圖組件
function ConfidenceBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colorClasses = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full transition-all", colorClasses[color as keyof typeof colorClasses])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// 效率指標卡片
function MetricCard({ title, value, total, color, icon: Icon }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  const bgClasses = {
    red: "bg-red-50 border-red-200",
    amber: "bg-amber-50 border-amber-200",
    green: "bg-green-50 border-green-200",
  }

  const textClasses = {
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-green-600",
  }

  return (
    <div className={cn("rounded-xl border p-6", bgClasses[color as keyof typeof bgClasses])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className={cn("w-5 h-5", textClasses[color as keyof typeof textClasses])} />
      </div>
      <div className={cn("text-3xl font-bold", textClasses[color as keyof typeof textClasses])}>
        {value}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        佔總量 {percentage.toFixed(1)}%
      </p>
    </div>
  )
}
