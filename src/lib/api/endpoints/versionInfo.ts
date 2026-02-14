import { apiClient } from '../client'
import type {
  VersionInfoResponse,
  CurrentVersionResponse,
  SupportedVersionsResponse,
  DeprecationsResponse,
  MigrationGuideResponse,
} from '@/types/versionInfo'

export const versionInfoAPI = {
  async getInfo(): Promise<VersionInfoResponse> {
    return apiClient.get('/api/v1/version/info')
  },

  async getCurrent(): Promise<CurrentVersionResponse> {
    return apiClient.get('/api/v1/version/current')
  },

  async getSupported(): Promise<SupportedVersionsResponse> {
    return apiClient.get('/api/v1/version/supported')
  },

  async getDeprecations(): Promise<DeprecationsResponse> {
    return apiClient.get('/api/v1/version/deprecations')
  },

  async getMigrationGuide(fromVersion: string, toVersion: string): Promise<MigrationGuideResponse> {
    return apiClient.get(`/api/v1/version/migration/${encodeURIComponent(fromVersion)}/to/${encodeURIComponent(toVersion)}`)
  },
}
