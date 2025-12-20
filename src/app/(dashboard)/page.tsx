'use client'

import React from 'react'
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Zap,
  TrendingUp
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
