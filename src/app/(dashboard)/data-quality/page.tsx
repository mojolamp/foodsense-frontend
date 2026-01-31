'use client'

import { useQualityOverview, useQualityTimeline, useQualitySources, useQualityCoverage } from '@/hooks/useDataQuality'
import QualityKPICards from '@/components/quality/QualityKPICards'
import QualityTimeline from '@/components/quality/QualityTimeline'
import SourceContribution from '@/components/quality/SourceContribution'
import CoverageStats from '@/components/quality/CoverageStats'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { BarChart3, Upload, Book } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DataQualityPage() {
  const router = useRouter()
  const { data: overview, isLoading: overviewLoading } = useQualityOverview()
  const { data: timeline, isLoading: timelineLoading } = useQualityTimeline(30)
  const { data: sources, isLoading: sourcesLoading } = useQualitySources()
  const { data: coverage, isLoading: coverageLoading } = useQualityCoverage()

  // Check if we have any data at all
  const hasNoData = !overviewLoading && !timelineLoading && !sourcesLoading && !coverageLoading &&
    !overview && !timeline && !sources && !coverage

  // Show loading state
  if (overviewLoading || timelineLoading || sourcesLoading || coverageLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">資料品質</h1>
          <p className="mt-2 text-gray-600">數據治理與品質監控</p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no data
  if (hasNoData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">資料品質</h1>
          <p className="mt-2 text-gray-600">數據治理與品質監控</p>
        </div>
        <div className="bg-white rounded-lg shadow">
          <EmptyStateV2
            icon={BarChart3}
            iconBackgroundColor="orange"
            title="尚未有品質數據"
            description="匯入並處理產品後將顯示品質指標"
            helpText="資料品質追蹤會監控 Golden Record 覆蓋率、來源貢獻度和欄位完整性。請先匯入產品以開始追蹤品質指標。"
            primaryAction={{
              label: '匯入產品',
              onClick: () => router.push('/products'),
              icon: Upload,
            }}
            secondaryAction={{
              label: '查看說明文件',
              onClick: () => {
                // FUTURE(P3): Add documentation link when docs site is ready
                // Placeholder: docs not yet available
                window.open('https://docs.foodsense.app/data-quality', '_blank')
              },
              icon: Book,
            }}
          />
        </div>
      </div>
    )
  }

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


