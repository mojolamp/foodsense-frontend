import { useMutation } from '@tanstack/react-query'
import { ocrAPI, ingestionGateRunAPI } from '@/lib/api/endpoints/ocr'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type { OCREngine } from '@/types/ocr'

export function useOCRScan() {
  return useMutation({
    mutationFn: ({
      image,
      enableTriple = true,
      enableProvenance = false,
    }: {
      image: File
      enableTriple?: boolean
      enableProvenance?: boolean
    }) =>
      ocrAPI.smartProcessAndNormalize(image, {
        enableTriple,
        enableProvenance,
      }),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'OCR scan failed')
    },
  })
}

export function useOCRV2Scan() {
  return useMutation({
    mutationFn: ({
      image,
      engine = 'conditional',
    }: {
      image: File
      engine?: OCREngine
    }) => ocrAPI.v2Process(image, { engine }),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'OCR v2 scan failed')
    },
  })
}

export function useIngestionSubmit() {
  return useMutation({
    mutationFn: (payload: {
      source_type: string
      source_id: string
      raw_payload: Record<string, unknown>
    }) => ingestionGateRunAPI.run(payload),
    onSuccess: (data) => {
      toast.success(`Record submitted: ${data.record_id}`)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Ingestion submit failed')
    },
  })
}

export function useIngestionStatus() {
  return useMutation({
    mutationFn: (recordId: string) => ingestionGateRunAPI.getStatus(recordId),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to fetch status')
    },
  })
}

export function useIngestionTrace() {
  return useMutation({
    mutationFn: (traceId: string) => ingestionGateRunAPI.getTrace(traceId),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to fetch trace')
    },
  })
}
