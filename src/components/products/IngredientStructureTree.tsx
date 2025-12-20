'use client'

import { useMemo } from 'react'
import { AnimatedTree } from 'react-tree-graph'
import 'react-tree-graph/dist/style.css'
import type { IngredientsStructure, TreeNode } from '@/types/product'

interface TreeGraphData {
  name: string
  children: TreeGraphData[]
}

interface Props {
  structure: IngredientsStructure
}

// 轉換 TreeNode 為 react-tree-graph 需要的格式 (children 必須是陣列)
function toTreeGraphData(node: TreeNode): TreeGraphData {
  return {
    name: node.name,
    children: node.children ? node.children.map(toTreeGraphData) : [],
  }
}

export default function IngredientStructureTree({ structure }: Props) {
  const treeData = useMemo(() => toTreeGraphData(structure), [structure])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <AnimatedTree
        data={treeData}
        height={300}
        width={500}
        svgProps={{ className: 'mx-auto' }}
      />
    </div>
  )
}


