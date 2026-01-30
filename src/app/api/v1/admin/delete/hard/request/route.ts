/**
 * API Route: Hard Delete Request
 * POST /api/v1/admin/delete/hard/request
 *
 * Request hard delete (Step 1 of dual approval)
 * Requires super-admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  requestHardDelete,
  HardDeleteError,
  ErrorCodes,
  type HardDeleteRequest,
} from '@/lib/api/hard-delete';

export async function POST(request: NextRequest) {
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

    // Check user role (super-admin required for hard delete)
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
          message: 'Super-admin role required for hard delete requests',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: HardDeleteRequest = await request.json();

    // Validate required fields
    if (!body.table_name || !body.record_id || !body.reason || !body.requester_email) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Missing required fields: table_name, record_id, reason, requester_email',
        },
        { status: 400 }
      );
    }

    // Execute hard delete request
    const result = await requestHardDelete(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof HardDeleteError) {
      const statusCode =
        error.code === ErrorCodes.UNAUTHORIZED
          ? 401
          : error.code === ErrorCodes.FORBIDDEN
            ? 403
            : error.code === ErrorCodes.RECORD_NOT_FOUND
              ? 404
              : error.code === ErrorCodes.DUPLICATE_REQUEST
                ? 409
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

    console.error('Hard delete request error:', error);
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
