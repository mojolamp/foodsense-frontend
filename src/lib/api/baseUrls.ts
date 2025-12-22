/**
 * API Base URL Configuration
 *
 * CRITICAL: These URLs are HARDCODED contracts between frontend and backend.
 * DO NOT allow dynamic composition or runtime modification.
 *
 * Version: 1.0.1
 * Contract Lock: 2025-12-22
 */

export const API_BASES = {
  /** Legacy Review Workbench APIs (v1) */
  V1: process.env.NEXT_PUBLIC_API_V1_BASE || 'http://localhost:8000/api/v1',

  /** Core Data APIs (v2): Products, Dictionary, Rules, Data Quality */
  V2: process.env.NEXT_PUBLIC_API_V2_BASE || 'http://localhost:8000/api',

  /** LawCore APIs: Presence Gate ONLY (v1.0 scope locked) */
  LAWCORE: process.env.NEXT_PUBLIC_LAWCORE_BASE || 'http://localhost:8000/api/lawcore',
} as const

export type APIBase = keyof typeof API_BASES

/**
 * Validate that base URLs are properly configured
 * Throws error if any base URL is missing or malformed
 */
export function validateAPIBases(): void {
  Object.entries(API_BASES).forEach(([key, url]) => {
    if (!url) {
      throw new Error(`API Base URL for ${key} is not configured`)
    }

    try {
      new URL(url)
    } catch {
      throw new Error(`Invalid API Base URL for ${key}: ${url}`)
    }
  })
}

/**
 * Get the appropriate base URL for a given API version
 */
export function getAPIBase(base: APIBase): string {
  return API_BASES[base]
}
