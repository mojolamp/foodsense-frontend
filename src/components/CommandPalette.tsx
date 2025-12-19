'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, FileText, CheckSquare, Star, Package, BookOpen, AlertCircle, BarChart3, Clock, Loader2, Box } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCommandSearch, useSearchHistory } from '@/hooks/useCommandSearch'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { results, isSearching } = useCommandSearch(search)
  const { history, addToHistory, clearHistory } = useSearchHistory()

  const handleSelect = useCallback((callback: () => void, query?: string) => {
    if (query) {
      addToHistory(query)
    }
    onOpenChange(false)
    callback()
  }, [onOpenChange, addToHistory])

  // 關閉時清空搜尋
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  // 導航命令
  const navigationCommands = [
    {
      icon: BarChart3,
      label: '前往儀表板',
      shortcut: 'g d',
      action: () => router.push('/dashboard')
    },
    {
      icon: CheckSquare,
      label: '前往審核佇列',
      shortcut: 'g q',
      action: () => router.push('/review/queue')
    },
    {
      icon: BarChart3,
      label: '前往審核分析',
      shortcut: 'g a',
      action: () => router.push('/review/analytics')
    },
    {
      icon: FileText,
      label: '前往審核歷史',
      shortcut: 'g h',
      action: () => router.push('/review/history')
    },
    {
      icon: Star,
      label: '前往黃金樣本',
      shortcut: 'g g',
      action: () => router.push('/gold-samples')
    },
    {
      icon: Package,
      label: '前往產品總覽',
      shortcut: 'g p',
      action: () => router.push('/products')
    },
    {
      icon: BookOpen,
      label: '前往成分字典',
      shortcut: 'g d',
      action: () => router.push('/dictionary')
    },
    {
      icon: AlertCircle,
      label: '前往資料品質',
      shortcut: 'g x',
      action: () => router.push('/data-quality')
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <Command className="rounded-lg border-0 shadow-none">
          <div className="flex items-center border-b px-3">
            <Search className="w-4 h-4 mr-2 opacity-50" />
            <Command.Input
              placeholder="搜尋功能或執行命令..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>搜尋中...</span>
                </div>
              ) : (
                <span>未找到相關結果</span>
              )}
            </Command.Empty>

            {/* 搜尋結果 - 產品 */}
            {results.filter(r => r.type === 'product').length > 0 && (
              <>
                <Command.Group heading="產品搜尋結果" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  {results.filter(r => r.type === 'product').map((result) => (
                    <Command.Item
                      key={result.id}
                      value={`product-${result.id}`}
                      onSelect={() => handleSelect(result.action, search)}
                      className="flex items-start justify-between px-2 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{result.metadata}</div>
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="h-px bg-border my-1" />
              </>
            )}

            {/* 搜尋結果 - OCR 記錄 */}
            {results.filter(r => r.type === 'record').length > 0 && (
              <>
                <Command.Group heading="OCR 記錄搜尋結果" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  {results.filter(r => r.type === 'record').map((result) => (
                    <Command.Item
                      key={result.id}
                      value={`record-${result.id}`}
                      onSelect={() => handleSelect(result.action, search)}
                      className="flex items-start justify-between px-2 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{result.metadata}</div>
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="h-px bg-border my-1" />
              </>
            )}

            {/* 搜尋歷史 */}
            {!search && history.length > 0 && (
              <>
                <Command.Group heading="最近搜尋" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  {history.map((item, idx) => (
                    <Command.Item
                      key={idx}
                      value={`history-${item}`}
                      onSelect={() => setSearch(item)}
                      className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{item}</span>
                      </div>
                    </Command.Item>
                  ))}
                  <Command.Item
                    value="clear-history"
                    onSelect={clearHistory}
                    className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-red-100 aria-selected:bg-red-100 text-red-600"
                  >
                    <span className="text-xs">清除搜尋歷史</span>
                  </Command.Item>
                </Command.Group>
                <Command.Separator className="h-px bg-border my-1" />
              </>
            )}

            {/* 導航命令 - 只在沒有搜尋結果時顯示 */}
            {results.length === 0 && (
              <>
                <Command.Group heading="導航" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  {navigationCommands.map((cmd) => (
                    <Command.Item
                      key={cmd.label}
                      value={cmd.label}
                      onSelect={() => handleSelect(cmd.action)}
                      className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <cmd.icon className="w-4 h-4" />
                        <span>{cmd.label}</span>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="h-px bg-border my-1" />

                <Command.Group heading="快速操作" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <Command.Item
                    value="reload"
                    onSelect={() => handleSelect(() => window.location.reload())}
                    className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span>重新載入頁面</span>
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      Ctrl R
                    </kbd>
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                提示: 使用 <kbd className="px-1 py-0.5 bg-muted rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-muted rounded">↓</kbd> 導航, <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> 選擇, <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> 關閉
              </span>
              {!search && (
                <span className="text-[10px]">
                  搜尋產品名稱、條碼、ID 或 OCR 記錄
                </span>
              )}
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
