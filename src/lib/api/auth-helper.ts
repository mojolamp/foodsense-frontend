/**
 * Authentication Helper for API Routes
 *
 * Provides consistent authentication handling across all API routes
 * with proper error handling and HTTP status codes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthResult {
  success: boolean;
  user?: any;
  response?: NextResponse;
}

/**
 * Authenticate and get current user from request
 *
 * Handles all authentication errors with proper HTTP status codes:
 * - 401: No authentication provided or invalid token
 * - 500: Internal server error
 *
 * @param request - Next.js request object
 * @returns AuthResult with user data or error response
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  try {
    const supabase = createClient();

    // Check if createClient returned undefined (no session cookies)
    if (!supabase) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
          },
          { status: 401 }
        ),
      };
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'UNAUTHORIZED',
            message: 'Invalid authentication token.',
            details: authError.message,
          },
          { status: 401 }
        ),
      };
    }

    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'UNAUTHORIZED',
            message: 'User not authenticated.',
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Authentication error:', error);

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during authentication.',
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Check if user has required role
 *
 * @param user - User object from Supabase
 * @param allowedRoles - Array of allowed roles (e.g., ['admin', 'super-admin'])
 * @returns true if user has one of the allowed roles
 */
export async function checkUserRole(
  user: any,
  allowedRoles: string[]
): Promise<{ authorized: boolean; userRole?: string; response?: NextResponse }> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection error.',
          },
          { status: 500 }
        ),
      };
    }

    // Get user data from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('profile_json')
      .eq('auth_id', user.id)
      .single();

    if (dbError || !userData) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'FORBIDDEN',
            message: 'User profile not found.',
          },
          { status: 403 }
        ),
      };
    }

    const userRole = userData.profile_json?.role;

    if (!userRole) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'FORBIDDEN',
            message: 'User role not defined.',
          },
          { status: 403 }
        ),
      };
    }

    if (!allowedRoles.includes(userRole)) {
      return {
        authorized: false,
        userRole,
        response: NextResponse.json(
          {
            error: 'FORBIDDEN',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
          },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      userRole,
    };
  } catch (error) {
    console.error('Role check error:', error);

    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during authorization.',
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Combined authentication and authorization check
 *
 * Usage in API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const auth = await requireAuth(request, ['super-admin']);
 *   if (!auth.success) {
 *     return auth.response!;
 *   }
 *
 *   const { user, userRole } = auth;
 *   // Continue with authenticated and authorized user
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{
  success: boolean;
  user?: any;
  userRole?: string;
  response?: NextResponse;
}> {
  // Step 1: Authenticate
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return {
      success: false,
      response: authResult.response,
    };
  }

  // Step 2: Authorize
  const roleCheck = await checkUserRole(authResult.user!, allowedRoles);

  if (!roleCheck.authorized) {
    return {
      success: false,
      response: roleCheck.response,
    };
  }

  return {
    success: true,
    user: authResult.user,
    userRole: roleCheck.userRole,
  };
}
