import { apiClient } from '../client'
import type {
  ScanSubmitResponse,
  ScanResult,
} from '@/types/scanV1'

export const scanV1API = {
  submitScan(image: File) {
    const formData = new FormData()
    formData.append('image', image)
    return apiClient.postFormData<ScanSubmitResponse>('/scan', formData)
  },

  getJobResult(jobId: string) {
    return apiClient.get<ScanResult>(`/scan/${jobId}`)
  },
}
