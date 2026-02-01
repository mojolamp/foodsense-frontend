/**
 * Button Component Tests
 *
 * @module components/ui/button.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('should render with default variant and size', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeDefined()
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('h-9')
  })

  it('should render with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('bg-destructive')
  })

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)

    const button = screen.getByRole('button', { name: 'Outline' })
    expect(button.className).toContain('border')
    expect(button.className).toContain('bg-background')
  })

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: 'Secondary' })
    expect(button.className).toContain('bg-secondary')
  })

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: 'Ghost' })
    expect(button.className).toContain('hover:bg-accent')
  })

  it('should render with link variant', () => {
    render(<Button variant="link">Link</Button>)

    const button = screen.getByRole('button', { name: 'Link' })
    expect(button.className).toContain('text-primary')
    expect(button.className).toContain('underline-offset-4')
  })

  it('should render with small size', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: 'Small' })
    expect(button.className).toContain('h-8')
    expect(button.className).toContain('text-xs')
  })

  it('should render with large size', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button', { name: 'Large' })
    expect(button.className).toContain('h-10')
  })

  it('should render with icon size', () => {
    render(<Button size="icon">+</Button>)

    const button = screen.getByRole('button', { name: '+' })
    expect(button.className).toContain('h-9')
    expect(button.className).toContain('w-9')
  })

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button.className).toContain('custom-class')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    const button = screen.getByRole('button', { name: 'Click' })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toHaveProperty('disabled', true)

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeDefined()
    expect(link.tagName.toLowerCase()).toBe('a')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Ref Button</Button>)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName.toLowerCase()).toBe('button')
  })

  it('should pass through type prop', () => {
    render(<Button type="submit">Submit</Button>)

    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toHaveProperty('type', 'submit')
  })
})

describe('buttonVariants', () => {
  it('should generate default class string', () => {
    const classes = buttonVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('bg-primary')
  })

  it('should generate variant and size specific class string', () => {
    const classes = buttonVariants({ variant: 'destructive', size: 'sm' })
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('h-8')
  })

  it('should merge custom className', () => {
    const classes = buttonVariants({ className: 'custom-class' })
    expect(classes).toContain('custom-class')
  })
})
