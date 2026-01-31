/**
 * Hard Delete API Library
 * Epic E Task E-T7: Hard delete with dual verification
 *
 * This library provides utilities for managing hard delete operations
 * with dual approval workflow.
 *
 * @module lib/api/hard-delete
 */

import { createClient } from '@/lib/supabase/client';
import { SOFT_DELETE_ENABLED_TABLES, type SoftDeleteEnabledTable } from '@/lib/supabase/soft-delete';
import { randomBytes } from 'crypto';

// ============================================
// Type Definitions
// ============================================

export type DeleteRequestStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'expired';

export type AuditAction =
  | 'soft_delete'
  | 'soft_delete_restore'
  | 'hard_delete_requested'
  | 'hard_delete_approved'
  | 'hard_delete_rejected'
  | 'hard_delete_executed'
  | 'hard_delete_failed';

export type AuditStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed';

export interface DeleteRequest {
  id: string;
  table_name: string;
  record_id: string;
  requester_id: string; // UUID from Supabase auth
  requester_email: string;
  approver_id: string | null; // UUID from Supabase auth
  approver_email: string | null;
  status: DeleteRequestStatus;
  reason: string;
  urgency: 'normal' | 'urgent';
  approval_token: string;
  requester_notes?: string;
  approver_notes?: string;
  requested_at: string;
  approved_at: string | null;
  executed_at: string | null;
  expires_at: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  operation_id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  requester_id: number | null; // BIGINT in database
  requester_email: string;
  approver_id: number | null; // BIGINT in database
  approver_email: string | null;
  status: AuditStatus;
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SoftDeleteRequest {
  table_name: SoftDeleteEnabledTable;
  record_id: string;
  reason: string;
  requester_email: string;
}

export interface SoftDeleteResponse {
  success: boolean;
  operation_id: string;
  table_name: string;
  record_id: string;
  deleted_at: string;
  requester: string;
  audit_log_id: string;
}

export interface HardDeleteRequest {
  table_name: SoftDeleteEnabledTable;
  record_id: string;
  reason: string;
  requester_email: string;
  urgency?: 'normal' | 'urgent';
}

export interface HardDeleteRequestResponse {
  success: boolean;
  delete_request_id: string;
  status: 'pending_approval';
  table_name: string;
  record_id: string;
  requester: string;
  requested_at: string;
  approval_token: string;
  expires_at: string;
  audit_log_id: string;
}

export interface HardDeleteApprovalRequest {
  delete_request_id: string;
  approval_token: string;
  approver_email: string;
  approved: boolean;
  approver_notes?: string;
}

export interface HardDeleteApprovalResponse {
  success: boolean;
  delete_request_id: string;
  status: 'approved' | 'rejected';
  table_name: string;
  record_id: string;
  requester: string;
  approver: string;
  approved_at?: string;
  rejected_at?: string;
  will_execute_at?: string;
  rejection_reason?: string;
  audit_log_id: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
}

export interface DependencyCheckResult {
  hasDependencies: boolean;
  dependencies?: Array<{
    table: string;
    count: number;
    action: string;
  }>;
  message?: string;
}

export interface ExecutionResult {
  success: boolean;
  error?: string;
  rows_deleted?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// ============================================
// Error Types
// ============================================

export class HardDeleteError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'HardDeleteError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DUAL_APPROVAL_VIOLATION: 'DUAL_APPROVAL_VIOLATION',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_ALREADY_USED: 'TOKEN_ALREADY_USED',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  NOT_SOFT_DELETED: 'NOT_SOFT_DELETED',
  DEPENDENCIES_EXIST: 'DEPENDENCIES_EXIST',
  EXECUTION_TIMEOUT: 'EXECUTION_TIMEOUT',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  INVALID_TABLE: 'INVALID_TABLE',
  INVALID_REASON: 'INVALID_REASON',
} as const;

// ============================================
// Validation Functions
// ============================================

/**
 * Validate dual approval requirement
 * Ensures requester and approver are different people
 */
export function validateDualApproval(
  requesterId: string,
  requesterEmail: string,
  approverId: string,
  approverEmail: string
): ValidationResult {
  // Email check (case-insensitive)
  if (requesterEmail.toLowerCase() === approverEmail.toLowerCase()) {
    return {
      valid: false,
      error: ErrorCodes.DUAL_APPROVAL_VIOLATION,
      message: 'Approver cannot be the same person as requester (email match)',
    };
  }

  // User ID check
  if (requesterId === approverId) {
    return {
      valid: false,
      error: ErrorCodes.DUAL_APPROVAL_VIOLATION,
      message: 'Approver cannot be the same person as requester (user ID match)',
    };
  }

  return { valid: true };
}

/**
 * Generate cryptographically secure approval token
 */
export function generateApprovalToken(): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use crypto.getRandomValues
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Buffer.from(array).toString('base64url');
    return `hdel_${token}`;
  } else {
    // Node environment - use crypto.randomBytes
    const token = randomBytes(32).toString('base64url');
    return `hdel_${token}`;
  }
}

/**
 * Validate approval token
 */
export function validateToken(
  token: string,
  deleteRequest: DeleteRequest
): ValidationResult {
  // Check token match
  if (token !== deleteRequest.approval_token) {
    return {
      valid: false,
      error: ErrorCodes.INVALID_TOKEN,
      message: 'Invalid approval token',
    };
  }

  // Check expiry
  if (new Date() > new Date(deleteRequest.expires_at)) {
    return {
      valid: false,
      error: ErrorCodes.TOKEN_EXPIRED,
      message: 'Approval token has expired',
    };
  }

  // Check not already used
  if (deleteRequest.status !== 'pending_approval') {
    return {
      valid: false,
      error: ErrorCodes.TOKEN_ALREADY_USED,
      message: 'Approval token has already been used',
    };
  }

  return { valid: true };
}

/**
 * Validate table name is soft delete enabled
 */
export function validateTableName(tableName: string): ValidationResult {
  if (!SOFT_DELETE_ENABLED_TABLES.includes(tableName as any)) {
    return {
      valid: false,
      error: ErrorCodes.INVALID_TABLE,
      message: `Table "${tableName}" does not support soft delete`,
    };
  }

  return { valid: true };
}

/**
 * Validate reason length and content
 */
export function validateReason(reason: string): ValidationResult {
  if (!reason || reason.trim().length < 10) {
    return {
      valid: false,
      error: ErrorCodes.INVALID_REASON,
      message: 'Reason must be at least 10 characters',
    };
  }

  return { valid: true };
}

// ============================================
// Safety Check Functions
// ============================================

/**
 * Perform pre-delete safety checks
 * Verifies record exists and is soft deleted with cooling period
 */
export async function preDeleteSafetyChecks(
  tableName: string,
  recordId: string
): Promise<SafetyCheckResult> {
  const supabase = createClient();

  // Check 1: Record must exist
  const { data: record, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', recordId)
    .single();

  if (error || !record) {
    return { safe: false, reason: 'Record not found' };
  }

  // Check 2: Record must be soft deleted already
  if (!record.soft_deleted_at) {
    return {
      safe: false,
      reason: 'Record must be soft deleted before hard delete',
    };
  }

  // Check 3: Soft delete must be at least 24 hours old (cooling period)
  const deletedAt = new Date(record.soft_deleted_at);
  const now = new Date();
  const hoursSinceDelete =
    (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceDelete < 24) {
    return {
      safe: false,
      reason: `Record soft deleted ${hoursSinceDelete.toFixed(1)}h ago. Wait ${(24 - hoursSinceDelete).toFixed(1)}h before hard delete.`,
    };
  }

  return { safe: true };
}

/**
 * Check for foreign key dependencies
 * Prevents deletion if related active records exist
 */
export async function checkForeignKeyDependencies(
  tableName: string,
  recordId: string
): Promise<DependencyCheckResult> {
  const supabase = createClient();
  const dependencies: Array<{ table: string; count: number; action: string }> = [];

  // Example: Before deleting user, check related records
  if (tableName === 'users') {
    // Check products created by user
    const { data: products } = await supabase
      .from('mcp_products')
      .select('id')
      .eq('created_by', recordId)
      .is('soft_deleted_at', null);

    if (products && products.length > 0) {
      dependencies.push({
        table: 'mcp_products',
        count: products.length,
        action: 'Must soft delete all user products first',
      });
    }

    // Check API keys owned by user
    const { data: apiKeys } = await supabase
      .from('service_api_keys')
      .select('id')
      .eq('user_id', recordId)
      .is('soft_deleted_at', null);

    if (apiKeys && apiKeys.length > 0) {
      dependencies.push({
        table: 'service_api_keys',
        count: apiKeys.length,
        action: 'Must revoke all user API keys first',
      });
    }
  }

  if (dependencies.length > 0) {
    return {
      hasDependencies: true,
      dependencies,
      message: 'Cannot hard delete: active dependencies exist',
    };
  }

  return { hasDependencies: false };
}

// ============================================
// Audit Logging Functions
// ============================================

/**
 * Create audit log entry
 */
export async function createAuditLog(
  operationId: string,
  entityType: string,
  entityId: string,
  action: AuditAction,
  requesterId: string,
  requesterEmail: string,
  status: AuditStatus,
  reason: string,
  approverId?: string,
  approverEmail?: string,
  metadata?: Record<string, any>
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      operation_id: operationId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      requester_id: requesterId,
      requester_email: requesterEmail,
      approver_id: approverId || null,
      approver_email: approverEmail || null,
      status,
      reason,
      metadata: metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    throw new HardDeleteError(
      'AUDIT_LOG_FAILED',
      'Failed to create audit log',
      { error }
    );
  }

  return data.id;
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(
  entityType: string,
  entityId: string
): Promise<AuditLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new HardDeleteError(
      'AUDIT_FETCH_FAILED',
      'Failed to fetch audit trail',
      { error }
    );
  }

  return data || [];
}

/**
 * Get audit trail for a delete operation
 */
export async function getOperationAuditTrail(
  operationId: string
): Promise<AuditLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('operation_id', operationId)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new HardDeleteError(
      'AUDIT_FETCH_FAILED',
      'Failed to fetch operation audit trail',
      { error }
    );
  }

  return data || [];
}

// ============================================
// Delete Request Functions
// ============================================

/**
 * Soft delete a record
 */
export async function softDeleteRecord(
  request: SoftDeleteRequest
): Promise<SoftDeleteResponse> {
  const supabase = createClient();

  // Validate table
  const tableValidation = validateTableName(request.table_name);
  if (!tableValidation.valid) {
    throw new HardDeleteError(
      tableValidation.error!,
      tableValidation.message!
    );
  }

  // Validate reason
  const reasonValidation = validateReason(request.reason);
  if (!reasonValidation.valid) {
    throw new HardDeleteError(
      reasonValidation.error!,
      reasonValidation.message!
    );
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new HardDeleteError(ErrorCodes.UNAUTHORIZED, 'User not authenticated');
  }

  const operationId = crypto.randomUUID();

  // Execute soft delete
  const { error: deleteError } = await supabase
    .from(request.table_name)
    .update({ soft_deleted_at: new Date().toISOString() })
    .eq('id', request.record_id)
    .is('soft_deleted_at', null);

  if (deleteError) {
    throw new HardDeleteError(
      'SOFT_DELETE_FAILED',
      'Failed to soft delete record',
      { error: deleteError }
    );
  }

  // Create audit log
  const auditLogId = await createAuditLog(
    operationId,
    request.table_name,
    request.record_id,
    'soft_delete',
    user.id,
    request.requester_email,
    'completed',
    request.reason,
    undefined,
    undefined,
    { soft_deleted_at: new Date().toISOString() }
  );

  return {
    success: true,
    operation_id: operationId,
    table_name: request.table_name,
    record_id: request.record_id,
    deleted_at: new Date().toISOString(),
    requester: request.requester_email,
    audit_log_id: auditLogId,
  };
}

/**
 * Request hard delete (Step 1 of dual approval)
 */
export async function requestHardDelete(
  request: HardDeleteRequest
): Promise<HardDeleteRequestResponse> {
  const supabase = createClient();

  // Validate table
  const tableValidation = validateTableName(request.table_name);
  if (!tableValidation.valid) {
    throw new HardDeleteError(
      tableValidation.error!,
      tableValidation.message!
    );
  }

  // Validate reason
  const reasonValidation = validateReason(request.reason);
  if (!reasonValidation.valid) {
    throw new HardDeleteError(
      reasonValidation.error!,
      reasonValidation.message!
    );
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new HardDeleteError(ErrorCodes.UNAUTHORIZED, 'User not authenticated');
  }

  // Pre-delete safety checks
  const safetyCheck = await preDeleteSafetyChecks(
    request.table_name,
    request.record_id
  );
  if (!safetyCheck.safe) {
    throw new HardDeleteError(
      ErrorCodes.NOT_SOFT_DELETED,
      safetyCheck.reason!
    );
  }

  // Check for duplicate pending requests
  const { data: existingRequest } = await supabase
    .from('delete_requests')
    .select('id')
    .eq('table_name', request.table_name)
    .eq('record_id', request.record_id)
    .eq('status', 'pending_approval')
    .single();

  if (existingRequest) {
    throw new HardDeleteError(
      ErrorCodes.DUPLICATE_REQUEST,
      'A pending delete request already exists for this record'
    );
  }

  // Generate approval token
  const approvalToken = generateApprovalToken();

  // Calculate expiry (48 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const deleteRequestId = crypto.randomUUID();

  // Create delete request
  const { error: createError } = await supabase
    .from('delete_requests')
    .insert({
      id: deleteRequestId,
      table_name: request.table_name,
      record_id: request.record_id,
      requester_id: user.id,
      requester_email: request.requester_email,
      status: 'pending_approval',
      reason: request.reason,
      urgency: request.urgency || 'normal',
      approval_token: approvalToken,
      expires_at: expiresAt.toISOString(),
    });

  if (createError) {
    throw new HardDeleteError(
      'REQUEST_CREATION_FAILED',
      'Failed to create delete request',
      { error: createError }
    );
  }

  // Create audit log
  const auditLogId = await createAuditLog(
    deleteRequestId,
    request.table_name,
    request.record_id,
    'hard_delete_requested',
    user.id,
    request.requester_email,
    'pending_approval',
    request.reason,
    undefined,
    undefined,
    {
      delete_request_id: deleteRequestId,
      approval_token: approvalToken,
      expires_at: expiresAt.toISOString(),
    }
  );

  return {
    success: true,
    delete_request_id: deleteRequestId,
    status: 'pending_approval',
    table_name: request.table_name,
    record_id: request.record_id,
    requester: request.requester_email,
    requested_at: new Date().toISOString(),
    approval_token: approvalToken,
    expires_at: expiresAt.toISOString(),
    audit_log_id: auditLogId,
  };
}

/**
 * Approve or reject hard delete (Step 2 of dual approval)
 */
export async function approveHardDelete(
  request: HardDeleteApprovalRequest
): Promise<HardDeleteApprovalResponse> {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new HardDeleteError(ErrorCodes.UNAUTHORIZED, 'User not authenticated');
  }

  // Get delete request
  const { data: deleteRequest, error: fetchError } = await supabase
    .from('delete_requests')
    .select('*')
    .eq('id', request.delete_request_id)
    .single();

  if (fetchError || !deleteRequest) {
    throw new HardDeleteError(
      ErrorCodes.RECORD_NOT_FOUND,
      'Delete request not found'
    );
  }

  // Validate token
  const tokenValidation = validateToken(request.approval_token, deleteRequest);
  if (!tokenValidation.valid) {
    throw new HardDeleteError(
      tokenValidation.error!,
      tokenValidation.message!
    );
  }

  // Validate dual approval
  const dualApprovalValidation = validateDualApproval(
    deleteRequest.requester_id,
    deleteRequest.requester_email,
    user.id,
    request.approver_email
  );
  if (!dualApprovalValidation.valid) {
    throw new HardDeleteError(
      dualApprovalValidation.error!,
      dualApprovalValidation.message!
    );
  }

  const now = new Date().toISOString();

  if (request.approved) {
    // Approve the request
    const { error: updateError } = await supabase
      .from('delete_requests')
      .update({
        status: 'approved',
        approver_id: user.id,
        approver_email: request.approver_email,
        approver_notes: request.approver_notes,
        approved_at: now,
      })
      .eq('id', request.delete_request_id);

    if (updateError) {
      throw new HardDeleteError(
        'APPROVAL_UPDATE_FAILED',
        'Failed to update delete request',
        { error: updateError }
      );
    }

    // Create audit log
    const willExecuteAt = new Date();
    willExecuteAt.setSeconds(willExecuteAt.getSeconds() + 30);

    const auditLogId = await createAuditLog(
      request.delete_request_id,
      deleteRequest.table_name,
      deleteRequest.record_id,
      'hard_delete_approved',
      deleteRequest.requester_id,
      deleteRequest.requester_email,
      'approved',
      deleteRequest.reason,
      user.id,
      request.approver_email,
      {
        delete_request_id: request.delete_request_id,
        approver_notes: request.approver_notes,
        will_execute_at: willExecuteAt.toISOString(),
      }
    );

    return {
      success: true,
      delete_request_id: request.delete_request_id,
      status: 'approved',
      table_name: deleteRequest.table_name,
      record_id: deleteRequest.record_id,
      requester: deleteRequest.requester_email,
      approver: request.approver_email,
      approved_at: now,
      will_execute_at: willExecuteAt.toISOString(),
      audit_log_id: auditLogId,
    };
  } else {
    // Reject the request
    const { error: updateError } = await supabase
      .from('delete_requests')
      .update({
        status: 'rejected',
        approver_id: user.id,
        approver_email: request.approver_email,
        approver_notes: request.approver_notes,
      })
      .eq('id', request.delete_request_id);

    if (updateError) {
      throw new HardDeleteError(
        'REJECTION_UPDATE_FAILED',
        'Failed to update delete request',
        { error: updateError }
      );
    }

    // Create audit log
    const auditLogId = await createAuditLog(
      request.delete_request_id,
      deleteRequest.table_name,
      deleteRequest.record_id,
      'hard_delete_rejected',
      deleteRequest.requester_id,
      deleteRequest.requester_email,
      'rejected',
      deleteRequest.reason,
      user.id,
      request.approver_email,
      {
        delete_request_id: request.delete_request_id,
        rejection_reason: request.approver_notes || 'No reason provided',
        approver_notes: request.approver_notes,
      }
    );

    return {
      success: true,
      delete_request_id: request.delete_request_id,
      status: 'rejected',
      table_name: deleteRequest.table_name,
      record_id: deleteRequest.record_id,
      requester: deleteRequest.requester_email,
      approver: request.approver_email,
      rejected_at: now,
      rejection_reason: request.approver_notes || 'No reason provided',
      audit_log_id: auditLogId,
    };
  }
}

/**
 * List delete requests
 */
export async function listDeleteRequests(options: {
  status?: DeleteRequestStatus;
  table_name?: string;
  requester_email?: string;
  limit?: number;
  offset?: number;
}): Promise<{ requests: DeleteRequest[]; total: number }> {
  const supabase = createClient();

  let query = supabase.from('delete_requests').select('*', { count: 'exact' });

  if (options.status) {
    query = query.eq('status', options.status);
  }
  if (options.table_name) {
    query = query.eq('table_name', options.table_name);
  }
  if (options.requester_email) {
    query = query.eq('requester_email', options.requester_email);
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;

  query = query.range(offset, offset + limit - 1).order('requested_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new HardDeleteError(
      'FETCH_FAILED',
      'Failed to fetch delete requests',
      { error }
    );
  }

  return {
    requests: data || [],
    total: count || 0,
  };
}

/**
 * Get delete request details
 */
export async function getDeleteRequest(
  deleteRequestId: string
): Promise<DeleteRequest> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('delete_requests')
    .select('*')
    .eq('id', deleteRequestId)
    .single();

  if (error || !data) {
    throw new HardDeleteError(
      ErrorCodes.RECORD_NOT_FOUND,
      'Delete request not found'
    );
  }

  return data;
}

/**
 * Execute hard delete (internal, system service account only)
 * This function should only be called by automated systems after approval
 */
export async function executeHardDelete(
  deleteRequestId: string
): Promise<ExecutionResult> {
  const supabase = createClient();

  // Get delete request
  const { data: deleteRequest, error: fetchError } = await supabase
    .from('delete_requests')
    .select('*')
    .eq('id', deleteRequestId)
    .eq('status', 'approved')
    .single();

  if (fetchError || !deleteRequest) {
    throw new HardDeleteError(
      ErrorCodes.RECORD_NOT_FOUND,
      'Approved delete request not found'
    );
  }

  // Execute delete with timeout
  try {
    const { error: deleteError } = await supabase
      .from(deleteRequest.table_name)
      .delete()
      .eq('id', deleteRequest.record_id)
      .not('soft_deleted_at', 'is', null); // Safety: only delete if soft deleted

    if (deleteError) {
      throw new HardDeleteError(
        'EXECUTION_FAILED',
        'Hard delete execution failed',
        { error: deleteError }
      );
    }

    // Update delete request status
    await supabase
      .from('delete_requests')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
      })
      .eq('id', deleteRequestId);

    // Create audit log
    await createAuditLog(
      deleteRequestId,
      deleteRequest.table_name,
      deleteRequest.record_id,
      'hard_delete_executed',
      deleteRequest.requester_id,
      deleteRequest.requester_email,
      'completed',
      deleteRequest.reason,
      deleteRequest.approver_id,
      deleteRequest.approver_email,
      {
        delete_request_id: deleteRequestId,
        rows_deleted: 1,
      }
    );

    return { success: true, rows_deleted: 1 };
  } catch (error) {
    // Log failure
    await createAuditLog(
      deleteRequestId,
      deleteRequest.table_name,
      deleteRequest.record_id,
      'hard_delete_failed',
      deleteRequest.requester_id,
      deleteRequest.requester_email,
      'failed',
      deleteRequest.reason,
      deleteRequest.approver_id,
      deleteRequest.approver_email,
      {
        delete_request_id: deleteRequestId,
        error: error instanceof Error ? error.message : String(error),
      }
    );

    throw error;
  }
}
