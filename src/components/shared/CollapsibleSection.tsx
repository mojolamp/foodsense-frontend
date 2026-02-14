'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  defaultOpen?: boolean
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'success'
  children: React.ReactNode
  className?: string
}

export default function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  badge,
  badgeVariant = 'secondary',
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border border-border rounded-lg', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold">{title}</span>
          {badge != null && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}
