'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Keyboard } from 'lucide-react'
import { isFeatureEnabled } from '@/lib/featureFlags'

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    keys: string[]
    description: string
    enhanced?: boolean // Only show if enhanced hotkeys enabled
  }>
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: '導航',
    shortcuts: [
      { keys: ['j', '或', 'n'], description: '下一筆記錄' },
      { keys: ['k', '或', 'p'], description: '上一筆記錄' },
      { keys: ['r'], description: '開啟審核視窗' },
    ],
  },
  {
    title: '選取',
    shortcuts: [
      { keys: ['x'], description: '切換選取目前記錄' },
      { keys: ['a'], description: '全選/取消全選' },
    ],
  },
  {
    title: '審核動作',
    shortcuts: [
      { keys: ['Shift', '+', 'A'], description: '快速批准', enhanced: true },
      { keys: ['Shift', '+', 'R'], description: '快速拒絕', enhanced: true },
      { keys: ['i'], description: '檢查產品詳情', enhanced: true },
      { keys: ['f'], description: '標記為需人工審核', enhanced: true },
    ],
  },
  {
    title: '全域',
    shortcuts: [
      { keys: ['g', 'd'], description: '前往 Dashboard' },
      { keys: ['g', 'q'], description: '前往審核佇列' },
      { keys: ['g', 'p'], description: '前往產品列表' },
      { keys: ['?'], description: '顯示快捷鍵說明 (本視窗)' },
    ],
  },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const enhancedHotkeysEnabled = isFeatureEnabled('review_queue_enhanced_hotkeys')

  // Filter shortcuts based on feature flag
  const filteredGroups = SHORTCUT_GROUPS.map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(shortcut =>
      !shortcut.enhanced || enhancedHotkeysEnabled
    ),
  })).filter(group => group.shortcuts.length > 0)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Keyboard className="w-6 h-6 text-primary" />
                    </div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                      鍵盤快捷鍵
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="關閉"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Enhanced Mode Badge */}
                {enhancedHotkeysEnabled && (
                  <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2">
                    <p className="text-sm text-green-800 font-medium">
                      ✨ 增強模式已啟用 - 包含 J/K 導航與快速審核動作
                    </p>
                  </div>
                )}

                {/* Shortcut Groups */}
                <div className="space-y-6">
                  {filteredGroups.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {group.title}
                      </h4>
                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm text-gray-700">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIdx) => (
                                <Fragment key={keyIdx}>
                                  {key === '+' || key === '或' ? (
                                    <span className="text-xs text-gray-400 mx-1">{key}</span>
                                  ) : (
                                    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 text-xs font-mono font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
                                      {key}
                                    </kbd>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    💡 提示：快捷鍵在輸入框內會自動停用。按 <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Esc</kbd> 可離開輸入框並重新啟用快捷鍵。
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
