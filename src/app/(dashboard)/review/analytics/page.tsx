'use client'

import { useState } from 'react'
import { useCalculatedPersonalMetrics } from '@/hooks/useReviewMetrics'
import { TrendingUp, TrendingDown, Award, Target, Star, Activity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import EfficiencyAnalysis from '@/components/review/EfficiencyAnalysis'
import type { ReviewerMetrics } from '@/types/review'

// 組件 Props 類型定義
type TrendType = 'up' | 'down' | 'stable'
type InsightColorType = 'green' | 'blue' | 'amber' | 'purple'

interface PersonalPerformanceProps {
  metrics: ReviewerMetrics
  qualityTrend: TrendType
  confidenceTrend: TrendType
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle: string
  trend?: TrendType
  highlight?: boolean
}

interface ActivityCardProps {
  title: string
  value: number
  total: number
}

interface InsightCardProps {
  title: string
  insight: string
  color: InsightColorType
}

export default function ReviewAnalyticsPage() {
  const { data: metrics, isLoading } = useCalculatedPersonalMetrics()
  const [activeTab, setActiveTab] = useState<'personal' | 'efficiency'>('personal')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">無法載入審核統計資料</p>
      </div>
    )
  }

  const qualityTrend = metrics.avg_quality_score >= 7 ? 'up' : metrics.avg_quality_score >= 5 ? 'stable' : 'down'
  const confidenceTrend = metrics.avg_confidence_score >= 0.8 ? 'up' : metrics.avg_confidence_score >= 0.6 ? 'stable' : 'down'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">審核分析</h1>
        <p className="mt-2 text-muted-foreground">
          個人績效追蹤與效率分析
        </p>
      </div>

      {/* Tab 切換 */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('personal')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === 'personal'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            個人績效
          </div>
        </button>
        <button
          onClick={() => setActiveTab('efficiency')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === 'efficiency'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            效率分析
          </div>
        </button>
      </div>

      {/* 條件渲染內容 */}
      {activeTab === 'personal' ? (
        <PersonalPerformance metrics={metrics} qualityTrend={qualityTrend} confidenceTrend={confidenceTrend} />
      ) : (
        <EfficiencyAnalysis />
      )}
    </div>
  )
}

// 個人績效組件
function PersonalPerformance({ metrics, qualityTrend, confidenceTrend }: PersonalPerformanceProps) {
  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="總審核量"
          value={metrics.total_reviewed}
          icon={Target}
          subtitle={`本月 ${metrics.reviews_this_month} 筆`}
        />
        <MetricCard
          title="平均品質分數"
          value={metrics.avg_quality_score.toFixed(1)}
          icon={Award}
          subtitle="滿分 10 分"
          trend={qualityTrend}
        />
        <MetricCard
          title="平均信心度"
          value={`${(metrics.avg_confidence_score * 100).toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="審核準確度"
          trend={confidenceTrend}
        />
        <MetricCard
          title="黃金樣本"
          value={metrics.gold_sample_count}
          icon={Star}
          subtitle={`佔比 ${metrics.total_reviewed > 0 ? ((metrics.gold_sample_count / metrics.total_reviewed) * 100).toFixed(1) : 0}%`}
          highlight
        />
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActivityCard
          title="今日審核"
          value={metrics.reviews_today}
          total={metrics.total_reviewed}
        />
        <ActivityCard
          title="本週審核"
          value={metrics.reviews_this_week}
          total={metrics.total_reviewed}
        />
        <ActivityCard
          title="本月審核"
          value={metrics.reviews_this_month}
          total={metrics.total_reviewed}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quality Score Distribution */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">品質分數分佈</h3>
          <div className="space-y-3">
            {metrics.quality_distribution.map((item: { score: number; count: number }) => (
              <div key={item.score} className="flex items-center gap-3">
                <div className="w-8 text-sm font-medium text-muted-foreground">{item.score} 分</div>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      item.score >= 8 ? "bg-green-500" : item.score >= 6 ? "bg-blue-500" : "bg-amber-500"
                    )}
                    style={{
                      width: `${metrics.total_reviewed > 0 ? (item.count / metrics.total_reviewed) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-right text-muted-foreground">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">信心度分佈</h3>
          <div className="space-y-3">
            {metrics.confidence_distribution.map((item: { range: string; count: number }) => (
              <div key={item.range} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-muted-foreground">{item.range}</div>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      item.range === '0.8-1.0' ? "bg-green-500" : item.range === '0.6-0.8' ? "bg-blue-500" : "bg-amber-500"
                    )}
                    style={{
                      width: `${metrics.total_reviewed > 0 ? (item.count / metrics.total_reviewed) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-right text-muted-foreground">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-4">績效洞察</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <InsightCard
            title="品質評估"
            insight={
              metrics.avg_quality_score >= 8
                ? "優秀！您的審核品質一直保持高水準"
                : metrics.avg_quality_score >= 6
                ? "良好，可以考慮提高審核嚴格度"
                : "需要改善，建議參考黃金樣本標準"
            }
            color={metrics.avg_quality_score >= 8 ? "green" : metrics.avg_quality_score >= 6 ? "blue" : "amber"}
          />
          <InsightCard
            title="信心度評估"
            insight={
              metrics.avg_confidence_score >= 0.85
                ? "非常自信！審核標準一致性高"
                : metrics.avg_confidence_score >= 0.7
                ? "信心良好，可繼續保持"
                : "建議多參考規則與範例提升信心"
            }
            color={metrics.avg_confidence_score >= 0.85 ? "green" : metrics.avg_confidence_score >= 0.7 ? "blue" : "amber"}
          />
          <InsightCard
            title="黃金樣本貢獻"
            insight={
              metrics.gold_sample_count >= 10
                ? `已貢獻 ${metrics.gold_sample_count} 個黃金樣本，感謝！`
                : `已貢獻 ${metrics.gold_sample_count} 個黃金樣本，持續累積中`
            }
            color="purple"
          />
          <InsightCard
            title="審核活躍度"
            insight={
              metrics.reviews_today >= 20
                ? "今日非常活躍！"
                : metrics.reviews_today >= 10
                ? "今日活躍度良好"
                : metrics.reviews_today > 0
                ? "今日審核量較低"
                : "今日尚未開始審核"
            }
            color={metrics.reviews_today >= 10 ? "green" : "blue"}
          />
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, subtitle, trend, highlight }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6",
      highlight && "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
    )}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={cn(
          "h-4 w-4 text-muted-foreground",
          highlight && "text-amber-500"
        )} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

// Activity Card Component
function ActivityCard({ title, value, total }: ActivityCardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        佔總量 {percentage.toFixed(1)}%
      </p>
    </div>
  )
}

// Insight Card Component
function InsightCard({ title, insight, color }: InsightCardProps) {
  const colorClasses = {
    green: "border-green-200 bg-green-50 dark:bg-green-950/20",
    blue: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
    amber: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
    purple: "border-purple-200 bg-purple-50 dark:bg-purple-950/20",
  }

  return (
    <div className={cn("rounded-lg border p-4", colorClasses[color as keyof typeof colorClasses])}>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{insight}</p>
    </div>
  )
}
