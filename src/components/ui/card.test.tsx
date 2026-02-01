/**
 * Card Component Tests
 *
 * @module components/ui/card.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from './card'

describe('Card', () => {
  it('should render with default styles', () => {
    render(<Card data-testid="card">Card content</Card>)

    const card = screen.getByTestId('card')
    expect(card).toBeDefined()
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('border')
    expect(card.className).toContain('bg-card')
  })

  it('should merge custom className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    )

    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
    expect(card.className).toContain('rounded-xl')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref}>Card</Card>)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('div')
  })

  it('should pass through other props', () => {
    render(
      <Card data-testid="test-card" role="region">
        Card
      </Card>
    )

    const card = screen.getByTestId('test-card')
    expect(card.getAttribute('role')).toBe('region')
  })
})

describe('CardHeader', () => {
  it('should render with default styles', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>)

    const header = screen.getByTestId('header')
    expect(header.className).toContain('flex')
    expect(header.className).toContain('flex-col')
    expect(header.className).toContain('p-6')
  })

  it('should merge custom className', () => {
    render(
      <CardHeader className="custom-header" data-testid="header">
        Header
      </CardHeader>
    )

    const header = screen.getByTestId('header')
    expect(header.className).toContain('custom-header')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardHeader ref={ref}>Header</CardHeader>)

    expect(ref.current).not.toBeNull()
  })
})

describe('CardTitle', () => {
  it('should render as h3 with default styles', () => {
    render(<CardTitle>Title</CardTitle>)

    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toBeDefined()
    expect(title.className).toContain('font-semibold')
    expect(title.className).toContain('leading-none')
  })

  it('should merge custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>)

    const title = screen.getByRole('heading', { level: 3 })
    expect(title.className).toContain('custom-title')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLHeadingElement | null }
    render(<CardTitle ref={ref}>Title</CardTitle>)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('h3')
  })
})

describe('CardContent', () => {
  it('should render with default styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>)

    const content = screen.getByTestId('content')
    expect(content.className).toContain('p-6')
    expect(content.className).toContain('pt-0')
  })

  it('should merge custom className', () => {
    render(
      <CardContent className="custom-content" data-testid="content">
        Content
      </CardContent>
    )

    const content = screen.getByTestId('content')
    expect(content.className).toContain('custom-content')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardContent ref={ref}>Content</CardContent>)

    expect(ref.current).not.toBeNull()
  })
})

describe('Card composition', () => {
  it('should render full card composition correctly', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card body content</CardContent>
      </Card>
    )

    expect(screen.getByTestId('full-card')).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'Card Title' })).toBeDefined()
    expect(screen.getByText('Card body content')).toBeDefined()
  })
})
