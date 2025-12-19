'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  History,
  Star,
  Package,
  BookOpen,
  Settings,
  BarChart2,
  Boxes,
  LogOut,
  ScanLine,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    title: 'Platform',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Dictionary', href: '/dictionary', icon: BookOpen },
      { name: 'Clustering', href: '/clustering', icon: Boxes },
    ]
  },
  {
    title: 'Review Workbench',
    items: [
      { name: 'Review Queue', href: '/review/queue', icon: ClipboardList },
      { name: 'Analytics', href: '/review/analytics', icon: BarChart2 },
      { name: 'History', href: '/review/history', icon: History },
      { name: 'Gold Samples', href: '/gold-samples', icon: Star },
    ]
  },
  {
    title: 'System & Analytics',
    items: [
      { name: 'Rules Engine', href: '/rules', icon: Settings },
      { name: 'Data Quality', href: '/data-quality', icon: Activity },
    ]
  }
]

interface SidebarProps {
  user: {
    email?: string
  }
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ user, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  // Define the content to reuse it
  const SidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4 h-full border-r border-border">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-md">
            <ScanLine className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">FoodSense <span className="text-muted-foreground font-normal">Console</span></h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose} // Close sidebar on mobile nav click
                      className={cn(
                        "group flex items-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border pt-4 mt-auto">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-background"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="relative z-50 lg:hidden user-select-none">
          <div className="fixed inset-0 bg-black/80" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-[280px]">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
