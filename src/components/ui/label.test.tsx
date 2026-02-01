/**
 * Label Component Tests
 *
 * @module components/ui/label.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('should render with default styles', () => {
    render(<Label data-testid="label">Label Text</Label>)

    const label = screen.getByTestId('label')
    expect(label).toBeDefined()
    expect(label.textContent).toBe('Label Text')
    expect(label.className).toContain('text-sm')
    expect(label.className).toContain('font-medium')
  })

  it('should merge custom className', () => {
    render(
      <Label className="custom-class" data-testid="label">
        Label
      </Label>
    )

    const label = screen.getByTestId('label')
    expect(label.className).toContain('custom-class')
    expect(label.className).toContain('text-sm')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>Label</Label>)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('label')
  })

  it('should have htmlFor attribute when provided', () => {
    render(
      <Label htmlFor="my-input" data-testid="label">
        Input Label
      </Label>
    )

    const label = screen.getByTestId('label')
    expect(label).toHaveProperty('htmlFor', 'my-input')
  })

  it('should have peer-disabled styles', () => {
    render(<Label data-testid="label">Label</Label>)

    const label = screen.getByTestId('label')
    expect(label.className).toContain('peer-disabled:cursor-not-allowed')
    expect(label.className).toContain('peer-disabled:opacity-70')
  })

  it('should render with children', () => {
    render(
      <Label data-testid="label">
        <span>Child content</span>
      </Label>
    )

    expect(screen.getByText('Child content')).toBeDefined()
  })
})
