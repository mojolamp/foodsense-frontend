'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useCreateRule } from '@/hooks/useRules'
import type { RuleCreate } from '@/types/rule'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function RuleFormModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, reset } = useForm<RuleCreate>({
    defaultValues: {
      rule_type: 'exact',
      target_field: 'ingredient_token',
    },
  })
  const { mutate: createRule, isPending } = useCreateRule()

  const onSubmit = (data: RuleCreate) => {
    createRule(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                建立新規則
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">✕</Dialog.Close>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern (原始)
                </label>
                <input
                  {...register('pattern', { required: true })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ex: Sodium Benzoate"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replacement (目標)
                </label>
                <input
                  {...register('replacement', { required: true })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ex: 苯甲酸鈉"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    規則類型
                  </label>
                  <select
                    {...register('rule_type', { required: true })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="exact">exact</option>
                    <option value="regex">regex</option>
                    <option value="fuzzy">fuzzy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    目標欄位
                  </label>
                  <select
                    {...register('target_field', { required: true })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="ingredient_token">ingredient_token</option>
                    <option value="product_name">product_name</option>
                    <option value="brand">brand</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述 (可選)
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? '建立中...' : '建立'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}





