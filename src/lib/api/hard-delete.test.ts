/**
 * Hard Delete API Tests
 * Epic E Task E-T7: Hard delete with dual verification
 *
 * @module lib/api/hard-delete.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateDualApproval,
  validateToken,
  validateTableName,
  validateReason,
  generateApprovalToken,
  ErrorCodes,
  type DeleteRequest,
} from './hard-delete';

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
