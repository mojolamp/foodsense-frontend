'use client'

import React from 'react'
import Link from 'next/link'
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
import type { LucideIcon } from 'lucide-react'

// StatsCard Props 類型定義
interface StatsCardProps {
  title: string
  value: string | number
  sub: string
  icon: LucideIcon
  alert?: boolean
  trend?: 'up' | 'down'
}

// Mock Stats Data
const mockStats = {
  velocity: 1280, // RPM
  inQueue: 45,
  completedToday: 342,
  accuracy: 94.2, // %
  dbSize: 15420,
}

// Mock Activity Data
const recentActivity = [
  { id: 1, type: 'review', message: 'Product "Oat Milk" verified', time: '2 mins ago', icon: CheckCircle, color: 'text-green-500' },
  { id: 2, type: 'alert', message: 'Low confidence batch detected (Batch #204)', time: '15 mins ago', icon: AlertCircle, color: 'text-amber-500' },
  { id: 3, type: 'system', message: 'ETL Pipeline completed for "Asian Snacks"', time: '1 hour ago', icon: Database, color: 'text-blue-500' },
]

// Quick Links Data
interface QuickLink {
  title: string
  description: string
  href: string
  icon: LucideIcon
  color: string
  badge?: string
}

const quickLinks: QuickLink[] = [
  {
    title: '審核佇列',
    description: '待審核記錄',
    href: '/review/queue',
    icon: ClipboardCheck,
    color: 'text-blue-600 bg-blue-100',
    badge: String(mockStats.inQueue)
  },
  {
    title: '產品列表',
    description: '已標準化產品',
    href: '/products',
    icon: Package,
    color: 'text-green-600 bg-green-100'
  },
  {
    title: '監控儀表板',
    description: '系統健康狀態',
    href: '/monitoring/business',
    icon: LineChart,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    title: '資料品質',
    description: '品質分析與趨勢',
    href: '/data-quality',
    icon: BarChart3,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    title: 'LawCore 規則',
    description: '法規驗證引擎',
    href: '/lawcore',
    icon: Shield,
    color: 'text-red-600 bg-red-100'
  },
  {
    title: '字典管理',
    description: '標準化參考資料',
    href: '/dictionary',
    icon: BookOpen,
    color: 'text-indigo-600 bg-indigo-100'
  }
]

export default function DashboardPage() {
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
          value={`${mockStats.velocity} RPM`}
          sub="Real-time OCR throughput"
          icon={Zap}
        />
        <StatsCard
          title="Review Queue"
          value={mockStats.inQueue}
          sub={`${mockStats.completedToday} completed today`}
          icon={Clock}
          alert={mockStats.inQueue > 50}
        />
        <StatsCard
          title="Auto-Validation"
          value={`${mockStats.accuracy}%`}
          sub="+2.1% from last week"
          icon={Activity}
          trend="up"
        />
        <StatsCard
          title="Knowledge Graph"
          value={mockStats.dbSize.toLocaleString()}
          sub="Total standardized products"
          icon={Database}
        />
      </div>

      {/* Quick Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">快速連結</h3>
          <p className="text-sm text-muted-foreground">常用功能與頁面</p>
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

        {/* Activity Stream (Span 4) */}
        <div className="col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5 border-b border-border">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest system events and reviews.</p>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className={cn("flex items-center justify-center w-9 h-9 rounded-full bg-accent mr-4", item.color.replace('text-', 'bg-').replace('500', '100'))}>
                    <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.message}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions / System Health (Span 3) */}
        <div className="col-span-3 space-y-4">
          {/* Placeholder for future Charts or System Health Widget */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm h-full flex items-center justify-center p-6 text-muted-foreground text-sm border-dashed">
            Health Status Chart (Coming Soon)
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, sub, icon: Icon, alert, trend }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6", alert && "border-red-200 bg-red-50 dark:bg-red-950/20")}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={cn("h-4 w-4 text-muted-foreground", alert && "text-red-500", trend === 'up' && "text-green-500")} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
          {sub}
        </p>
      </div>
    </div>
  )
}
