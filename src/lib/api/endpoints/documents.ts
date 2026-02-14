import { apiClient } from '../client'
import type {
  DocumentUploadResponse,
  DocumentDetail,
  DocumentListResponse,
} from '@/types/document'

export const documentAPI = {
  async upload(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.postFormData<DocumentUploadResponse>(
      '/api/v1/documents/upload',
      formData
    )
  },

  async getDocument(documentId: string): Promise<{ success: boolean; document: DocumentDetail }> {
    return apiClient.get(`/api/v1/documents/${documentId}`)
  },

  async getDocuments(params?: {
    page?: number
    page_size?: number
  }): Promise<DocumentListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.page_size) searchParams.set('page_size', String(params.page_size))
    const qs = searchParams.toString()
    return apiClient.get<DocumentListResponse>(`/api/v1/documents${qs ? `?${qs}` : ''}`)
  },
}
