'use client'

import { SourceContribution as SourceContributionType } from '@/types/quality'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: SourceContributionType[]
}

export default function SourceContribution({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="source" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_products" fill="#3B82F6" name="總產品" />
        <Bar dataKey="tier_a_adopted" fill="#10B981" name="Tier A" />
      </BarChart>
    </ResponsiveContainer>
  )
}


