'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  dictionary: 'Dictionary',
  clustering: 'Clustering',
  review: 'Review Workbench',
  queue: 'Queue',
  history: 'History',
  analytics: 'Analytics',
  'gold-samples': 'Gold Samples',
  monitoring: 'Monitoring',
  business: 'Business (L1)',
  app: 'Application (L2)',
  infra: 'Infrastructure (L3)',
  lawcore: 'LawCore',
  check: 'Presence Check',
  rules: 'Rules',
  admin: 'Admin',
  'ingestion-gate': 'Ingestion Gate',
  'data-quality': 'Data Quality',
  'data-pipeline': 'Data Pipeline',
  ocr: 'OCR Scanner',
  etl: 'ETL Jobs',
  documents: 'Documents',
  operations: 'Operations',
  crawler: 'Crawler Admin',
  dlq: 'Dead Letter Queue',
  metrics: 'Acquisition Metrics',
  'control-plane': 'Control Plane',
  'knowledge-graph': 'Knowledge Graph',
  benchmark: 'Benchmark',
  settings: 'Settings',
}

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const label = breadcrumbLabels[segments[i]] || segments[i]
    items.push({
      label,
      href: currentPath,
      isCurrent: i === segments.length - 1,
    })
  }

  return items
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const items = buildBreadcrumbs(pathname)

  if (items.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item) => (
        <span key={item.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {item.isCurrent ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
