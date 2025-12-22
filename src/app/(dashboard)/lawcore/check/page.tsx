'use client'

import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PresenceQuickCheck from '@/components/lawcore/PresenceQuickCheck'
import PresenceBatchCheck from '@/components/lawcore/PresenceBatchCheck'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorState from '@/components/shared/ErrorState'

function PresenceCheckContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Presence Check Tool</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Verify additive presence in LawCore regulation database
        </p>
      </div>

      {/* Content */}
      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Check</TabsTrigger>
          <TabsTrigger value="batch">Batch Check</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="p-6">
            <PresenceQuickCheck />
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="p-6">
            <PresenceBatchCheck />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function PresenceCheckPage() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Failed to load Presence Check Tool"
          message="An unexpected error occurred while loading the presence check page."
        />
      }
    >
      <PresenceCheckContent />
    </ErrorBoundary>
  )
}
