'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  StarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navigation = [
  { name: '儀表板', href: '/dashboard', icon: HomeIcon },
  { name: '審核佇列', href: '/review/queue', icon: ClipboardDocumentListIcon },
  { name: '審核歷史', href: '/review/history', icon: ClockIcon },
  { name: '黃金樣本', href: '/gold-samples', icon: StarIcon },
]

interface SidebarProps {
  user: {
    email?: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('已登出')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('登出失敗')
    }
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-2xl font-bold text-blue-600">FoodSense</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6
                          ${isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* User Info & Logout */}
            <li className="mt-auto">
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-x-3 px-3 py-2 text-sm text-gray-700">
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-gray-500">管理員</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-x-3 px-3 py-2 mt-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  登出
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
