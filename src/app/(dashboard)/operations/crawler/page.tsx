'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Code, Globe, Wrench } from 'lucide-react'
import { useRepairStats, useRepairs, useApproveRepair, useRejectRepair } from '@/hooks/useCrawlerAdmin'
import type { DOMRepairItem } from '@/types/crawlerAdmin'
import CrawlerStatusStrip from '@/components/crawler/CrawlerStatusStrip'
import CrawlControlPanel from '@/components/crawler/CrawlControlPanel'

type TabType = 'control' | 'repairs'

export default function CrawlerAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('control')
  const { data: statsData, isLoading: statsLoading } = useRepairStats()
  const { data: repairsData, isLoading: repairsLoading } = useRepairs()
  const approveRepair = useApproveRepair()
  const rejectRepair = useRejectRepair()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const stats = statsData?.stats
  const repairs = repairsData?.repairs || []

  const handleReject = (repairId: string) => {
    if (!rejectReason.trim()) return
    rejectRepair.mutate({ repairId, reason: rejectReason })
    setRejectReason('')
    setExpandedId(null)
  }

  const tabs: { key: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'control', label: 'Crawl Control', icon: Globe },
    { key: 'repairs', label: 'DOM Repairs', icon: Wrench, badge: stats?.pending },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crawler Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Full crawler control, DOM repair management, and quality assessment.
        </p>
      </div>

      {/* Status Strip */}
      <CrawlerStatusStrip />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <Badge variant="secondary" className="text-xs ml-1">{tab.badge}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Crawl Control Tab */}
      {activeTab === 'control' && <CrawlControlPanel />}

      {/* DOM Repairs Tab */}
      {activeTab === 'repairs' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: stats?.pending, color: 'text-orange-600' },
              { label: 'Approved', value: stats?.approved, color: 'text-green-600' },
              { label: 'Rejected', value: stats?.rejected, color: 'text-red-600' },
              { label: 'Avg Confidence', value: stats?.avg_confidence != null ? `${(stats.avg_confidence * 100).toFixed(0)}%` : '—', color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="p-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>
                  {statsLoading ? <div className="h-7 w-12 bg-muted rounded animate-pulse" /> : (value ?? 0)}
                </div>
              </Card>
            ))}
          </div>

          {/* Repairs List */}
          <Card>
            <div className="divide-y divide-border">
              {repairsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="h-5 bg-muted rounded animate-pulse mb-2 w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                ))
              ) : repairs.length === 0 ? (
                <div className="p-12 text-center">
                  <Code className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <div className="text-lg font-medium text-muted-foreground mb-1">No Pending Repairs</div>
                  <div className="text-sm text-muted-foreground/70">All DOM repairs have been reviewed.</div>
                </div>
              ) : (
                repairs.map((repair: DOMRepairItem) => {
                  const isExpanded = expandedId === repair.id
                  return (
                    <div key={repair.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : repair.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-medium">{repair.site_name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{repair.selector_path}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${repair.confidence * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{(repair.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <Badge variant={repair.status === 'pending' ? 'secondary' : repair.status === 'approved' ? 'success' : 'destructive'}>{repair.status}</Badge>
                          {repair.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => approveRepair.mutate(repair.id)} disabled={approveRepair.isPending}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setExpandedId(repair.id)}>
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 ml-6 space-y-3">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Suggested Fix</div>
                            <pre className="p-3 bg-muted/50 rounded-md text-xs font-mono overflow-x-auto">{repair.suggested_fix}</pre>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">Failure Signature</div>
                              <div className="font-mono text-xs">{repair.failure_signature}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Last Working</div>
                              <div className="text-xs">{new Date(repair.last_working).toLocaleString()}</div>
                            </div>
                          </div>
                          {repair.status === 'pending' && (
                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                              <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason..." className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm" />
                              <Button size="sm" variant="destructive" onClick={() => handleReject(repair.id)} disabled={!rejectReason.trim() || rejectRepair.isPending}>Reject</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
