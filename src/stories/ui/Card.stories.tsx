import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>卡片標題</CardTitle>
      </CardHeader>
      <CardContent>
        <p>這是卡片內容區域，可以放置任何內容。</p>
      </CardContent>
    </Card>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>產品資訊</CardTitle>
          <Badge variant="success">已驗證</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">產品名稱：有機燕麥片</p>
        <p className="text-sm text-gray-600">品牌：健康生活</p>
      </CardContent>
    </Card>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>待審核項目</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          此項目需要您的審核確認。
        </p>
        <div className="flex gap-2">
          <Button variant="default" size="sm">核准</Button>
          <Button variant="outline" size="sm">拒絕</Button>
        </div>
      </CardContent>
    </Card>
  ),
}

export const Stats: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">
            總產品數
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">12,345</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">
            已驗證
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">10,234</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">
            待審核
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-600">2,111</p>
        </CardContent>
      </Card>
    </div>
  ),
}
