/**
 * Dialog Component Tests
 *
 * @module components/ui/dialog.test
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'

describe('Dialog', () => {
  it('should render dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open Dialog'))

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render DialogHeader with custom className', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader className="custom-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    const header = screen.getByText('Title').parentElement
    expect(header).toHaveClass('custom-header')
  })

  it('should render DialogFooter with custom className', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogFooter className="custom-footer" data-testid="footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('custom-footer')
  })

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Test Title')).toBeInTheDocument()

    // Click the close button (has sr-only text "Close")
    await user.click(screen.getByRole('button', { name: 'Close' }))

    // Dialog should be closed, title should not be visible
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('should apply custom className to DialogContent', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-content" data-testid="dialog-content">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    const content = screen.getByTestId('dialog-content')
    expect(content).toHaveClass('custom-content')
  })

  it('should apply custom className to DialogTitle', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle className="custom-title">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    const title = screen.getByText('Title')
    expect(title).toHaveClass('custom-title')
  })

  it('should apply custom className to DialogDescription', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription className="custom-desc">Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    const desc = screen.getByText('Description')
    expect(desc).toHaveClass('custom-desc')
  })

  it('should render DialogClose as trigger for closing', async () => {
    const user = userEvent.setup()

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <button>Close Me</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Title')).toBeInTheDocument()

    await user.click(screen.getByText('Close Me'))
    expect(screen.queryByText('Title')).not.toBeInTheDocument()
  })
})
