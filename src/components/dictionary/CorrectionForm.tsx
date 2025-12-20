'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dictionaryAPI } from '@/lib/api/endpoints/dictionary'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/types/api'

interface Props {
  token: string
}

export default function CorrectionForm({ token }: Props) {
  const [standardName, setStandardName] = useState('')
  const [createRule, setCreateRule] = useState(true)
  const queryClient = useQueryClient()

  const { mutate: createCorrection, isPending } = useMutation({
    mutationFn: dictionaryAPI.createCorrection,
    onSuccess: () => {
      toast.success('校正規則已建立!')
      queryClient.invalidateQueries({ queryKey: ['tokenRankings'] })
      queryClient.invalidateQueries({ queryKey: ['tokenDetail', token] })
      setStandardName('')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '建立失敗')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!standardName.trim()) {
      toast.error('請輸入標準名稱')
      return
    }

    createCorrection({
      token,
      standard_name: standardName,
      create_rule: createRule,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          標準名稱
        </label>
        <input
          type="text"
          value={standardName}
          onChange={(e) => setStandardName(e.target.value)}
          placeholder={`將 "${token}" 修正為...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={createRule}
          onChange={(e) => setCreateRule(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">
          建立規則,未來自動套用
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          ⚠️ 此操作將影響所有包含 "{token}" 的產品
          {createRule && ',且會建立自動校正規則'}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '處理中...' : '批次校正'}
      </button>
    </form>
  )
}


