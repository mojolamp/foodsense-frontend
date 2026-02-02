/**
 * E-T7 API Integration Tests
 * Tests all 5 API endpoints for hard delete feature
 *
 * @module __tests__/api/hard-delete-api.test
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Check if integration tests should run
const SKIP_INTEGRATION_TESTS = !TEST_SUPABASE_URL || !TEST_SERVICE_ROLE_KEY;

// Create Supabase client only if env vars exist
let supabase: SupabaseClient | null = null;
if (!SKIP_INTEGRATION_TESTS) {
  supabase = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY);
}

describe.skipIf(SKIP_INTEGRATION_TESTS)('E-T7 API Integration Tests', () => {
  let testProductId: string;
  let superAdminUser1: any;
  let superAdminUser2: any;
  let deleteRequestId: string;
  let approvalToken: string;

  // Non-null assertion: supabase is guaranteed to exist when tests run
  // (tests are skipped if SKIP_INTEGRATION_TESTS is true)
  const getSupabase = () => supabase!;

  beforeAll(async () => {
    // Create test users
    const { data: admin1, error: error1 } = await getSupabase()
      .from('users')
      .insert({
        profile_json: {
          email: 'api-test-admin-1@foodsense.test',
          name: 'API Test Admin 1',
          role: 'super-admin',
        },
      })
      .select()
      .single();

    const { data: admin2, error: error2 } = await getSupabase()
      .from('users')
      .insert({
        profile_json: {
          email: 'api-test-admin-2@foodsense.test',
          name: 'API Test Admin 2',
          role: 'super-admin',
        },
      })
      .select()
      .single();

    if (error1 || error2 || !admin1 || !admin2) {
      throw new Error('Failed to create test users');
    }

    superAdminUser1 = {
      id: admin1.id,
      email: admin1.profile_json.email,
    };
    superAdminUser2 = {
      id: admin2.id,
      email: admin2.profile_json.email,
    };

    // Create test product
    const { data: product, error: productError } = await getSupabase()
      .from('mcp_products')
      .insert({
        name: 'API Test Product',
        barcode: 'API-TEST-001',
        source: 'api-test',
        created_by: 'test-system',
        updated_by: 'test-system',
      })
      .select()
      .single();

    if (productError || !product) {
      throw new Error('Failed to create test product');
    }

    testProductId = product.id;
  });

  afterAll(async () => {
    // Clean up
    if (testProductId) {
      await getSupabase().from('mcp_products').delete().eq('id', testProductId);
    }
    if (superAdminUser1?.id) {
      await getSupabase().from('users').delete().eq('id', superAdminUser1.id);
    }
    if (superAdminUser2?.id) {
      await getSupabase().from('users').delete().eq('id', superAdminUser2.id);
    }
    if (deleteRequestId) {
      await getSupabase().from('delete_requests').delete().eq('id', deleteRequestId);
    }
  });

  describe('API Endpoint 1: POST /api/v1/admin/delete/soft', () => {
    it('should soft delete a record successfully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/soft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'mcp_products',
          record_id: testProductId,
          reason: 'API test soft delete',
          requester_email: superAdminUser1.email,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.operation_id).toBeTruthy();
      expect(data.soft_deleted_at).toBeTruthy();

      // Verify in database
      const { data: product } = await getSupabase()
        .from('mcp_products')
        .select('soft_deleted_at')
        .eq('id', testProductId)
        .single();

      expect(product?.soft_deleted_at).toBeTruthy();
    });

    it('should reject invalid table name', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/soft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'invalid_table',
          record_id: 'test-123',
          reason: 'Test invalid table',
          requester_email: superAdminUser1.email,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INVALID_TABLE');
    });

    it('should reject short reason', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/soft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'mcp_products',
          record_id: testProductId,
          reason: 'Short',
          requester_email: superAdminUser1.email,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INVALID_REASON');
    });
  });

  describe('API Endpoint 2: POST /api/v1/admin/delete/hard/request', () => {
    it('should create hard delete request successfully', async () => {
      // Backdate soft_deleted_at to 24+ hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 25);

      await getSupabase()
        .from('mcp_products')
        .update({ soft_deleted_at: twentyFourHoursAgo.toISOString() })
        .eq('id', testProductId);

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/hard/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'mcp_products',
          record_id: testProductId,
          reason: 'API test hard delete request',
          urgency: 'normal',
          requester_notes: 'Testing hard delete API',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.request_id).toBeTruthy();
      expect(data.approval_token).toBeTruthy();
      expect(data.approval_token).toMatch(/^hdel_/);
      expect(data.expires_at).toBeTruthy();

      // Save for later tests
      deleteRequestId = data.request_id;
      approvalToken = data.approval_token;

      // Verify in database
      const { data: request } = await getSupabase()
        .from('delete_requests')
        .select('*')
        .eq('id', deleteRequestId)
        .single();

      expect(request?.status).toBe('pending_approval');
      expect(request?.requester_id).toBe(superAdminUser1.id);
    });

    it('should reject request without soft delete', async () => {
      // Create new product without soft delete
      const { data: product } = await getSupabase()
        .from('mcp_products')
        .insert({
          name: 'Not Soft Deleted Product',
          barcode: 'NOT-SOFT-DELETED-001',
          source: 'api-test',
          created_by: 'test-system',
          updated_by: 'test-system',
        })
        .select()
        .single();

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/hard/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'mcp_products',
          record_id: product.id,
          reason: 'Test not soft deleted',
          urgency: 'normal',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('NOT_SOFT_DELETED');

      // Clean up
      await getSupabase().from('mcp_products').delete().eq('id', product.id);
    });

    it('should reject duplicate pending request', async () => {
      // Try to create another request for same product
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/hard/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          table_name: 'mcp_products',
          record_id: testProductId,
          reason: 'Duplicate request test',
          urgency: 'normal',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('DUPLICATE_REQUEST');
      expect(data.existing_request_id).toBe(deleteRequestId);
    });
  });

  describe('API Endpoint 3: POST /api/v1/admin/delete/hard/approve', () => {
    it('should approve hard delete request successfully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/hard/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          request_id: deleteRequestId,
          approval_token: approvalToken,
          action: 'approve',
          approver_notes: 'API test approval',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.request_id).toBe(deleteRequestId);
      expect(data.status).toBe('approved');
      expect(data.executed_at).toBeTruthy();

      // Verify in database
      const { data: request } = await getSupabase()
        .from('delete_requests')
        .select('*')
        .eq('id', deleteRequestId)
        .single();

      expect(request?.status).toBe('executed');
      expect(request?.approver_id).toBe(superAdminUser2.id);

      // Verify product deleted
      const { data: product } = await getSupabase()
        .from('mcp_products')
        .select('*')
        .eq('id', testProductId)
        .single();

      expect(product).toBeNull();

      // Verify audit trail
      const { data: auditTrail } = await getSupabase()
        .from('audit_logs')
        .select('*')
        .eq('operation_id', deleteRequestId)
        .order('timestamp', { ascending: true });

      expect(auditTrail?.length).toBeGreaterThanOrEqual(2);
      expect(auditTrail?.[0].action).toBe('hard_delete_requested');
    });

    it('should reject invalid token', async () => {
      // Create new request for testing
      const { data: product } = await getSupabase()
        .from('mcp_products')
        .insert({
          name: 'Invalid Token Test Product',
          barcode: 'INVALID-TOKEN-001',
          source: 'api-test',
          created_by: 'test-system',
          updated_by: 'test-system',
          soft_deleted_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      const { data: request } = await getSupabase()
        .from('delete_requests')
        .insert({
          table_name: 'mcp_products',
          record_id: product.id,
          requester_id: superAdminUser1.id,
          requester_email: superAdminUser1.email,
          status: 'pending_approval',
          reason: 'Invalid token test',
          approval_token: 'hdel_valid_token_123',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/delete/hard/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          request_id: request.id,
          approval_token: 'hdel_wrong_token',
          action: 'approve',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('INVALID_TOKEN');

      // Clean up
      await getSupabase().from('delete_requests').delete().eq('id', request.id);
      await getSupabase().from('mcp_products').delete().eq('id', product.id);
    });
  });

  describe('API Endpoint 4: GET /api/v1/admin/delete/requests', () => {
    it('should list delete requests', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests?status=executed`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.requests)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(0);
      expect(data.limit).toBeDefined();
      expect(data.offset).toBeDefined();
    });

    it('should filter by table name', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests?table_name=mcp_products`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // All returned requests should be for mcp_products
      if (data.requests.length > 0) {
        data.requests.forEach((req: any) => {
          expect(req.table_name).toBe('mcp_products');
        });
      }
    });

    it('should support pagination', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests?limit=5&offset=0`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.requests.length).toBeLessThanOrEqual(5);
      expect(data.limit).toBe(5);
      expect(data.offset).toBe(0);
    });
  });

  describe('API Endpoint 5: GET /api/v1/admin/delete/requests/[id]', () => {
    it('should get request details with audit trail', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests/${deleteRequestId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.request).toBeDefined();
      expect(data.request.id).toBe(deleteRequestId);
      expect(data.request.status).toBe('executed');
      expect(data.audit_trail).toBeDefined();
      expect(Array.isArray(data.audit_trail)).toBe(true);
      expect(data.audit_trail.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 404 for non-existent request', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests/${fakeId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('RECORD_NOT_FOUND');
    });
  });

  describe('Cross-Functional: Complete Workflow', () => {
    it('should execute complete workflow end-to-end', async () => {
      // Create test product
      const { data: product } = await getSupabase()
        .from('mcp_products')
        .insert({
          name: 'Workflow Test Product',
          barcode: 'WORKFLOW-001',
          source: 'api-test',
          created_by: 'test-system',
          updated_by: 'test-system',
        })
        .select()
        .single();

      // 1. Soft delete
      const softDeleteResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/soft`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            table_name: 'mcp_products',
            record_id: product.id,
            reason: 'Workflow test soft delete',
            requester_email: superAdminUser1.email,
          }),
        }
      );

      expect(softDeleteResponse.status).toBe(200);

      // Backdate soft_deleted_at
      await getSupabase()
        .from('mcp_products')
        .update({
          soft_deleted_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', product.id);

      // 2. Request hard delete
      const requestResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/hard/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            table_name: 'mcp_products',
            record_id: product.id,
            reason: 'Workflow test hard delete',
            urgency: 'normal',
          }),
        }
      );

      expect(requestResponse.status).toBe(201);
      const requestData = await requestResponse.json();

      // 3. List requests (should include our request)
      const listResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests?status=pending_approval`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      expect(listResponse.status).toBe(200);
      const listData = await listResponse.json();
      const ourRequest = listData.requests.find(
        (r: any) => r.id === requestData.request_id
      );
      expect(ourRequest).toBeDefined();

      // 4. Get request details
      const detailsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/requests/${requestData.request_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
        }
      );

      expect(detailsResponse.status).toBe(200);
      const detailsData = await detailsResponse.json();
      expect(detailsData.request.status).toBe('pending_approval');

      // 5. Approve
      const approveResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/delete/hard/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            request_id: requestData.request_id,
            approval_token: requestData.approval_token,
            action: 'approve',
            approver_notes: 'Workflow test approval',
          }),
        }
      );

      expect(approveResponse.status).toBe(200);

      // 6. Verify product deleted
      const { data: deletedProduct } = await getSupabase()
        .from('mcp_products')
        .select('*')
        .eq('id', product.id)
        .single();

      expect(deletedProduct).toBeNull();

      // Clean up request
      await getSupabase()
        .from('delete_requests')
        .delete()
        .eq('id', requestData.request_id);
    });
  });
});
