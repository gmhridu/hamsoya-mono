/**
 * Server-Side Login Success Handler
 * Performs immediate role-based redirects using JWT token data
 * Eliminates client-side redirect delays and content flashing
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  extractUserRoleFromRequest,
  getRoleBasedRedirectUrl,
  getRedirectFromRequest
} from '@/lib/server-jwt-decoder';

export async function POST(request: NextRequest) {
  try {
    // Extract role from JWT token (fast, no database call)
    const roleInfo = extractUserRoleFromRequest(request);

    if (!roleInfo.isAuthenticated || !roleInfo.role) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get requested redirect URL from request body or query params
    const body = await request.json().catch(() => ({}));
    const requestedRedirect = body.redirectUrl || getRedirectFromRequest(request);

    // Determine final redirect URL based on role
    const redirectUrl = getRoleBasedRedirectUrl(roleInfo.role, requestedRedirect);

    console.log(`[LOGIN-SUCCESS] Role-based redirect: ${roleInfo.role} -> ${redirectUrl}`);

    // Return redirect URL for immediate client-side navigation
    return NextResponse.json({
      success: true,
      redirectUrl,
      userRole: roleInfo.role,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('[LOGIN-SUCCESS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract role from JWT token (fast, no database call)
    const roleInfo = extractUserRoleFromRequest(request);

    if (!roleInfo.isAuthenticated || !roleInfo.role) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get requested redirect URL from query params
    const requestedRedirect = getRedirectFromRequest(request);

    // Determine final redirect URL based on role
    const redirectUrl = getRoleBasedRedirectUrl(roleInfo.role, requestedRedirect || undefined);

    console.log(`[LOGIN-SUCCESS] Role-based redirect: ${roleInfo.role} -> ${redirectUrl}`);

    // Perform server-side redirect
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('[LOGIN-SUCCESS] Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
