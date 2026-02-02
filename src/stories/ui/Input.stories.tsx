import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: '請輸入文字...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="請輸入 Email" />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '請輸入密碼',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: '禁用狀態',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    value: '已填入的值',
    readOnly: true,
  },
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: '搜尋產品...',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '請輸入數字',
    min: 0,
    max: 100,
  },
}
