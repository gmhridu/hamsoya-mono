import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { verifyAccessToken } from '../lib/jwt';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

// Middleware to extract and verify JWT token
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get access token from cookie or Authorization header
    let token: string | undefined;

    // First try to get from cookie
    token = getCookie(c, 'accessToken');

    // If not in cookie, try Authorization header
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new HTTPException(401, { message: 'Access token required' });
    }

    // Verify token
    const payload = verifyAccessToken(token, c.env);

    // Get user details
    const userService = new UserService(c.env);
    const user = await userService.getUserById(payload.userId);

    if (!user) {
      throw new HTTPException(401, { message: 'User not found' });
    }

    if (!user.is_verified) {
      throw new HTTPException(401, { message: 'Email not verified' });
    }

    // Add user to context
    c.set('user', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.is_verified,
    });

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    // Check if it's a token expiry error and try to refresh
    if (error instanceof Error && error.message.includes('expired')) {
      // Try to refresh token silently
      const refreshToken = getCookie(c, 'refreshToken');

      if (refreshToken) {
        try {
          const authService = new AuthService(c.env);
          const tokens = await authService.refreshToken(refreshToken);

          // Set new tokens in response headers for client to update cookies
          c.header('X-New-Access-Token', tokens.accessToken);
          c.header('X-New-Refresh-Token', tokens.refreshToken);

          // Verify the new access token and continue
          const payload = verifyAccessToken(tokens.accessToken, c.env);
          const userService = new UserService(c.env);
          const user = await userService.getUserById(payload.userId);

          if (user) {
            c.set('user', {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isVerified: user.is_verified,
            });

            await next();
            return;
          }
        } catch (refreshError) {
          // Refresh failed, require login
          throw new HTTPException(401, { message: 'Session expired, please login again' });
        }
      }
    }

    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (!user || user.role !== 'ADMIN') {
    throw new HTTPException(403, { message: 'Admin access required' });
  }

  await next();
};

// Middleware to check if user is seller or admin
export const sellerMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    throw new HTTPException(403, { message: 'Seller access required' });
  }

  await next();
};

// Optional auth middleware (doesn't throw if no token)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    // Get access token from cookie or Authorization header
    let token: string | undefined;

    // First try to get from cookie
    token = getCookie(c, 'accessToken');

    // If not in cookie, try Authorization header
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Verify token
      const payload = verifyAccessToken(token, c.env);

      // Get user details
      const userService = new UserService(c.env);
      const user = await userService.getUserById(payload.userId);

      if (user && user.is_verified) {
        // Add user to context
        c.set('user', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.is_verified,
        });
      }
    }
  } catch (error) {
    // Ignore errors in optional auth
    console.log('Optional auth failed:', error);
  }

  await next();
};
