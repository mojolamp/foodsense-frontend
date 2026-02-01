/**
 * Tooltip Component Tests
 *
 * @module components/ui/tooltip.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip'

describe('Tooltip', () => {
  it('should render tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('should show tooltip content on mouse enter', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()
  })

  it('should hide tooltip content on mouse leave', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')

    fireEvent.mouseEnter(trigger)
    expect(screen.getByText('Tooltip content')).toBeInTheDocument()

    fireEvent.mouseLeave(trigger)
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
  })

  it('should apply custom className to TooltipContent', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('custom-tooltip')
  })

  it('should position tooltip on top by default', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('bottom-full')
  })

  it('should position tooltip on bottom when specified', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="bottom">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('top-full')
  })

  it('should position tooltip on left when specified', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="left">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('right-full')
  })

  it('should position tooltip on right when specified', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="right">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('left-full')
  })

  it('should work with asChild prop on TooltipTrigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Click me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.mouseEnter(button)

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()
  })

  it('should accept custom delayDuration in TooltipProvider', () => {
    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    // Provider should render without errors
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })
})
