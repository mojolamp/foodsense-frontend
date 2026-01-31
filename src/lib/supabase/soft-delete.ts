/**
 * Soft Delete Filtering Utilities
 * Epic E Task E-T6
 *
 * Provides helper functions to filter soft-deleted records from Supabase queries.
 *
 * Usage:
 * ```typescript
 * import { withoutSoftDeleted, withSoftDeleteFilter } from '@/lib/supabase/soft-delete';
 *
 * // Filter out deleted records (default behavior)
 * const activeUsers = await withoutSoftDeleted(
 *   supabase.from('users').select('*')
 * );
 *
 * // Include deleted records (admin view)
 * const allUsers = await withSoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   true // includeDeleted
 * );
 * ```
 */

// Note: Using 'any' type for query builders due to Supabase type changes

/**
 * Tables that have soft_delete_enabled=true
 * Reference: governance/retention_mapping.json
 */
export const SOFT_DELETE_ENABLED_TABLES = [
  // P0 Tables
  'users',
  'raw_ingestion_records_v1',
  'mcp_ocr_records',
  'review_queue_v1',
  'mcp_products',
  // P1 Tables
  'mcp_additives',
  'clean_product_records_v1',
  'validation_findings_v1',
  'mcp_variant_statistics',
  'mcp_cooccurrence_patterns',
  'mcp_ocr_error_observations',
  'mcp_category_profiles',
  'service_api_keys',
  'barcodes',
  'prices',
  'stores',
  'categories',
  'brands',
  // P2 Tables
  'failed_payloads',
] as const;

export type SoftDeleteEnabledTable = typeof SOFT_DELETE_ENABLED_TABLES[number];

/**
 * Check if a table has soft delete enabled
 */
export function isSoftDeleteEnabled(tableName: string): tableName is SoftDeleteEnabledTable {
  return SOFT_DELETE_ENABLED_TABLES.includes(tableName as any);
}

/**
 * Apply soft delete filter to a Supabase query
 * Only returns active (non-deleted) records where soft_deleted_at IS NULL
 *
 * @param query - Supabase query builder
 * @returns Query with soft delete filter applied
 *
 * @example
 * ```typescript
 * const { data } = await withoutSoftDeleted(
 *   supabase.from('users').select('*')
 * );
 * // Equivalent to: SELECT * FROM users WHERE soft_deleted_at IS NULL
 * ```
 */
export function withoutSoftDeleted<T>(
  query: any
): any {
  return query.is('soft_deleted_at', null);
}

/**
 * Apply soft delete filter with option to include deleted records
 *
 * @param query - Supabase query builder
 * @param includeDeleted - If true, returns all records including soft deleted
 * @returns Query with optional soft delete filter
 *
 * @example
 * ```typescript
 * // Active records only (default)
 * const activeUsers = await withSoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   false
 * );
 *
 * // All records including deleted (admin view)
 * const allUsers = await withSoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   true
 * );
 * ```
 */
export function withSoftDeleteFilter<T>(
  query: any,
  includeDeleted: boolean = false
): any {
  return includeDeleted ? query : withoutSoftDeleted(query);
}

/**
 * Only return soft deleted records (where soft_deleted_at IS NOT NULL)
 * Useful for admin/audit views to see what has been deleted
 *
 * @param query - Supabase query builder
 * @returns Query that only returns deleted records
 *
 * @example
 * ```typescript
 * const deletedUsers = await onlySoftDeleted(
 *   supabase.from('users').select('*')
 * );
 * // Equivalent to: SELECT * FROM users WHERE soft_deleted_at IS NOT NULL
 * ```
 */
export function onlySoftDeleted<T>(
  query: any
): any {
  return query.not('soft_deleted_at', 'is', null);
}

/**
 * Get all records (active + deleted)
 * Explicit function name for clarity - does not apply any filter
 *
 * @param query - Supabase query builder
 * @returns Query without soft delete filtering
 *
 * @example
 * ```typescript
 * const allUsers = await withAllRecords(
 *   supabase.from('users').select('*')
 * );
 * // Equivalent to: SELECT * FROM users (no WHERE clause)
 * ```
 */
export function withAllRecords<T>(
  query: any
): any {
  return query;
}

/**
 * Options for soft delete filtering
 */
export interface SoftDeleteOptions {
  /**
   * If true, includes soft deleted records in the result
   * @default false
   */
  includeDeleted?: boolean;

  /**
   * If true, only returns soft deleted records
   * @default false
   */
  onlyDeleted?: boolean;
}

/**
 * Apply soft delete filter based on options
 * Convenience function that handles multiple filter modes
 *
 * @param query - Supabase query builder
 * @param options - Filtering options
 * @returns Query with appropriate soft delete filter
 *
 * @example
 * ```typescript
 * // Active records only
 * const activeUsers = await applySoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   {}
 * );
 *
 * // Include deleted
 * const allUsers = await applySoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   { includeDeleted: true }
 * );
 *
 * // Only deleted (admin view)
 * const deletedUsers = await applySoftDeleteFilter(
 *   supabase.from('users').select('*'),
 *   { onlyDeleted: true }
 * );
 * ```
 */
export function applySoftDeleteFilter<T>(
  query: any,
  options: SoftDeleteOptions = {}
): any {
  const { includeDeleted = false, onlyDeleted = false } = options;

  if (onlyDeleted) {
    return onlySoftDeleted(query);
  }

  if (includeDeleted) {
    return withAllRecords(query);
  }

  return withoutSoftDeleted(query);
}

/**
 * Type guard to check if a record is soft deleted
 *
 * @param record - Database record with soft_deleted_at field
 * @returns true if record is soft deleted
 */
export function isSoftDeleted(record: { soft_deleted_at?: string | null }): boolean {
  return record.soft_deleted_at !== null && record.soft_deleted_at !== undefined;
}

/**
 * Type guard to check if a record is active (not soft deleted)
 *
 * @param record - Database record with soft_deleted_at field
 * @returns true if record is active
 */
export function isActive(record: { soft_deleted_at?: string | null }): boolean {
  return !isSoftDeleted(record);
}

/**
 * Filter array of records to only include active (non-deleted) records
 * Useful for client-side filtering
 *
 * @param records - Array of database records
 * @returns Array of active records only
 *
 * @example
 * ```typescript
 * const users = [...]; // Array from database
 * const activeUsers = filterActive(users);
 * ```
 */
export function filterActive<T extends { soft_deleted_at?: string | null }>(
  records: T[]
): T[] {
  return records.filter(isActive);
}

/**
 * Filter array of records to only include soft deleted records
 * Useful for client-side filtering in admin views
 *
 * @param records - Array of database records
 * @returns Array of deleted records only
 */
export function filterDeleted<T extends { soft_deleted_at?: string | null }>(
  records: T[]
): T[] {
  return records.filter(isSoftDeleted);
}
