import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentAPI } from '@/lib/api/endpoints/documents'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'

export function useDocuments(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentAPI.getDocuments(params),
  })
}

export function useDocumentUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => documentAPI.upload(file),
    onSuccess: (data) => {
      toast.success(`Document uploaded: ${data.filename}`)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Document upload failed')
    },
  })
}
