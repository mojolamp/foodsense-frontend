'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CommandPalette from '@/components/CommandPalette'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import type { User } from '@supabase/supabase-js'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // 使用 useMemo 確保 supabase client 不會在每次渲染時重新創建
  const supabase = useMemo(() => createClient(), [])

  // 全域快捷鍵
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useGlobalShortcuts()

  // 使用 useCallback 避免不必要的重新渲染
  const fetchUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Failed to fetch user:', error.message)
        router.push('/login')
        return
      }
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-muted-foreground">載入中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar
        user={user}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-72">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />
    </div>
  )
}
