/**
 * API Route: List Delete Requests
 * GET /api/v1/admin/delete/requests
 *
 * List delete requests with filtering
 * Requires super-admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  listDeleteRequests,
  HardDeleteError,
  ErrorCodes,
  type DeleteRequestStatus,
} from '@/lib/api/hard-delete';

export async function GET(request: NextRequest) {
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

    // Check user role (super-admin required)
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
          message: 'Super-admin role required to view delete requests',
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as DeleteRequestStatus | null;
    const table_name = searchParams.get('table_name');
    const requester_email = searchParams.get('requester_email');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate limit and offset
    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Limit must be between 1 and 200',
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Offset must be non-negative',
        },
        { status: 400 }
      );
    }

    // List delete requests
    const result = await listDeleteRequests({
      status: status || undefined,
      table_name: table_name || undefined,
      requester_email: requester_email || undefined,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        ...result,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof HardDeleteError) {
      const statusCode =
        error.code === ErrorCodes.UNAUTHORIZED
          ? 401
          : error.code === ErrorCodes.FORBIDDEN
            ? 403
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

    console.error('List delete requests error:', error);
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
