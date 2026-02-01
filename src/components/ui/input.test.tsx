/**
 * Input Component Tests
 *
 * @module components/ui/input.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('should render with default styles', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeDefined()
    expect(input.className).toContain('flex')
    expect(input.className).toContain('rounded-md')
    expect(input.className).toContain('border')
  })

  it('should merge custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input.className).toContain('custom-class')
    expect(input.className).toContain('rounded-md')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('input')
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)

    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'test value' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should pass through type prop', () => {
    render(<Input type="password" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveProperty('type', 'password')
  })

  it('should pass through placeholder prop', () => {
    render(<Input placeholder="Enter text" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveProperty('placeholder', 'Enter text')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveProperty('disabled', true)
  })

  it('should have disabled styles when disabled', () => {
    render(<Input disabled data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input.className).toContain('disabled:cursor-not-allowed')
  })

  it('should handle file type', () => {
    render(<Input type="file" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveProperty('type', 'file')
    expect(input.className).toContain('file:border-0')
  })
})
