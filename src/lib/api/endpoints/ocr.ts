import { apiClient, apiClientV2 } from '../client'
import type {
  OCRSmartNormalizeResponse,
  OCRV2Response,
  IngestionRunResponse,
  IngestionStatusResponse,
  OCREngine,
} from '@/types/ocr'

export const ocrAPI = {
  async smartProcessAndNormalize(
    image: File,
    options?: {
      enableTriple?: boolean
      enableProvenance?: boolean
      context?: string
    }
  ): Promise<OCRSmartNormalizeResponse> {
    const formData = new FormData()
    formData.append('image', image)
    if (options?.enableTriple != null) {
      formData.append('enable_triple', String(options.enableTriple))
    }
    if (options?.enableProvenance != null) {
      formData.append('enable_provenance', String(options.enableProvenance))
    }
    if (options?.context) {
      formData.append('context', options.context)
    }
    return apiClientV2.postFormData<OCRSmartNormalizeResponse>(
      '/ocr/smart/process-and-normalize',
      formData
    )
  },

  async v2Process(
    image: File,
    options?: {
      engine?: OCREngine
      enablePreprocessing?: boolean
      enablePostprocessing?: boolean
    }
  ): Promise<OCRV2Response> {
    const formData = new FormData()
    formData.append('image', image)
    if (options?.engine) formData.append('engine', options.engine)
    if (options?.enablePreprocessing != null) {
      formData.append('enable_preprocessing', String(options.enablePreprocessing))
    }
    if (options?.enablePostprocessing != null) {
      formData.append('enable_postprocessing', String(options.enablePostprocessing))
    }
    return apiClientV2.postFormData<OCRV2Response>(
      '/ocr/v2/process',
      formData
    )
  },
}

export const ingestionGateRunAPI = {
  async run(payload: {
    source_type: string
    source_id: string
    raw_payload: Record<string, unknown>
    schema_version?: string
    payload_schema_version?: string
    trace_id?: string
  }): Promise<IngestionRunResponse> {
    return apiClient.post<IngestionRunResponse>(
      '/ingestion-gate/run',
      {
        schema_version: payload.schema_version || '1.0',
        payload_schema_version: payload.payload_schema_version || '1.0',
        requested_at: new Date().toISOString(),
        trace_id: payload.trace_id || crypto.randomUUID(),
        ...payload,
      }
    )
  },

  async getStatus(recordId: string): Promise<IngestionStatusResponse> {
    return apiClient.get<IngestionStatusResponse>(
      `/ingestion-gate/status/${recordId}`
    )
  },

  async replay(recordId: string): Promise<{ success: boolean; record_id: string; status: string }> {
    return apiClient.post<{ success: boolean; record_id: string; status: string }>(
      `/ingestion-gate/replay/${recordId}`,
      {}
    )
  },

  async getTrace(traceId: string): Promise<IngestionStatusResponse[]> {
    return apiClient.get<IngestionStatusResponse[]>(
      `/ingestion-gate/status/trace/${traceId}`
    )
  },
}
