'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

interface HeaderProps {
  user: {
    email?: string
  }
  onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden -ml-2 p-2 text-muted-foreground hover:bg-accent rounded-md"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>

            {/* Optional: Breadcrumbs or Page Title could go here */}
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              {/* Placeholder for future breadcrumbs */}
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            {/* Can add Notification bell here later */}
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <div className="px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-accent-foreground">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
