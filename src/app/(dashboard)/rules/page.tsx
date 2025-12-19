'use client'

import { useState } from 'react'
import { useRules } from '@/hooks/useRules'
import RulesTable from '@/components/rules/RulesTable'
import RuleDetailPanel from '@/components/rules/RuleDetailPanel'
import RuleFormModal from '@/components/rules/RuleFormModal'
import type { Rule } from '@/types/rule'

export default function RulesPage() {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'hit_count' | 'created_at'>('hit_count')

  const { data, isLoading } = useRules({
    is_active: filterActive,
    sort_by: sortBy,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">規則管理</h1>
          <p className="mt-2 text-gray-600">
            管理自動校正規則 ({data?.total || 0} 個)
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 建立新規則
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              規則狀態
            </label>
            <select
              value={filterActive === undefined ? 'all' : String(filterActive)}
              onChange={(e) => {
                const value = e.target.value
                setFilterActive(value === 'all' ? undefined : value === 'true')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">全部</option>
              <option value="true">啟用</option>
              <option value="false">停用</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排序方式
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'hit_count' | 'created_at')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="hit_count">命中次數</option>
              <option value="created_at">建立時間</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RulesTable
            rules={data?.rules || []}
            isLoading={isLoading}
            onRuleClick={(rule) => setSelectedRule(rule)}
            selectedRuleId={selectedRule?.rule_id}
          />
        </div>

        <div>
          {selectedRule ? (
            <RuleDetailPanel
              rule={selectedRule}
              onClose={() => setSelectedRule(null)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              選擇左側的規則查看詳情
            </div>
          )}
        </div>
      </div>

      <RuleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}


