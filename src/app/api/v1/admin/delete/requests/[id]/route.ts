/**
 * API Route: Get Delete Request Details
 * GET /api/v1/admin/delete/requests/[id]
 *
 * Get single delete request with full details including audit trail
 * Requires super-admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getDeleteRequest,
  getOperationAuditTrail,
  HardDeleteError,
  ErrorCodes,
} from '@/lib/api/hard-delete';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check user role (super-admin required)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super-admin') {
      return NextResponse.json(
        {
          error: ErrorCodes.FORBIDDEN,
          message: 'Super-admin role required to view delete request details',
        },
        { status: 403 }
      );
    }

    // Get delete request
    const deleteRequest = await getDeleteRequest(params.id);

    // Get audit trail
    const auditTrail = await getOperationAuditTrail(params.id);

    // Check if token is still valid
    const now = new Date();
    const expiresAt = new Date(deleteRequest.expires_at);
    const approvalTokenValid =
      deleteRequest.status === 'pending_approval' && now < expiresAt;

    // Get requester and approver details
    const { data: requester } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', deleteRequest.requester_id)
      .single();

    let approver = null;
    if (deleteRequest.approver_id) {
      const { data: approverData } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', deleteRequest.approver_id)
        .single();
      approver = approverData;
    }

    // Build response
    const response = {
      delete_request_id: deleteRequest.id,
      table_name: deleteRequest.table_name,
      record_id: deleteRequest.record_id,
      requester: requester
        ? {
            id: requester.id,
            email: requester.email,
            name: requester.name,
          }
        : null,
      approver: approver
        ? {
            id: approver.id,
            email: approver.email,
            name: approver.name,
          }
        : null,
      status: deleteRequest.status,
      reason: deleteRequest.reason,
      urgency: deleteRequest.urgency,
      requester_notes: deleteRequest.requester_notes,
      approver_notes: deleteRequest.approver_notes,
      requested_at: deleteRequest.requested_at,
      approved_at: deleteRequest.approved_at,
      executed_at: deleteRequest.executed_at,
      expires_at: deleteRequest.expires_at,
      approval_token_valid: approvalTokenValid,
      audit_trail: auditTrail.map((log) => ({
        action: log.action,
        timestamp: log.timestamp,
        actor: log.requester_email,
        status: log.status,
        metadata: log.metadata,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof HardDeleteError) {
      const statusCode =
        error.code === ErrorCodes.UNAUTHORIZED
          ? 401
          : error.code === ErrorCodes.FORBIDDEN
            ? 403
            : error.code === ErrorCodes.RECORD_NOT_FOUND
              ? 404
              : 400;

      return NextResponse.json(
        {
          error: error.code,
          message: error.message,
          details: error.details,
        },
        { status: statusCode }
      );
    }

    console.error('Get delete request error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
