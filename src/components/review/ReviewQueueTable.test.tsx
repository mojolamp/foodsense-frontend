import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ReviewQueueTable from './ReviewQueueTable'
import type { OCRRecord, PrioritySortStrategy } from '@/types/review'

function makeRecord(partial: Partial<OCRRecord> & Pick<OCRRecord, 'id'>): OCRRecord {
  return {
    id: partial.id,
    product_id: partial.product_id ?? 1,
    source_type: partial.source_type ?? 'upload',
    confidence_level: partial.confidence_level ?? 'HIGH',
    logic_validation_status: partial.logic_validation_status ?? 'WARN',
    needs_human_review: partial.needs_human_review ?? true,
    review_status: partial.review_status ?? 'PENDING',
    ocr_raw_text: partial.ocr_raw_text ?? 'raw',
    created_at: partial.created_at ?? new Date().toISOString(),
    priority_score: partial.priority_score,
  }
}

describe('ReviewQueueTable', () => {
  it('點擊 row 應通知 onActiveIdChange', () => {
    const data = [makeRecord({ id: 'id-1' }), makeRecord({ id: 'id-2' })]
    const onActiveIdChange = vi.fn()

    render(
      <ReviewQueueTable
        data={data}
        activeId={'id-1'}
        onActiveIdChange={onActiveIdChange}
        selectedIds={new Set()}
        onSelectedIdsChange={vi.fn()}
        sortStrategy={null}
        onSortStrategyChange={vi.fn()}
        onReview={vi.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('review-queue-row-1'))
    expect(onActiveIdChange).toHaveBeenCalledWith('id-2')
  })

  it('x/a 操作所需的選取 UI：點擊 checkbox 與全選按鈕應更新 selectedIds', () => {
    const data = [makeRecord({ id: 'id-1' }), makeRecord({ id: 'id-2' })]
    const onSelectedIdsChange = vi.fn()
    const onActiveIdChange = vi.fn()

    render(
      <ReviewQueueTable
        data={data}
        activeId={'id-1'}
        onActiveIdChange={onActiveIdChange}
        selectedIds={new Set()}
        onSelectedIdsChange={onSelectedIdsChange}
        sortStrategy={null}
        onSortStrategyChange={vi.fn()}
        onReview={vi.fn()}
        onBatchReview={vi.fn()}
      />
    )

    // 點擊第 2 列的選取按鈕
    const row1 = screen.getByTestId('review-queue-row-1')
    const selectBtn = within(row1).getByRole('button', { name: '選擇' })
    fireEvent.click(selectBtn)

    const lastCall1 = onSelectedIdsChange.mock.calls.at(-1)?.[0] as Set<string>
    expect(lastCall1).toBeInstanceOf(Set)
    expect(Array.from(lastCall1)).toContain('id-2')
    expect(onActiveIdChange).toHaveBeenCalledWith('id-2')

    // 全選
    fireEvent.click(screen.getByRole('button', { name: '全選' }))
    const lastCall2 = onSelectedIdsChange.mock.calls.at(-1)?.[0] as Set<string>
    expect(Array.from(lastCall2)).toEqual(expect.arrayContaining(['id-1', 'id-2']))
  })

  it('變更排序策略應觸發 onSortStrategyChange（由頁層負責實際排序）', () => {
    const data = [makeRecord({ id: 'id-1', priority_score: 50 })]
    const onSortStrategyChange = vi.fn()

    render(
      <ReviewQueueTable
        data={data}
        activeId={'id-1'}
        onActiveIdChange={vi.fn()}
        selectedIds={new Set()}
        onSelectedIdsChange={vi.fn()}
        sortStrategy={null}
        onSortStrategyChange={onSortStrategyChange}
        onReview={vi.fn()}
      />
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'urgent_first' satisfies PrioritySortStrategy } })
    expect(onSortStrategyChange).toHaveBeenCalledWith('urgent_first')
  })
})







