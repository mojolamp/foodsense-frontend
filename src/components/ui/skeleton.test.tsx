/**
 * Skeleton Component Tests
 *
 * @module components/ui/skeleton.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('should render with default styles', () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeDefined()
    expect(skeleton.className).toContain('animate-pulse')
    expect(skeleton.className).toContain('rounded-md')
    expect(skeleton.className).toContain('bg-muted')
  })

  it('should merge custom className', () => {
    render(<Skeleton className="w-full h-10" data-testid="skeleton" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.className).toContain('w-full')
    expect(skeleton.className).toContain('h-10')
    expect(skeleton.className).toContain('animate-pulse')
  })

  it('should render as div by default', () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.tagName.toLowerCase()).toBe('div')
  })

  it('should pass through other props', () => {
    render(<Skeleton data-testid="skeleton" role="status" aria-label="Loading" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.getAttribute('role')).toBe('status')
    expect(skeleton.getAttribute('aria-label')).toBe('Loading')
  })

  it('should render skeleton for avatar', () => {
    render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />)

    const skeleton = screen.getByTestId('avatar-skeleton')
    expect(skeleton.className).toContain('rounded-full')
    expect(skeleton.className).toContain('h-12')
    expect(skeleton.className).toContain('w-12')
  })

  it('should render skeleton for text line', () => {
    render(<Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />)

    const skeleton = screen.getByTestId('text-skeleton')
    expect(skeleton.className).toContain('h-4')
    expect(skeleton.className).toContain('w-[250px]')
  })
})
