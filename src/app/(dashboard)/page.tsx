'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Zap,
  TrendingUp,
  ClipboardCheck,
  LineChart,
  BookOpen,
  Shield,
  BarChart3,
  Package,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { monitoringAPI } from '@/lib/api/monitoring'
import { reviewAPI } from '@/lib/api/endpoints/review'
import { productsAPI } from '@/lib/api/endpoints/products'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  sub: string
  icon: LucideIcon
  alert?: boolean
  trend?: 'up' | 'down'
  loading?: boolean
}

interface QuickLink {
  title: string
  description: string
  href: string
  icon: LucideIcon
  color: string
  badge?: string
}

export default function DashboardPage() {
  // Real API data
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

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['dashboard', 'products'],
    queryFn: () => productsAPI.getProducts({ page: 1, page_size: 1 }),
    refetchInterval: 60000,
    retry: 1,
  })

  // Derived values
  const totalPending = reviewStats?.queue_stats?.reduce(
    (sum, s) => sum + s.pending_count, 0
  ) ?? 0

  const totalProducts = productsData?.total ?? 0

  const quickLinks: QuickLink[] = [
    {
      title: '\u5be9\u6838\u4f47\u5217',
      description: '\u5f85\u5be9\u6838\u8a18\u9304',
      href: '/review/queue',
      icon: ClipboardCheck,
      color: 'text-blue-600 bg-blue-100',
      badge: totalPending > 0 ? String(totalPending) : undefined,
    },
    {
      title: '\u7522\u54c1\u5217\u8868',
      description: '\u5df2\u6a19\u6e96\u5316\u7522\u54c1',
      href: '/products',
      icon: Package,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: '\u76e3\u63a7\u5100\u8868\u677f',
      description: '\u7cfb\u7d71\u5065\u5eb7\u72c0\u614b',
      href: '/monitoring',
      icon: LineChart,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: '\u8cc7\u6599\u54c1\u8cea',
      description: '\u54c1\u8cea\u5206\u6790\u8207\u8da8\u52e2',
      href: '/data-quality',
      icon: BarChart3,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      title: 'LawCore \u898f\u5247',
      description: '\u6cd5\u898f\u9a57\u8b49\u5f15\u64ce',
      href: '/lawcore',
      icon: Shield,
      color: 'text-red-600 bg-red-100',
    },
    {
      title: '\u5b57\u5178\u7ba1\u7406',
      description: '\u6a19\u6e96\u5316\u53c3\u8003\u8cc7\u6599',
      href: '/dictionary',
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-100',
    },
  ]

  const isAnyLoading = loadingBusiness || loadingReview || loadingProducts

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">System overview and real-time metrics.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pipeline Velocity"
          value={business ? `${business.total_requests.toLocaleString()} req` : '-'}
          sub={business ? `Health: ${business.health_score}/100` : 'Loading...'}
          icon={Zap}
          loading={loadingBusiness}
        />
        <StatsCard
          title="Review Queue"
          value={totalPending}
          sub={`${reviewStats?.queue_stats?.length ?? 0} status groups`}
          icon={Clock}
          alert={totalPending > 50}
          loading={loadingReview}
        />
        <StatsCard
          title="LawCore Adoption"
          value={business ? `${business.lawcore_adoption_rate.toFixed(1)}%` : '-'}
          sub={business ? `Daily cost: $${business.daily_cost.toFixed(2)}` : 'Loading...'}
          icon={Activity}
          trend={business && business.lawcore_adoption_rate >= 50 ? 'up' : undefined}
          loading={loadingBusiness}
        />
        <StatsCard
          title="Knowledge Graph"
          value={totalProducts.toLocaleString()}
          sub="Total standardized products"
          icon={Database}
          loading={loadingProducts}
        />
      </div>

      {/* Quick Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{'\u5feb\u901f\u9023\u7d50'}</h3>
          <p className="text-sm text-muted-foreground">{'\u5e38\u7528\u529f\u80fd\u8207\u9801\u9762'}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", link.color)}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {link.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Traffic Chart (Span 4) */}
        <div className="col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5 border-b border-border">
            <h3 className="font-semibold leading-none tracking-tight">Hourly Traffic</h3>
            <p className="text-sm text-muted-foreground">Request volume over the last 24 hours.</p>
          </div>
          <div className="p-6">
            {loadingBusiness ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : business?.hourly_traffic && business.hourly_traffic.length > 0 ? (
              <div className="flex items-end gap-1 h-32">
                {business.hourly_traffic.map((point, i) => {
                  const max = Math.max(...business.hourly_traffic.map(p => p.requests), 1)
                  const height = (point.requests / max) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-chart-primary/70 hover:bg-chart-primary rounded-t transition-colors"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${point.hour}: ${point.requests} requests`}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                No traffic data available yet
              </div>
            )}
          </div>
        </div>

        {/* Queue Breakdown (Span 3) */}
        <div className="col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5 border-b border-border">
            <h3 className="font-semibold leading-none tracking-tight">Queue Breakdown</h3>
            <p className="text-sm text-muted-foreground">Pending records by status and confidence.</p>
          </div>
          <div className="p-6">
            {loadingReview ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : reviewStats?.queue_stats && reviewStats.queue_stats.length > 0 ? (
              <div className="space-y-3">
                {reviewStats.queue_stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        stat.logic_validation_status === 'FAIL' && 'bg-status-fail',
                        stat.logic_validation_status === 'WARN' && 'bg-status-warn',
                        stat.logic_validation_status === 'PASS' && 'bg-status-pass',
                      )} />
                      <span className="font-medium">{stat.logic_validation_status}</span>
                      <span className="text-muted-foreground">/ {stat.confidence_level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {stat.avg_wait_hours != null ? `${stat.avg_wait_hours.toFixed(1)}h avg` : ''}
                      </span>
                      <span className="font-semibold">{stat.pending_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-2 text-status-pass" />
                All clear — no pending records
              </div>
            )}
          </div>
        </div>
      </div>

      {isAnyLoading && (
        <div className="text-xs text-muted-foreground">
          Auto-refreshing every 30-60 seconds
        </div>
      )}
    </div>
  )
}

function StatsCard({ title, value, sub, icon: Icon, alert, trend, loading }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6", alert && "border-status-fail/30 bg-red-50 dark:bg-red-950/20")}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={cn("h-4 w-4 text-muted-foreground", alert && "text-status-fail", trend === 'up' && "text-status-pass")} />
      </div>
      <div className="mt-2">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-status-pass" />}
              {sub}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
