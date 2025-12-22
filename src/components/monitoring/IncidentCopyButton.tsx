'use client'

import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { monitoringAPI, type AppPerformanceMetrics } from '@/lib/api/monitoring'
import toast from 'react-hot-toast'

interface IncidentCopyButtonProps {
  metrics: AppPerformanceMetrics
}

export default function IncidentCopyButton({ metrics }: IncidentCopyButtonProps) {
  const handleCopy = () => {
    const template = monitoringAPI.generateIncidentTemplate(metrics)
    navigator.clipboard.writeText(template)
    toast.success('Incident report copied to clipboard')
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="h-4 w-4 mr-2" />
      Copy Incident Report
    </Button>
  )
}
