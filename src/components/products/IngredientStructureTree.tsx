'use client'

import { AnimatedTree } from 'react-tree-graph'
import 'react-tree-graph/dist/style.css'

export default function IngredientStructureTree({ structure }: { structure: any }) {
  // 假設後端直接給樹狀資料；若需要轉換可在此處理
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <AnimatedTree
        data={structure}
        height={300}
        width={500}
        svgProps={{ className: 'mx-auto' }}
      />
    </div>
  )
}





