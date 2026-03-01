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
    return apiClient.post<BenchmarkRunResponse>('/benchmark/run', {})
  },

  getResults() {
    return apiClient.get<BenchmarkResultsResponse>('/benchmark/results')
  },

  getHistory(limit = 10) {
    return apiClient.get<BenchmarkHistoryResponse>(`/benchmark/history?limit=${limit}`)
  },

  getMetrics() {
    return apiClient.get<BenchmarkMetricsResponse>('/benchmark/metrics')
  },

  getDatasetInfo() {
    return apiClient.get<DatasetInfoResponse>('/benchmark/dataset/info')
  },
}
