'use client'

import { useQualityOverview, useQualityTimeline, useQualitySources, useQualityCoverage } from '@/hooks/useDataQuality'
import QualityKPICards from '@/components/quality/QualityKPICards'
import QualityTimeline from '@/components/quality/QualityTimeline'
import SourceContribution from '@/components/quality/SourceContribution'
import CoverageStats from '@/components/quality/CoverageStats'

export default function DataQualityPage() {
  const { data: overview } = useQualityOverview()
  const { data: timeline } = useQualityTimeline(30)
  const { data: sources } = useQualitySources()
  const { data: coverage } = useQualityCoverage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">資料品質</h1>
        <p className="mt-2 text-gray-600">
          數據治理與品質監控
        </p>
      </div>

      {overview && <QualityKPICards data={overview} />}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Golden Record 成長趨勢
        </h2>
        {timeline && <QualityTimeline data={timeline} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            來源貢獻度
          </h2>
          {sources && <SourceContribution data={sources} />}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            欄位覆蓋率
          </h2>
          {coverage && <CoverageStats data={coverage} />}
        </div>
      </div>
    </div>
  )
}


