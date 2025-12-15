'use client'

interface HeaderProps {
  user: {
    email?: string
  }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button can go here */}
          </div>
          <div className="flex items-center gap-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
