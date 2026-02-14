'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Plus, MessageSquare } from 'lucide-react'
import {
  useOCRCorrectionsList,
  useOCRCorrectionSubmit,
  useOCRCorrectionApprove,
  useOCRCorrectionReject,
  useOCRFeedbackSubmit,
} from '@/hooks/useOCRCorrections'
import type { CorrectionStatus } from '@/types/ocrCorrections'

export default function OCRCorrectionsPanel() {
  const [filterStatus, setFilterStatus] = useState<CorrectionStatus>('pending')
  const [showSubmit, setShowSubmit] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Submit form state
  const [wrongText, setWrongText] = useState('')
  const [correctText, setCorrectText] = useState('')

  // Feedback form state
  const [ocrOutput, setOcrOutput] = useState('')
  const [humanVerified, setHumanVerified] = useState('')

  const { data, isLoading } = useOCRCorrectionsList(filterStatus)
  const submitMutation = useOCRCorrectionSubmit()
  const approveMutation = useOCRCorrectionApprove()
  const rejectMutation = useOCRCorrectionReject()
  const feedbackMutation = useOCRFeedbackSubmit()

  const items = data?.items ?? []

  const handleSubmit = () => {
    if (!wrongText.trim() || !correctText.trim()) return
    submitMutation.mutate(
      { wrong_text: wrongText.trim(), correct_text: correctText.trim() },
      {
        onSuccess: () => {
          setWrongText('')
          setCorrectText('')
          setShowSubmit(false)
        },
      }
    )
  }

  const handleFeedback = () => {
    if (!ocrOutput.trim() || !humanVerified.trim()) return
    feedbackMutation.mutate(
      { ocr_output: ocrOutput.trim(), human_verified: humanVerified.trim() },
      {
        onSuccess: () => {
          setOcrOutput('')
          setHumanVerified('')
          setShowFeedback(false)
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions + Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => { setShowSubmit(!showSubmit); setShowFeedback(false) }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Submit Correction
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setShowFeedback(!showFeedback); setShowSubmit(false) }}>
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Submit Feedback
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {(['pending', 'approved', 'rejected', 'candidate'] as CorrectionStatus[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? 'default' : 'outline'}
              onClick={() => setFilterStatus(s)}
              className="text-xs h-7"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Submit Correction Form */}
      {showSubmit && (
        <Card className="p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Submit New Correction</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Wrong Text (OCR output)</label>
              <input
                type="text"
                value={wrongText}
                onChange={(e) => setWrongText(e.target.value)}
                placeholder="e.g. 檸蒙酸"
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Correct Text</label>
              <input
                type="text"
                value={correctText}
                onChange={(e) => setCorrectText(e.target.value)}
                placeholder="e.g. 檸檬酸"
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={submitMutation.isPending || !wrongText.trim() || !correctText.trim()}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSubmit(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Submit Feedback Form */}
      {showFeedback && (
        <Card className="p-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Submit OCR Feedback</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">OCR Output</label>
              <textarea
                value={ocrOutput}
                onChange={(e) => setOcrOutput(e.target.value)}
                placeholder="Paste OCR raw output..."
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background min-h-[60px]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Human Verified (correct text)</label>
              <textarea
                value={humanVerified}
                onChange={(e) => setHumanVerified(e.target.value)}
                placeholder="Enter the correct text..."
                className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background min-h-[60px]"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleFeedback} disabled={feedbackMutation.isPending || !ocrOutput.trim() || !humanVerified.trim()}>
              {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowFeedback(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Corrections List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">
          No corrections with status &quot;{filterStatus}&quot;.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((pair) => (
            <Card key={pair.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm line-through text-red-500">{pair.wrong_text}</span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="text-sm font-medium text-green-600">{pair.correct_text}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {pair.occurrences} occurrence{pair.occurrences !== 1 ? 's' : ''}
                      {pair.created_at && ` | ${new Date(pair.created_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Badge
                    variant={
                      pair.status === 'approved' ? 'success' :
                      pair.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="text-xs shrink-0"
                  >
                    {pair.status}
                  </Badge>
                </div>
                {(pair.status === 'pending' || pair.status === 'candidate') && (
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => approveMutation.mutate(pair.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => rejectMutation.mutate(pair.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
