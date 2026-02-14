export interface VersionInfoResponse {
  current_version: string
  supported_versions: string[]
  default_version: string
  latest_version: string
  deprecated_versions: string[]
}

export interface CurrentVersionResponse {
  version: string
  is_latest: boolean
  is_deprecated: boolean
  supported_versions: string[]
  latest_version: string
}

export interface SupportedVersionDetail {
  version: string
  is_default: boolean
  is_latest: boolean
  is_deprecated: boolean
  endpoint_prefix: string
  deprecation: {
    deprecated: boolean
    sunset_date: string | null
    replacement: string | null
    migration_guide: string | null
  } | null
}

export interface SupportedVersionsResponse {
  supported_versions: SupportedVersionDetail[]
  default_version: string
  latest_version: string
}

export interface DeprecatedVersion {
  version: string
  sunset_date: string
  replacement: string
  migration_guide: string
  reason: string
}

export interface DeprecatedEndpoint {
  endpoint: string
  replacement: string
  sunset_date: string
}

export interface DeprecationsResponse {
  deprecated_versions: DeprecatedVersion[]
  deprecated_endpoints: DeprecatedEndpoint[]
  recommendation: string
}

export interface MigrationGuideResponse {
  status: 'found' | 'not_found'
  from_version: string
  to_version: string
  guide: {
    breaking_changes: string[]
    new_features: string[]
    migration_steps: string[]
  } | null
}
