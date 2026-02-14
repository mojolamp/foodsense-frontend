import { apiClient } from '../client'
import type {
  NormalizeRequest,
  NormalizeResponse,
  NormalizeBatchRequest,
  NormalizeBatchResponse,
  NormalizerVersionsResponse,
  NormalizerHealthResponse,
} from '@/types/normalizer'

export const normalizerAPI = {
  normalize(data: NormalizeRequest) {
    return apiClient.post<NormalizeResponse>('/normalizer/normalize', data)
  },

  normalizeBatchOCR(data: NormalizeBatchRequest) {
    return apiClient.post<NormalizeBatchResponse>('/normalizer/normalize/ocr/batch', data)
  },

  getVersions() {
    return apiClient.get<NormalizerVersionsResponse>('/normalizer/versions')
  },

  getHealth() {
    return apiClient.get<NormalizerHealthResponse>('/normalizer/health')
  },
}
