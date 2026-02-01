/**
 * Textarea Component Tests
 *
 * @module components/ui/textarea.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('should render with default styles', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDefined()
    expect(textarea.className).toContain('flex')
    expect(textarea.className).toContain('rounded-md')
    expect(textarea.className).toContain('border')
  })

  it('should merge custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea.className).toContain('custom-class')
    expect(textarea.className).toContain('rounded-md')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('textarea')
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    fireEvent.change(textarea, { target: { value: 'test content' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should pass through placeholder prop', () => {
    render(<Textarea placeholder="Enter description" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveProperty('placeholder', 'Enter description')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveProperty('disabled', true)
  })

  it('should have disabled styles when disabled', () => {
    render(<Textarea disabled data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea.className).toContain('disabled:cursor-not-allowed')
  })

  it('should pass through rows prop', () => {
    render(<Textarea rows={10} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveProperty('rows', 10)
  })

  it('should have minimum height style', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea.className).toContain('min-h-[80px]')
  })
})
