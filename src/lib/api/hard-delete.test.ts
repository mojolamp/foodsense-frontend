/**
 * Hard Delete API Tests
 * Epic E Task E-T7: Hard delete with dual verification
 *
 * @module lib/api/hard-delete.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateDualApproval,
  validateToken,
  validateTableName,
  validateReason,
  generateApprovalToken,
  ErrorCodes,
  HardDeleteError,
  preDeleteSafetyChecks,
  checkForeignKeyDependencies,
  createAuditLog,
  getAuditTrail,
  getOperationAuditTrail,
  softDeleteRecord,
  requestHardDelete,
  approveHardDelete,
  listDeleteRequests,
  getDeleteRequest,
  executeHardDelete,
  type DeleteRequest,
} from './hard-delete';

// Mock createClient
const mockSupabaseFrom = vi.fn();
const mockSupabaseAuth = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
    auth: {
      getUser: mockSupabaseAuth,
    },
  })),
}));

describe('Hard Delete API - Error Class', () => {
  it('should create HardDeleteError with code and message', () => {
    const error = new HardDeleteError('TEST_CODE', 'Test message');

    expect(error.name).toBe('HardDeleteError');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.details).toBeUndefined();
  });

  it('should create HardDeleteError with details', () => {
    const error = new HardDeleteError('TEST_CODE', 'Test message', { key: 'value' });

    expect(error.details).toEqual({ key: 'value' });
  });

  it('should be instance of Error', () => {
    const error = new HardDeleteError('TEST_CODE', 'Test message');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof HardDeleteError).toBe(true);
  });
});

describe('Hard Delete API - Validation Functions', () => {
  describe('validateDualApproval', () => {
    it('should reject when requester email = approver email', () => {
      const result = validateDualApproval(
        'user-123',
        'admin@foodsense.com',
        'user-456',
        'admin@foodsense.com'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.DUAL_APPROVAL_VIOLATION);
      expect(result.message).toContain('email match');
    });

    it('should reject when requester email = approver email (case insensitive)', () => {
      const result = validateDualApproval(
        'user-123',
        'admin@foodsense.com',
        'user-456',
        'ADMIN@FOODSENSE.COM'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.DUAL_APPROVAL_VIOLATION);
    });

    it('should reject when requester ID = approver ID', () => {
      const result = validateDualApproval(
        'user-123',
        'admin1@foodsense.com',
        'user-123',
        'admin2@foodsense.com'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.DUAL_APPROVAL_VIOLATION);
      expect(result.message).toContain('user ID match');
    });

    it('should accept when requester ≠ approver', () => {
      const result = validateDualApproval(
        'user-123',
        'admin1@foodsense.com',
        'user-456',
        'admin2@foodsense.com'
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('generateApprovalToken', () => {
    it('should generate unique tokens', () => {
      const token1 = generateApprovalToken();
      const token2 = generateApprovalToken();

      expect(token1).not.toBe(token2);
    });

    it('should prefix tokens with "hdel_"', () => {
      const token = generateApprovalToken();

      expect(token).toMatch(/^hdel_/);
    });

    it('should generate tokens of reasonable length', () => {
      const token = generateApprovalToken();

      // Base64url of 32 bytes is 43 chars + prefix
      expect(token.length).toBeGreaterThan(40);
    });
  });

  describe('validateToken', () => {
    const mockDeleteRequest: DeleteRequest = {
      id: 'del-req-123',
      table_name: 'users',
      record_id: 'user-456',
      requester_id: 'user-789',
      requester_email: 'admin@foodsense.com',
      approver_id: null,
      approver_email: null,
      status: 'pending_approval',
      reason: 'Test deletion reason',
      urgency: 'normal',
      approval_token: 'hdel_valid_token',
      requested_at: new Date().toISOString(),
      approved_at: null,
      executed_at: null,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should reject invalid token', () => {
      const result = validateToken('hdel_wrong_token', mockDeleteRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_TOKEN);
    });

    it('should reject expired token', () => {
      const expiredRequest = {
        ...mockDeleteRequest,
        expires_at: new Date(Date.now() - 1000).toISOString(), // 1 second ago
      };

      const result = validateToken('hdel_valid_token', expiredRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.TOKEN_EXPIRED);
    });

    it('should reject already used token', () => {
      const usedRequest = {
        ...mockDeleteRequest,
        status: 'approved' as const,
      };

      const result = validateToken('hdel_valid_token', usedRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.TOKEN_ALREADY_USED);
    });

    it('should accept valid token', () => {
      const result = validateToken('hdel_valid_token', mockDeleteRequest);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateTableName', () => {
    it('should accept valid soft delete enabled table', () => {
      const result = validateTableName('users');

      expect(result.valid).toBe(true);
    });

    it('should accept all soft delete enabled tables', () => {
      const tables = [
        'users',
        'mcp_products',
        'raw_ingestion_records_v1',
        'barcodes',
        'prices',
      ];

      tables.forEach((table) => {
        const result = validateTableName(table);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid table name', () => {
      const result = validateTableName('invalid_table');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_TABLE);
      expect(result.message).toContain('invalid_table');
    });

    it('should reject audit_logs table (not soft delete enabled)', () => {
      const result = validateTableName('audit_logs');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_TABLE);
    });
  });

  describe('validateReason', () => {
    it('should accept valid reason', () => {
      const result = validateReason('User requested account deletion per GDPR');

      expect(result.valid).toBe(true);
    });

    it('should reject empty reason', () => {
      const result = validateReason('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_REASON);
    });

    it('should reject reason shorter than 10 characters', () => {
      const result = validateReason('Too short');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_REASON);
    });

    it('should reject whitespace-only reason', () => {
      const result = validateReason('          ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorCodes.INVALID_REASON);
    });

    it('should accept reason with exactly 10 characters', () => {
      const result = validateReason('Ten chars!');

      expect(result.valid).toBe(true);
    });
  });
});

describe('Hard Delete API - Type Guards', () => {
  it('should have correct error codes', () => {
    expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCodes.DUAL_APPROVAL_VIOLATION).toBe('DUAL_APPROVAL_VIOLATION');
    expect(ErrorCodes.INVALID_TOKEN).toBe('INVALID_TOKEN');
    expect(ErrorCodes.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
    expect(ErrorCodes.TOKEN_ALREADY_USED).toBe('TOKEN_ALREADY_USED');
    expect(ErrorCodes.RECORD_NOT_FOUND).toBe('RECORD_NOT_FOUND');
    expect(ErrorCodes.NOT_SOFT_DELETED).toBe('NOT_SOFT_DELETED');
    expect(ErrorCodes.DEPENDENCIES_EXIST).toBe('DEPENDENCIES_EXIST');
    expect(ErrorCodes.EXECUTION_TIMEOUT).toBe('EXECUTION_TIMEOUT');
    expect(ErrorCodes.DUPLICATE_REQUEST).toBe('DUPLICATE_REQUEST');
  });
});

describe('Hard Delete API - Integration Scenarios', () => {
  describe('Dual approval workflow', () => {
    it('should enforce complete dual approval flow', () => {
      const requester = {
        id: 'user-123',
        email: 'admin@foodsense.com',
      };

      const approver = {
        id: 'user-456',
        email: 'dpo@foodsense.com',
      };

      // Step 1: Validate dual approval (should pass)
      const validation = validateDualApproval(
        requester.id,
        requester.email,
        approver.id,
        approver.email
      );

      expect(validation.valid).toBe(true);

      // Step 2: Generate token
      const token = generateApprovalToken();
      expect(token).toBeTruthy();

      // Step 3: Create mock request
      const deleteRequest: DeleteRequest = {
        id: crypto.randomUUID(),
        table_name: 'users',
        record_id: 'user-to-delete',
        requester_id: requester.id,
        requester_email: requester.email,
        approver_id: null,
        approver_email: null,
        status: 'pending_approval',
        reason: 'GDPR Right to Be Forgotten request from verified user',
        urgency: 'normal',
        approval_token: token,
        requested_at: new Date().toISOString(),
        approved_at: null,
        executed_at: null,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Step 4: Validate token (should pass)
      const tokenValidation = validateToken(token, deleteRequest);
      expect(tokenValidation.valid).toBe(true);

      // Step 5: Simulate self-approval attempt (should fail)
      const selfApproval = validateDualApproval(
        requester.id,
        requester.email,
        requester.id,
        requester.email
      );

      expect(selfApproval.valid).toBe(false);
      expect(selfApproval.error).toBe(ErrorCodes.DUAL_APPROVAL_VIOLATION);
    });
  });

  describe('Security enforcement', () => {
    it('should prevent all self-approval variations', () => {
      const userId = 'user-123';
      const userEmail = 'admin@foodsense.com';

      // Same user, same email
      expect(
        validateDualApproval(userId, userEmail, userId, userEmail).valid
      ).toBe(false);

      // Same user, different email (should fail on user ID check)
      expect(
        validateDualApproval(userId, userEmail, userId, 'other@foodsense.com')
          .valid
      ).toBe(false);

      // Different user, same email (should fail on email check)
      expect(
        validateDualApproval(userId, userEmail, 'user-456', userEmail).valid
      ).toBe(false);

      // Different user, different email (should pass)
      expect(
        validateDualApproval(
          userId,
          userEmail,
          'user-456',
          'other@foodsense.com'
        ).valid
      ).toBe(true);
    });
  });
});

describe('Hard Delete API - Supabase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preDeleteSafetyChecks', () => {
    it('should return safe:false when record not found', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      const result = await preDeleteSafetyChecks('users', 'user-123');

      expect(result.safe).toBe(false);
      expect(result.reason).toBe('Record not found');
    });

    it('should return safe:false when record is not soft deleted', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-123', soft_deleted_at: null },
          error: null,
        }),
      });

      const result = await preDeleteSafetyChecks('users', 'user-123');

      expect(result.safe).toBe(false);
      expect(result.reason).toBe('Record must be soft deleted before hard delete');
    });

    it('should return safe:false when cooling period not passed', async () => {
      const recentDeleteTime = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-123', soft_deleted_at: recentDeleteTime },
          error: null,
        }),
      });

      const result = await preDeleteSafetyChecks('users', 'user-123');

      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Wait');
    });

    it('should return safe:true when all checks pass', async () => {
      const oldDeleteTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48 hours ago

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-123', soft_deleted_at: oldDeleteTime },
          error: null,
        }),
      });

      const result = await preDeleteSafetyChecks('users', 'user-123');

      expect(result.safe).toBe(true);
    });
  });

  describe('checkForeignKeyDependencies', () => {
    it('should return hasDependencies:false when no dependencies', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await checkForeignKeyDependencies('users', 'user-123');

      expect(result.hasDependencies).toBe(false);
    });

    it('should return hasDependencies:true when user has products', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockImplementation(function() {
          return Promise.resolve({
            data: [{ id: 'product-1' }, { id: 'product-2' }],
            error: null,
          });
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockChain);

      const result = await checkForeignKeyDependencies('users', 'user-123');

      expect(result.hasDependencies).toBe(true);
      expect(result.dependencies?.[0].table).toBe('mcp_products');
      expect(result.dependencies?.[0].count).toBe(2);
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log and return id', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'audit-123' },
          error: null,
        }),
      });

      const auditLogId = await createAuditLog(
        'op-123',
        'users',
        'user-123',
        'soft_delete',
        'req-123',
        'admin@test.com',
        'completed',
        'Test reason'
      );

      expect(auditLogId).toBe('audit-123');
    });

    it('should throw HardDeleteError on failure', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      });

      await expect(
        createAuditLog(
          'op-123',
          'users',
          'user-123',
          'soft_delete',
          'req-123',
          'admin@test.com',
          'completed',
          'Test reason'
        )
      ).rejects.toThrow(HardDeleteError);
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit logs for entity', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'soft_delete' },
        { id: 'log-2', action: 'hard_delete_requested' },
      ];

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      });

      const result = await getAuditTrail('users', 'user-123');

      expect(result).toEqual(mockLogs);
    });

    it('should throw HardDeleteError on failure', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch failed' },
        }),
      });

      await expect(getAuditTrail('users', 'user-123')).rejects.toThrow(HardDeleteError);
    });
  });

  describe('getOperationAuditTrail', () => {
    it('should return audit logs for operation', async () => {
      const mockLogs = [{ id: 'log-1', operation_id: 'op-123' }];

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
        }),
      });

      const result = await getOperationAuditTrail('op-123');

      expect(result).toEqual(mockLogs);
    });

    it('should throw HardDeleteError on failure', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch failed' },
        }),
      });

      await expect(getOperationAuditTrail('op-123')).rejects.toThrow(HardDeleteError);
    });
  });

  describe('listDeleteRequests', () => {
    it('should list delete requests with filters', async () => {
      const mockRequests = [
        { id: 'req-1', status: 'pending_approval' },
        { id: 'req-2', status: 'pending_approval' },
      ];

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockRequests,
          count: 2,
          error: null,
        }),
      });

      const result = await listDeleteRequests({ status: 'pending_approval' });

      expect(result.requests).toEqual(mockRequests);
      expect(result.total).toBe(2);
    });

    it('should throw HardDeleteError on failure', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          count: null,
          error: { message: 'Fetch failed' },
        }),
      });

      await expect(listDeleteRequests({})).rejects.toThrow(HardDeleteError);
    });
  });

  describe('getDeleteRequest', () => {
    it('should return delete request by id', async () => {
      const mockRequest = { id: 'req-123', status: 'pending_approval' };

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockRequest,
          error: null,
        }),
      });

      const result = await getDeleteRequest('req-123');

      expect(result).toEqual(mockRequest);
    });

    it('should throw HardDeleteError when not found', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(getDeleteRequest('req-123')).rejects.toThrow(HardDeleteError);
    });
  });

  describe('softDeleteRecord', () => {
    it('should throw on invalid table name', async () => {
      await expect(
        softDeleteRecord({
          table_name: 'invalid_table' as any,
          record_id: 'rec-123',
          reason: 'Valid reason here',
          requester_email: 'admin@test.com',
        })
      ).rejects.toThrow(HardDeleteError);
    });

    it('should throw on invalid reason', async () => {
      await expect(
        softDeleteRecord({
          table_name: 'users',
          record_id: 'rec-123',
          reason: 'short',
          requester_email: 'admin@test.com',
        })
      ).rejects.toThrow(HardDeleteError);
    });

    it('should throw when user not authenticated', async () => {
      mockSupabaseAuth.mockResolvedValue({ data: { user: null } });

      await expect(
        softDeleteRecord({
          table_name: 'users',
          record_id: 'rec-123',
          reason: 'Valid reason here',
          requester_email: 'admin@test.com',
        })
      ).rejects.toThrow(HardDeleteError);
    });
  });

  describe('requestHardDelete', () => {
    it('should throw on invalid table name', async () => {
      await expect(
        requestHardDelete({
          table_name: 'invalid_table' as any,
          record_id: 'rec-123',
          reason: 'Valid reason here',
          requester_email: 'admin@test.com',
        })
      ).rejects.toThrow(HardDeleteError);
    });

    it('should throw on invalid reason', async () => {
      await expect(
        requestHardDelete({
          table_name: 'users',
          record_id: 'rec-123',
          reason: 'short',
          requester_email: 'admin@test.com',
        })
      ).rejects.toThrow(HardDeleteError);
    });
  });

  describe('approveHardDelete', () => {
    it('should throw when user not authenticated', async () => {
      mockSupabaseAuth.mockResolvedValue({ data: { user: null } });

      await expect(
        approveHardDelete({
          delete_request_id: 'req-123',
          approval_token: 'hdel_token',
          approver_email: 'approver@test.com',
          approved: true,
        })
      ).rejects.toThrow(HardDeleteError);
    });

    it('should throw when delete request not found', async () => {
      mockSupabaseAuth.mockResolvedValue({ data: { user: { id: 'user-456' } } });
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(
        approveHardDelete({
          delete_request_id: 'req-123',
          approval_token: 'hdel_token',
          approver_email: 'approver@test.com',
          approved: true,
        })
      ).rejects.toThrow(HardDeleteError);
    });
  });

  describe('executeHardDelete', () => {
    it('should throw when approved request not found', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(executeHardDelete('req-123')).rejects.toThrow(HardDeleteError);
    });
  });
});
