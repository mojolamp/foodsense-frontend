/**
 * API Route: Hard Delete Approval
 * POST /api/v1/admin/delete/hard/approve
 *
 * Approve or reject hard delete request (Step 2 of dual approval)
 * Requires super-admin role
 * Enforces requester ≠ approver
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  approveHardDelete,
  HardDeleteError,
  ErrorCodes,
  type HardDeleteApprovalRequest,
} from '@/lib/api/hard-delete';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient();
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

    // Check user role (super-admin required for approval)
    const { data: userData } = await supabase
      .from('users')
      .select('profile_json')
      .eq('auth_id', user.id)
      .single();

    const userRole = userData?.profile_json?.role;
    if (!userData || userRole !== 'super-admin') {
      return NextResponse.json(
        {
          error: ErrorCodes.FORBIDDEN,
          message: 'Super-admin role required for hard delete approval',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: HardDeleteApprovalRequest = await request.json();

    // Validate required fields
    if (
      !body.delete_request_id ||
      !body.approval_token ||
      !body.approver_email ||
      body.approved === undefined
    ) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message:
            'Missing required fields: delete_request_id, approval_token, approver_email, approved',
        },
        { status: 400 }
      );
    }

    // Execute approval/rejection
    const result = await approveHardDelete(body);

    // If approved, schedule execution (30 seconds delay)
    if (body.approved && result.status === 'approved') {
      // FUTURE(P1): Trigger background job to execute hard delete after 30 seconds
      // Implementation requires:
      // 1. Queue system (e.g., BullMQ, Vercel Cron)
      // 2. scheduleHardDeleteExecution(result.delete_request_id) function
      // For now, hard delete is executed immediately by the approveHardDelete function
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof HardDeleteError) {
      const statusCode =
        error.code === ErrorCodes.UNAUTHORIZED
          ? 401
          : error.code === ErrorCodes.FORBIDDEN ||
              error.code === ErrorCodes.DUAL_APPROVAL_VIOLATION
            ? 403
            : error.code === ErrorCodes.RECORD_NOT_FOUND
              ? 404
              : error.code === ErrorCodes.INVALID_TOKEN ||
                  error.code === ErrorCodes.TOKEN_EXPIRED ||
                  error.code === ErrorCodes.TOKEN_ALREADY_USED
                ? 400
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

    console.error('Hard delete approval error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
