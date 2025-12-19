'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { rulesAPI } from '@/lib/api/endpoints/rules'
import { Rule } from '@/types/rule'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface Props {
  rule: Rule
  onClose: () => void
}

export default function RuleDetailPanel({ rule, onClose }: Props) {
  const [testInput, setTestInput] = useState('')

  const { mutate: testRule, data: testResult, isPending } = useMutation({
    mutationFn: (input: string) =>
      rulesAPI.testRule({ rule_id: rule.rule_id, test_input: input }),
  })

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (testInput.trim()) {
      testRule(testInput)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-blue-600 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">規則詳情</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">基本資訊</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Pattern (原始)</dt>
              <dd className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">
                {rule.pattern}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Replacement (目標)</dt>
              <dd className="mt-1 text-sm font-mono bg-blue-50 p-2 rounded text-blue-900">
                {rule.replacement}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">規則類型</dt>
                <dd className="mt-1">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {rule.rule_type}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">目標欄位</dt>
                <dd className="mt-1">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {rule.target_field}
                  </span>
                </dd>
              </div>
            </div>
            {rule.description && (
              <div>
                <dt className="text-sm text-gray-500">描述</dt>
                <dd className="mt-1 text-sm text-gray-900">{rule.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">統計資訊</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">命中次數</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {rule.hit_count}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">狀態</p>
              <p className="mt-1">
                <span className={`
                  inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium
                  ${rule.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {rule.is_active ? '啟用中' : '已停用'}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">建立時間:</span>{' '}
              {formatDistanceToNow(new Date(rule.created_at), {
                addSuffix: true,
                locale: zhTW,
              })}
            </div>
            {rule.last_hit_at && (
              <div>
                <span className="text-gray-500">最近命中:</span>{' '}
                {formatDistanceToNow(new Date(rule.last_hit_at), {
                  addSuffix: true,
                  locale: zhTW,
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">規則測試</h3>
          <form onSubmit={handleTest} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                測試輸入
              </label>
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="輸入要測試的文字..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !testInput.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? '測試中...' : '執行測試'}
            </button>
          </form>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className={`
                  px-2 py-1 rounded text-sm font-medium
                  ${testResult.matched
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {testResult.matched ? '✓ 匹配' : '× 未匹配'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">原始:</span>{' '}
                  <span className="font-mono">{testResult.original}</span>
                </div>
                {testResult.matched && (
                  <div>
                    <span className="text-gray-500">轉換:</span>{' '}
                    <span className="font-mono text-blue-600">{testResult.transformed}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">說明:</span>{' '}
                  {testResult.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


