import { apiClientV2V2 } from '../client'
import type {
  VersionInfoResponse,
  CurrentVersionResponse,
  SupportedVersionsResponse,
  DeprecationsResponse,
  MigrationGuideResponse,
} from '@/types/versionInfo'

export const versionInfoAPI = {
  async getInfo(): Promise<VersionInfoResponse> {
    return apiClientV2.get('/version/info')
  },

  async getCurrent(): Promise<CurrentVersionResponse> {
    return apiClientV2.get('/version/current')
  },

  async getSupported(): Promise<SupportedVersionsResponse> {
    return apiClientV2.get('/version/supported')
  },

  async getDeprecations(): Promise<DeprecationsResponse> {
    return apiClientV2.get('/version/deprecations')
  },

  async getMigrationGuide(fromVersion: string, toVersion: string): Promise<MigrationGuideResponse> {
    return apiClientV2.get(`/version/migration/${encodeURIComponent(fromVersion)}/to/${encodeURIComponent(toVersion)}`)
  },
}
