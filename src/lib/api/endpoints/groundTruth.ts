import { apiClient } from '../client'
import type {
  GTSuggestRequest,
  GTSuggestResponse,
  GTValidateRequest,
  GTValidateResponse,
  GTConvertRequest,
  GTConvertResponse,
  GTHealthResponse,
} from '@/types/groundTruth'

export const groundTruthAPI = {
  suggest(data: GTSuggestRequest) {
    return apiClient.post<GTSuggestResponse>('/gt/suggest', data)
  },

  validate(data: GTValidateRequest) {
    return apiClient.post<GTValidateResponse>('/gt/validate', data)
  },

  convert(data: GTConvertRequest) {
    return apiClient.post<GTConvertResponse>('/gt/convert', data)
  },

  getHealth() {
    return apiClient.get<GTHealthResponse>('/gt/health')
  },
}
