import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '按鈕',
    variant: 'default',
  },
}

export const Destructive: Story = {
  args: {
    children: '刪除',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: '外框按鈕',
    variant: 'outline',
  },
}

export const Secondary: Story = {
  args: {
    children: '次要按鈕',
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    children: '透明按鈕',
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    children: '連結按鈕',
    variant: 'link',
  },
}

export const Small: Story = {
  args: {
    children: '小按鈕',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: '大按鈕',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    children: '禁用按鈕',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
