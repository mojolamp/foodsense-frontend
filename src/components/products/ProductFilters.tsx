'use client'

import { ProductFilters as Filters } from '@/types/product'

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

export default function ProductFilters({ filters, onFiltersChange }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            搜尋
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="產品名稱 / 品牌 / 條碼"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tier
          </label>
          <select
            value={filters.tier || ''}
            onChange={(e) => onFiltersChange({ ...filters, tier: e.target.value as Filters['tier'] || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            是否 Golden
          </label>
          <select
            value={filters.is_golden === undefined ? '' : String(filters.is_golden)}
            onChange={(e) => {
              const val = e.target.value
              onFiltersChange({
                ...filters,
                is_golden: val === '' ? undefined : val === 'true',
              })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            素食類型
          </label>
          <input
            type="text"
            value={filters.vegan_type || ''}
            onChange={(e) => onFiltersChange({ ...filters, vegan_type: e.target.value || undefined })}
            placeholder="vegan / vegetarian..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}


