'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle,
  TrendingUp,
  ClipboardCheck,
  LineChart,
  BookOpen,
  Shield,
  BarChart3,
  Package,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { monitoringAPI } from '@/lib/api/monitoring'
import { reviewAPI } from '@/lib/api/endpoints/review'
import { Skeleton } from '@/components/ui/skeleton'
import CriticalAlertsBanner from '@/components/dashboard/CriticalAlertsBanner'
import SystemPulseRow from '@/components/dashboard/SystemPulseRow'
import PipelineStatusPanel from '@/components/dashboard/PipelineStatusPanel'
import RecentErrorsList from '@/components/dashboard/RecentErrorsList'

interface QuickLink {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
  badge?: string
}

export default function DashboardPage() {
  const { data: business, isLoading: loadingBusiness } = useQuery({
    queryKey: ['dashboard', 'business'],
    queryFn: () => monitoringAPI.getBusinessHealth('24h'),
    refetchInterval: 60000,
    retry: 1,
  })

  const { data: reviewStats, isLoading: loadingReview } = useQuery({
    queryKey: ['dashboard', 'reviewStats'],
    queryFn: () => reviewAPI.getStats(),
    refetchInterval: 30000,
    retry: 1,
  })

  const totalPending = reviewStats?.queue_stats?.reduce(
    (sum, s) => sum + s.pending_count, 0
  ) ?? 0

  const quickLinks: QuickLink[] = [
    { title: '審核佇列', description: '待審核記錄', href: '/review/queue', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-100', badge: totalPending > 0 ? String(totalPending) : undefined },
    { title: '產品列表', description: '已標準化產品', href: '/products', icon: Package, color: 'text-green-600 bg-green-100' },
    { title: '監控儀表板', description: '系統健康狀態', href: '/monitoring', icon: LineChart, color: 'text-purple-600 bg-purple-100' },
    { title: '資料品質', description: '品質分析與趨勢', href: '/data-quality', icon: BarChart3, color: 'text-orange-600 bg-orange-100' },
    { title: 'LawCore 規則', description: '法規驗證引擎', href: '/lawcore', icon: Shield, color: 'text-red-600 bg-red-100' },
    { title: '字典管理', description: '標準化參考資料', href: '/dictionary', icon: BookOpen, color: 'text-indigo-600 bg-indigo-100' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h2>
        <p className="text-muted-foreground mt-1">System pulse, alerts, pipeline status — at a glance.</p>
      </div>

      {/* Critical Alerts Banner */}
      <CriticalAlertsBanner />

      {/* System Pulse Row */}
      <SystemPulseRow />

      {/* Traffic + Queue Breakdown */}
      <div className="grid gap-4 lg:grid-cols-8">
        {/* Traffic Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold">Hourly Traffic</h3>
            <p className="text-xs text-muted-foreground">Request volume (24h)</p>
          </div>
          <div className="p-4">
            {loadingBusiness ? (
              <Skeleton className="h-28 w-full" />
            ) : business?.hourly_traffic && business.hourly_traffic.length > 0 ? (
              <div className="flex items-end gap-0.5 h-28">
                {business.hourly_traffic.map((point, i) => {
                  const max = Math.max(...business.hourly_traffic.map(p => p.requests), 1)
                  const height = (point.requests / max) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-chart-primary/70 hover:bg-chart-primary rounded-t transition-colors"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${point.hour}: ${point.requests} req`}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
                No traffic data
              </div>
            )}
          </div>
        </div>

        {/* Queue Breakdown (3 cols) */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold">Queue Breakdown</h3>
            <p className="text-xs text-muted-foreground">Pending by status</p>
          </div>
          <div className="p-4">
            {loadingReview ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : reviewStats?.queue_stats && reviewStats.queue_stats.length > 0 ? (
              <div className="space-y-2">
                {reviewStats.queue_stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        stat.logic_validation_status === 'FAIL' && 'bg-status-fail',
                        stat.logic_validation_status === 'WARN' && 'bg-status-warn',
                        stat.logic_validation_status === 'PASS' && 'bg-status-pass',
                      )} />
                      <span className="text-xs font-medium">{stat.logic_validation_status}</span>
                      <span className="text-xs text-muted-foreground">/ {stat.confidence_level}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold">{stat.pending_count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-status-pass" />
                All clear
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Status + Recent Errors */}
      <div className="grid gap-4 lg:grid-cols-8">
        <div className="lg:col-span-5">
          <PipelineStatusPanel />
        </div>
        <div className="lg:col-span-3">
          <RecentErrorsList />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-sm hover:border-primary/50 transition-all"
            >
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-md", link.color)}>
                <link.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold group-hover:text-primary transition-colors">{link.title}</h4>
                <p className="text-[10px] text-muted-foreground">{link.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded-full">
                    {link.badge}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
