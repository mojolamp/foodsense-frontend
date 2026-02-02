/**
 * TierBadge Component Tests
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TierBadge from '@/components/products/TierBadge'

describe('TierBadge', () => {
  it('應該顯示 Tier A', () => {
    render(<TierBadge tier="A" />)
    expect(screen.getByText('Tier A')).toBeInTheDocument()
  })

  it('應該顯示 Tier B', () => {
    render(<TierBadge tier="B" />)
    expect(screen.getByText('Tier B')).toBeInTheDocument()
  })

  it('應該顯示 Tier C', () => {
    render(<TierBadge tier="C" />)
    expect(screen.getByText('Tier C')).toBeInTheDocument()
  })

  it('Tier A 應該使用綠色樣式', () => {
    render(<TierBadge tier="A" />)
    const badge = screen.getByText('Tier A')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('Tier B 應該使用黃色樣式', () => {
    render(<TierBadge tier="B" />)
    const badge = screen.getByText('Tier B')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('Tier C 應該使用紅色樣式', () => {
    render(<TierBadge tier="C" />)
    const badge = screen.getByText('Tier C')
    expect(badge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('應該有基本的 badge 樣式', () => {
    render(<TierBadge tier="A" />)
    const badge = screen.getByText('Tier A')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-1', 'rounded-full', 'text-xs', 'font-medium')
  })
})
