import { useQuery } from '@tanstack/react-query'
import { versionInfoAPI } from '@/lib/api/endpoints/versionInfo'

export function useVersionInfo() {
  return useQuery({
    queryKey: ['version-info'],
    queryFn: () => versionInfoAPI.getInfo(),
  })
}

export function useCurrentVersion() {
  return useQuery({
    queryKey: ['version-current'],
    queryFn: () => versionInfoAPI.getCurrent(),
  })
}

export function useSupportedVersions() {
  return useQuery({
    queryKey: ['version-supported'],
    queryFn: () => versionInfoAPI.getSupported(),
  })
}

export function useDeprecations() {
  return useQuery({
    queryKey: ['version-deprecations'],
    queryFn: () => versionInfoAPI.getDeprecations(),
  })
}

export function useMigrationGuide(fromVersion: string, toVersion: string) {
  return useQuery({
    queryKey: ['version-migration', fromVersion, toVersion],
    queryFn: () => versionInfoAPI.getMigrationGuide(fromVersion, toVersion),
    enabled: !!fromVersion && !!toVersion,
  })
}
