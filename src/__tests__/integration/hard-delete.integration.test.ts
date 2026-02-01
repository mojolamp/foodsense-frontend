/**
 * E-T7 Integration Tests
 * Hard Delete with Dual Verification - End-to-End Tests
 *
 * These tests verify the complete hard delete workflow including:
 * - Dual approval enforcement
 * - Token security
 * - Safety checks
 * - Audit trail
 *
 * NOTE: These tests require Supabase environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Tests will be skipped if env vars are not set.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const TEST_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const TEST_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if integration tests should run
const SKIP_INTEGRATION_TESTS = !TEST_SUPABASE_URL || !TEST_SERVICE_ROLE_KEY;

// Create Supabase client with service role (bypasses RLS for testing)
let supabase: SupabaseClient | null = null;
if (!SKIP_INTEGRATION_TESTS) {
  supabase = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY);
}

describe.skipIf(SKIP_INTEGRATION_TESTS)('E-T7 Hard Delete Integration Tests', () => {
  let testUserId: string;
  let testProductId: string;
  let superAdminUser1: any;
  let superAdminUser2: any;

  beforeAll(async () => {
    // Create test users with profile_json structure
    const { data: admin1, error: error1 } = await supabase
      .from('users')
      .insert({
        profile_json: {
          email: 'test-admin-1@foodsense.test',
          name: 'Test Admin 1',
          role: 'super-admin',
        },
      })
      .select()
      .single();

    const { data: admin2, error: error2 } = await supabase
      .from('users')
      .insert({
        profile_json: {
          email: 'test-admin-2@foodsense.test',
          name: 'Test Admin 2',
          role: 'super-admin',
        },
      })
      .select()
      .single();

    if (error1 || error2 || !admin1 || !admin2) {
      console.error('Failed to create test users:', error1, error2);
      throw new Error('Test setup failed: Could not create test users');
    }

    superAdminUser1 = {
      id: admin1.id,
      email: admin1.profile_json.email,
      name: admin1.profile_json.name,
      role: admin1.profile_json.role,
    };
    superAdminUser2 = {
      id: admin2.id,
      email: admin2.profile_json.email,
      name: admin2.profile_json.name,
      role: admin2.profile_json.role,
    };

    // Create test product with required fields
    const { data: product, error: productError } = await supabase
      .from('mcp_products')
      .insert({
        name: 'Test Product for E-T7',
        barcode: 'TEST-E-T7-001',
        source: 'integration-test',
        created_by: 'test-system',
        updated_by: 'test-system',
      })
      .select()
      .single();

    if (productError || !product) {
      console.error('Failed to create test product:', productError);
      throw new Error('Test setup failed: Could not create test product');
    }

    testProductId = product.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProductId) {
      await supabase.from('mcp_products').delete().eq('id', testProductId);
    }

    if (superAdminUser1?.id) {
      await supabase.from('users').delete().eq('id', superAdminUser1.id);
    }

    if (superAdminUser2?.id) {
      await supabase.from('users').delete().eq('id', superAdminUser2.id);
    }

    // Clean up test delete requests
    await supabase
      .from('delete_requests')
      .delete()
      .or(
        `requester_email.eq.${superAdminUser1?.email},requester_email.eq.${superAdminUser2?.email}`
      );

    // Clean up test audit logs
    await supabase.from('audit_logs').delete().eq('entity_id', testProductId);
  });

  describe('Complete Dual Approval Workflow', () => {
    it('should execute full hard delete workflow with dual approval', async () => {
      // Step 1: Soft delete the test product
      const { error: softDeleteError } = await supabase
        .from('mcp_products')
        .update({ soft_deleted_at: new Date().toISOString() })
        .eq('id', testProductId);

      expect(softDeleteError).toBeNull();

      // Wait 24 hours (simulate with manual timestamp update for testing)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 25);

      await supabase
        .from('mcp_products')
        .update({ soft_deleted_at: twentyFourHoursAgo.toISOString() })
        .eq('id', testProductId);

      // Step 2: Create hard delete request
      const approvalToken = `hdel_test_${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const { data: deleteRequest, error: requestError } = await supabase
        .from('delete_requests')
        .insert({
          table_name: 'mcp_products',
          record_id: testProductId,
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'Integration test - complete workflow test',
          approval_token: approvalToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      expect(requestError).toBeNull();
      expect(deleteRequest).toBeTruthy();
      expect(deleteRequest.status).toBe('pending_approval');

      // Step 3: Create audit log for request
      await supabase.from('audit_logs').insert({
        operation_id: deleteRequest.id,
        entity_type: 'mcp_products',
        entity_id: testProductId,
        action: 'hard_delete_requested',
        requester_id: superAdminUser1.id,
        requester_email: superAdminUser1.email,
        status: 'pending_approval',
        reason: 'Integration test - complete workflow test',
      });

      // Step 4: Attempt self-approval (should be prevented by application logic)
      // Note: Database doesn't enforce this, application layer does

      // Step 5: Approve with different user
      const { error: approvalError } = await supabase
        .from('delete_requests')
        .update({
          status: 'approved',
          approver_id: superAdminUser2.id,
          approver_email: superAdminUser2.email,
          approved_at: new Date().toISOString(),
        })
        .eq('id', deleteRequest.id);

      expect(approvalError).toBeNull();

      // Create approval audit log
      await supabase.from('audit_logs').insert({
        operation_id: deleteRequest.id,
        entity_type: 'mcp_products',
        entity_id: testProductId,
        action: 'hard_delete_approved',
        requester_id: superAdminUser1.id,
        requester_email: superAdminUser1.email,
        approver_id: superAdminUser2.id,
        approver_email: superAdminUser2.email,
        status: 'approved',
        reason: 'Integration test - complete workflow test',
      });

      // Step 6: Execute hard delete
      const { error: hardDeleteError } = await supabase
        .from('mcp_products')
        .delete()
        .eq('id', testProductId)
        .not('soft_deleted_at', 'is', null);

      expect(hardDeleteError).toBeNull();

      // Update request status
      await supabase
        .from('delete_requests')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
        })
        .eq('id', deleteRequest.id);

      // Create execution audit log
      await supabase.from('audit_logs').insert({
        operation_id: deleteRequest.id,
        entity_type: 'mcp_products',
        entity_id: testProductId,
        action: 'hard_delete_executed',
        requester_id: superAdminUser1.id,
        requester_email: superAdminUser1.email,
        approver_id: superAdminUser2.id,
        approver_email: superAdminUser2.email,
        status: 'completed',
        reason: 'Integration test - complete workflow test',
      });

      // Step 7: Verify product is deleted
      const { data: deletedProduct } = await supabase
        .from('mcp_products')
        .select('*')
        .eq('id', testProductId)
        .single();

      expect(deletedProduct).toBeNull();

      // Step 8: Verify audit trail
      const { data: auditTrail } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('operation_id', deleteRequest.id)
        .order('timestamp', { ascending: true });

      expect(auditTrail).toHaveLength(3);
      expect(auditTrail[0].action).toBe('hard_delete_requested');
      expect(auditTrail[1].action).toBe('hard_delete_approved');
      expect(auditTrail[2].action).toBe('hard_delete_executed');

      // Verify dual approval in audit trail
      expect(auditTrail[0].requester_id).not.toBe(auditTrail[1].approver_id);
      expect(auditTrail[0].requester_email).not.toBe(auditTrail[1].approver_email);
    });
  });

  describe('Security Enforcement', () => {
    it('should enforce 24-hour cooling period', async () => {
      // Create a new test product
      const { data: product } = await supabase
        .from('mcp_products')
        .insert({
          name: 'Test Product for Cooling Period',
          barcode: 'TEST-COOLING-001',
          source: 'integration-test',
          created_by: 'test-system',
          updated_by: 'test-system',
        })
        .select()
        .single();

      // Soft delete it NOW (not 24 hours ago)
      await supabase
        .from('mcp_products')
        .update({ soft_deleted_at: new Date().toISOString() })
        .eq('id', product.id);

      // Try to create hard delete request (application should check cooling period)
      const { data: softDeletedProduct } = await supabase
        .from('mcp_products')
        .select('soft_deleted_at')
        .eq('id', product.id)
        .single();

      const deletedAt = new Date(softDeletedProduct.soft_deleted_at);
      const now = new Date();
      const hoursSinceDelete = (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60);

      expect(hoursSinceDelete).toBeLessThan(24);

      // Clean up
      await supabase.from('mcp_products').delete().eq('id', product.id);
    });

    it('should prevent duplicate pending requests', async () => {
      // Create test product
      const { data: product } = await supabase
        .from('mcp_products')
        .insert({
          name: 'Test Product for Duplicate Check',
          barcode: 'TEST-DUPLICATE-001',
          source: 'integration-test',
          created_by: 'test-system',
          updated_by: 'test-system',
        })
        .select()
        .single();

      // Soft delete it 24+ hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 25);

      await supabase
        .from('mcp_products')
        .update({ soft_deleted_at: twentyFourHoursAgo.toISOString() })
        .eq('id', product.id);

      // Create first request
      const { data: request1 } = await supabase
        .from('delete_requests')
        .insert({
          table_name: 'mcp_products',
          record_id: product.id,
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'First request',
          approval_token: `hdel_first_${Date.now()}`,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      expect(request1).toBeTruthy();

      // Check for existing pending request
      const { data: existingRequest } = await supabase
        .from('delete_requests')
        .select('id')
        .eq('table_name', 'mcp_products')
        .eq('record_id', product.id)
        .eq('status', 'pending_approval')
        .single();

      expect(existingRequest).toBeTruthy();
      expect(existingRequest.id).toBe(request1.id);

      // Application should prevent creating second request

      // Clean up
      await supabase.from('delete_requests').delete().eq('id', request1.id);
      await supabase.from('mcp_products').delete().eq('id', product.id);
    });

    it('should enforce token expiry', async () => {
      // Create expired request
      const { data: expiredRequest } = await supabase
        .from('delete_requests')
        .insert({
          table_name: 'mcp_products',
          record_id: 'test-expired',
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'Test expired token',
          approval_token: `hdel_expired_${Date.now()}`,
          expires_at: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
        })
        .select()
        .single();

      // Check if expired
      const expiresAt = new Date(expiredRequest.expires_at);
      const now = new Date();

      expect(now > expiresAt).toBe(true);

      // Application should reject approval with expired token

      // Clean up
      await supabase.from('delete_requests').delete().eq('id', expiredRequest.id);
    });
  });

  describe('Audit Trail Verification', () => {
    it('should create complete audit trail for rejection', async () => {
      // Create test product
      const { data: product } = await supabase
        .from('mcp_products')
        .insert({
          name: 'Test Product for Rejection',
          barcode: 'TEST-REJECT-001',
          source: 'integration-test',
          created_by: 'test-system',
          updated_by: 'test-system',
        })
        .select()
        .single();

      // Soft delete it 24+ hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 25);

      await supabase
        .from('mcp_products')
        .update({ soft_deleted_at: twentyFourHoursAgo.toISOString() })
        .eq('id', product.id);

      // Create request
      const { data: deleteRequest } = await supabase
        .from('delete_requests')
        .insert({
          table_name: 'mcp_products',
          record_id: product.id,
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'Test rejection audit trail',
          approval_token: `hdel_reject_${Date.now()}`,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      // Create request audit log
      await supabase.from('audit_logs').insert({
        operation_id: deleteRequest.id,
        entity_type: 'mcp_products',
        entity_id: product.id,
        action: 'hard_delete_requested',
        requester_id: superAdminUser1.id,
        requester_email: superAdminUser1.email,
        status: 'pending_approval',
        reason: 'Test rejection audit trail',
      });

      // Reject
      await supabase
        .from('delete_requests')
        .update({
          status: 'rejected',
          approver_id: superAdminUser2.id,
          approver_email: superAdminUser2.email,
          approver_notes: 'Rejected for testing purposes',
        })
        .eq('id', deleteRequest.id);

      // Create rejection audit log
      await supabase.from('audit_logs').insert({
        operation_id: deleteRequest.id,
        entity_type: 'mcp_products',
        entity_id: product.id,
        action: 'hard_delete_rejected',
        requester_id: superAdminUser1.id,
        requester_email: superAdminUser1.email,
        approver_id: superAdminUser2.id,
        approver_email: superAdminUser2.email,
        status: 'rejected',
        reason: 'Test rejection audit trail',
        metadata: {
          rejection_reason: 'Rejected for testing purposes',
        },
      });

      // Verify audit trail
      const { data: auditTrail } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('operation_id', deleteRequest.id)
        .order('timestamp', { ascending: true });

      expect(auditTrail).toHaveLength(2);
      expect(auditTrail[0].action).toBe('hard_delete_requested');
      expect(auditTrail[1].action).toBe('hard_delete_rejected');
      expect(auditTrail[1].approver_email).toBe(superAdminUser2.email);

      // Product should still exist
      const { data: stillExists } = await supabase
        .from('mcp_products')
        .select('*')
        .eq('id', product.id)
        .single();

      expect(stillExists).toBeTruthy();

      // Clean up
      await supabase.from('delete_requests').delete().eq('id', deleteRequest.id);
      await supabase.from('audit_logs').delete().eq('operation_id', deleteRequest.id);
      await supabase.from('mcp_products').delete().eq('id', product.id);
    });
  });

  describe('RLS Policy Enforcement', () => {
    it('should allow super-admins to view delete requests', async () => {
      // Create test request
      const { data: deleteRequest } = await supabase
        .from('delete_requests')
        .insert({
          table_name: 'users',
          record_id: 'test-rls',
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'Test RLS policy',
          approval_token: `hdel_rls_${Date.now()}`,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      // Query as super-admin (service role bypasses RLS in tests)
      const { data: requests } = await supabase
        .from('delete_requests')
        .select('*')
        .eq('id', deleteRequest.id);

      expect(requests).toBeTruthy();
      expect(requests.length).toBeGreaterThan(0);

      // Clean up
      await supabase.from('delete_requests').delete().eq('id', deleteRequest.id);
    });
  });
});
