/**
 * Badge Component Tests
 *
 * @module components/ui/badge.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Test Badge</Badge>)

    const badge = screen.getByText('Test Badge')
    expect(badge).toBeDefined()
    expect(badge.className).toContain('bg-primary')
  })

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)

    const badge = screen.getByText('Secondary')
    expect(badge.className).toContain('bg-secondary')
  })

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>)

    const badge = screen.getByText('Destructive')
    expect(badge.className).toContain('bg-destructive')
  })

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)

    const badge = screen.getByText('Outline')
    expect(badge.className).toContain('text-foreground')
  })

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>)

    const badge = screen.getByText('Success')
    expect(badge.className).toContain('bg-green-100')
  })

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)

    const badge = screen.getByText('Warning')
    expect(badge.className).toContain('bg-yellow-100')
  })

  it('should render with failure variant', () => {
    render(<Badge variant="failure">Failure</Badge>)

    const badge = screen.getByText('Failure')
    expect(badge.className).toContain('bg-red-100')
  })

  it('should merge custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)

    const badge = screen.getByText('Custom')
    expect(badge.className).toContain('custom-class')
  })

  it('should pass through other props', () => {
    render(<Badge data-testid="test-badge">Props</Badge>)

    const badge = screen.getByTestId('test-badge')
    expect(badge).toBeDefined()
  })
})

describe('badgeVariants', () => {
  it('should generate default class string', () => {
    const classes = badgeVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('rounded-md')
  })

  it('should generate variant-specific class string', () => {
    const successClasses = badgeVariants({ variant: 'success' })
    expect(successClasses).toContain('bg-green-100')

    const warningClasses = badgeVariants({ variant: 'warning' })
    expect(warningClasses).toContain('bg-yellow-100')
  })
})
