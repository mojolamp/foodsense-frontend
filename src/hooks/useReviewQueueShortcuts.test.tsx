import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { useReviewQueueShortcuts } from './useReviewQueueShortcuts'

function Harness(props: {
  enabled: boolean
  openReviewModal?: () => void
  toggleSelectActive?: () => void
  toggleSelectAll?: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useReviewQueueShortcuts({
    enabled: props.enabled,
    count: 3,
    activeIndex,
    setActiveIndex,
    openReviewModal: props.openReviewModal ?? (() => {}),
    toggleSelectActive: props.toggleSelectActive ?? (() => {}),
    toggleSelectAll: props.toggleSelectAll ?? (() => {}),
  })

  return (
    <div>
      <div data-testid="activeIndex">{activeIndex}</div>
      <input aria-label="notes" />
    </div>
  )
}

describe('useReviewQueueShortcuts', () => {
  it('n/p 應該移動 activeIndex（enabled=true）', () => {
    render(<Harness enabled={true} />)

    expect(screen.getByTestId('activeIndex')).toHaveTextContent('0')

    fireEvent.keyDown(document, { key: 'n', code: 'KeyN', keyCode: 78, which: 78 })
    expect(screen.getByTestId('activeIndex')).toHaveTextContent('1')

    fireEvent.keyDown(document, { key: 'p', code: 'KeyP', keyCode: 80, which: 80 })
    expect(screen.getByTestId('activeIndex')).toHaveTextContent('0')
  })

  it('enabled=false 時不應觸發', () => {
    render(<Harness enabled={false} />)

    fireEvent.keyDown(document, { key: 'n', code: 'KeyN', keyCode: 78, which: 78 })
    expect(screen.getByTestId('activeIndex')).toHaveTextContent('0')
  })

  it('焦點在 input 時應忽略列表快捷鍵', () => {
    render(<Harness enabled={true} />)

    const input = screen.getByLabelText('notes')
    input.focus()

    fireEvent.keyDown(document, { key: 'n', code: 'KeyN', keyCode: 78, which: 78 })
    expect(screen.getByTestId('activeIndex')).toHaveTextContent('0')
  })

  it('r/x/a 應觸發對應 callback（enabled=true 且不在 input focus）', () => {
    const openReviewModal = vi.fn()
    const toggleSelectActive = vi.fn()
    const toggleSelectAll = vi.fn()

    render(
      <Harness
        enabled={true}
        openReviewModal={openReviewModal}
        toggleSelectActive={toggleSelectActive}
        toggleSelectAll={toggleSelectAll}
      />
    )

    fireEvent.keyDown(document, { key: 'r', code: 'KeyR', keyCode: 82, which: 82 })
    fireEvent.keyDown(document, { key: 'x', code: 'KeyX', keyCode: 88, which: 88 })
    fireEvent.keyDown(document, { key: 'a', code: 'KeyA', keyCode: 65, which: 65 })

    expect(openReviewModal).toHaveBeenCalledTimes(1)
    expect(toggleSelectActive).toHaveBeenCalledTimes(1)
    expect(toggleSelectAll).toHaveBeenCalledTimes(1)
  })
})


