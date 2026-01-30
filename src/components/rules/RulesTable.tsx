'use client'

import { Rule } from '@/types/rule'
import { useToggleRule, useDeleteRule } from '@/hooks/useRules'

interface Props {
  rules: Rule[]
  isLoading: boolean
  onRuleClick: (rule: Rule) => void
  selectedRuleId?: string
}

export default function RulesTable({
  rules,
  isLoading,
  onRuleClick,
  selectedRuleId,
}: Props) {
  const { mutate: toggleRule } = useToggleRule()
  const { mutate: deleteRule } = useDeleteRule()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">載入中...</p>
      </div>
    )
  }

  if (rules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">沒有找到規則</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          規則列表 ({rules.length} 個)
        </h2>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {rules.map((rule) => (
          <div
            key={rule.rule_id}
            className={`
              p-4 hover:bg-gray-50 cursor-pointer transition-colors
              ${selectedRuleId === rule.rule_id ? 'bg-blue-50' : ''}
            `}
            onClick={() => onRuleClick(rule)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-gray-900">
                    {rule.pattern}
                  </p>
                  <span className="text-gray-400">→</span>
                  <p className="font-medium text-blue-600">
                    {rule.replacement}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {rule.rule_type}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {rule.target_field}
                  </span>
                  <span>命中 {rule.hit_count} 次</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRule(rule.rule_id)
                  }}
                  className={`
                    px-3 py-1 rounded text-sm font-medium
                    ${rule.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {rule.is_active ? '啟用' : '停用'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('確定要刪除此規則?')) {
                      deleteRule(rule.rule_id)
                    }
                  }}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





