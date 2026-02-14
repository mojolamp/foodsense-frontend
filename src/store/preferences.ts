import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TableDensity = 'compact' | 'default' | 'spacious'

interface PreferencesStore {
  tableDensity: TableDensity
  setTableDensity: (density: TableDensity) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      tableDensity: 'default',
      setTableDensity: (density) => set({ tableDensity: density }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: 'foodsense-preferences' }
  )
)
