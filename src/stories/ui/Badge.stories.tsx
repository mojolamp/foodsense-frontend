import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'failure'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '標籤',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: '次要',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: '危險',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: '外框',
    variant: 'outline',
  },
}

export const Success: Story = {
  args: {
    children: '成功',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: '警告',
    variant: 'warning',
  },
}

export const Failure: Story = {
  args: {
    children: '失敗',
    variant: 'failure',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="failure">Failure</Badge>
    </div>
  ),
}
