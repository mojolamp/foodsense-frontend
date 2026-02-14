import { apiClient } from '../client'
import type {
  BenchmarkRunResponse,
  BenchmarkResultsResponse,
  BenchmarkHistoryResponse,
  BenchmarkMetricsResponse,
  DatasetInfoResponse,
} from '@/types/benchmark'

export const benchmarkAPI = {
  run() {
    return apiClient.post<BenchmarkRunResponse>('/api/v1/benchmark/run', {})
  },

  getResults() {
    return apiClient.get<BenchmarkResultsResponse>('/api/v1/benchmark/results')
  },

  getHistory(limit = 10) {
    return apiClient.get<BenchmarkHistoryResponse>(`/api/v1/benchmark/history?limit=${limit}`)
  },

  getMetrics() {
    return apiClient.get<BenchmarkMetricsResponse>('/api/v1/benchmark/metrics')
  },

  getDatasetInfo() {
    return apiClient.get<DatasetInfoResponse>('/api/v1/benchmark/dataset/info')
  },
}
