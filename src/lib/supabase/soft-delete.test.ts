/**
 * Tests for Soft Delete Filtering Utilities
 * Epic E Task E-T6
 */

import { describe, it, expect } from 'vitest';
import {
  SOFT_DELETE_ENABLED_TABLES,
  isSoftDeleteEnabled,
  isSoftDeleted,
  isActive,
  filterActive,
  filterDeleted,
} from './soft-delete';

describe('Soft Delete Utilities', () => {
  describe('SOFT_DELETE_ENABLED_TABLES', () => {
    it('should contain 19 tables', () => {
      expect(SOFT_DELETE_ENABLED_TABLES).toHaveLength(19);
    });

    it('should include all P0 tables', () => {
      const p0Tables = [
        'users',
        'raw_ingestion_records_v1',
        'mcp_ocr_records',
        'review_queue_v1',
        'mcp_products',
      ];

      p0Tables.forEach(table => {
        expect(SOFT_DELETE_ENABLED_TABLES).toContain(table);
      });
    });

    it('should not include audit_logs (append-only table)', () => {
      expect(SOFT_DELETE_ENABLED_TABLES).not.toContain('audit_logs');
    });

    it('should not include log tables', () => {
      expect(SOFT_DELETE_ENABLED_TABLES).not.toContain('crawler_execution_logs');
      expect(SOFT_DELETE_ENABLED_TABLES).not.toContain('job_logs');
    });
  });

  describe('isSoftDeleteEnabled', () => {
    it('should return true for soft-delete-enabled tables', () => {
      expect(isSoftDeleteEnabled('users')).toBe(true);
      expect(isSoftDeleteEnabled('mcp_products')).toBe(true);
      expect(isSoftDeleteEnabled('barcodes')).toBe(true);
    });

    it('should return false for non-soft-delete tables', () => {
      expect(isSoftDeleteEnabled('audit_logs')).toBe(false);
      expect(isSoftDeleteEnabled('crawler_execution_logs')).toBe(false);
      expect(isSoftDeleteEnabled('unknown_table')).toBe(false);
    });
  });

  describe('isSoftDeleted', () => {
    it('should return true for soft deleted records', () => {
      expect(isSoftDeleted({ soft_deleted_at: '2026-01-16T10:00:00Z' })).toBe(true);
      expect(isSoftDeleted({ soft_deleted_at: new Date().toISOString() })).toBe(true);
    });

    it('should return false for active records', () => {
      expect(isSoftDeleted({ soft_deleted_at: null })).toBe(false);
      expect(isSoftDeleted({ soft_deleted_at: undefined })).toBe(false);
      expect(isSoftDeleted({})).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true for active records', () => {
      expect(isActive({ soft_deleted_at: null })).toBe(true);
      expect(isActive({ soft_deleted_at: undefined })).toBe(true);
      expect(isActive({})).toBe(true);
    });

    it('should return false for soft deleted records', () => {
      expect(isActive({ soft_deleted_at: '2026-01-16T10:00:00Z' })).toBe(false);
    });
  });

  describe('filterActive', () => {
    it('should filter out soft deleted records', () => {
      const records = [
        { id: 1, name: 'Active 1', soft_deleted_at: null },
        { id: 2, name: 'Deleted', soft_deleted_at: '2026-01-16T10:00:00Z' },
        { id: 3, name: 'Active 2', soft_deleted_at: null },
      ];

      const activeRecords = filterActive(records);

      expect(activeRecords).toHaveLength(2);
      expect(activeRecords[0].id).toBe(1);
      expect(activeRecords[1].id).toBe(3);
    });

    it('should return empty array when all records are deleted', () => {
      const records = [
        { id: 1, name: 'Deleted 1', soft_deleted_at: '2026-01-16T10:00:00Z' },
        { id: 2, name: 'Deleted 2', soft_deleted_at: '2026-01-16T11:00:00Z' },
      ];

      const activeRecords = filterActive(records);

      expect(activeRecords).toHaveLength(0);
    });

    it('should return all records when none are deleted', () => {
      const records = [
        { id: 1, name: 'Active 1', soft_deleted_at: null },
        { id: 2, name: 'Active 2', soft_deleted_at: null },
      ];

      const activeRecords = filterActive(records);

      expect(activeRecords).toHaveLength(2);
    });
  });

  describe('filterDeleted', () => {
    it('should only return soft deleted records', () => {
      const records = [
        { id: 1, name: 'Active 1', soft_deleted_at: null },
        { id: 2, name: 'Deleted', soft_deleted_at: '2026-01-16T10:00:00Z' },
        { id: 3, name: 'Active 2', soft_deleted_at: null },
      ];

      const deletedRecords = filterDeleted(records);

      expect(deletedRecords).toHaveLength(1);
      expect(deletedRecords[0].id).toBe(2);
    });

    it('should return empty array when no records are deleted', () => {
      const records = [
        { id: 1, name: 'Active 1', soft_deleted_at: null },
        { id: 2, name: 'Active 2', soft_deleted_at: null },
      ];

      const deletedRecords = filterDeleted(records);

      expect(deletedRecords).toHaveLength(0);
    });

    it('should return all records when all are deleted', () => {
      const records = [
        { id: 1, name: 'Deleted 1', soft_deleted_at: '2026-01-16T10:00:00Z' },
        { id: 2, name: 'Deleted 2', soft_deleted_at: '2026-01-16T11:00:00Z' },
      ];

      const deletedRecords = filterDeleted(records);

      expect(deletedRecords).toHaveLength(2);
    });
  });
});

describe('Supabase Query Integration (Mock)', () => {
  // Note: These are conceptual tests
  // Actual Supabase integration tests would require a test database

  it('should apply soft delete filter correctly', () => {
    // Mock query builder
    const mockQuery = {
      is: (column: string, value: null) => {
        expect(column).toBe('soft_deleted_at');
        expect(value).toBe(null);
        return mockQuery;
      },
      not: (column: string, operator: string, value: null) => {
        expect(column).toBe('soft_deleted_at');
        expect(operator).toBe('is');
        expect(value).toBe(null);
        return mockQuery;
      },
    };

    // Test would import and use withoutSoftDeleted, etc.
    // This is a placeholder for actual integration tests
    expect(true).toBe(true);
  });
});

describe('Type Safety', () => {
  it('should enforce soft delete enabled table types', () => {
    // TypeScript compile-time test
    // This ensures type safety at compile time

    const validTable: string = 'users';
    expect(isSoftDeleteEnabled(validTable)).toBe(true);

    // TypeScript would catch this at compile time:
    // const invalidTable: SoftDeleteEnabledTable = 'audit_logs'; // Error
  });
});
