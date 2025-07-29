import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { AuthService } from '../../services/auth.service';
import { errorResponse, successResponse } from '../../utils/response-builder';

// Type for environment variables
type Env = {
  Bindings: {
    NODE_ENV?: string;
    [key: string]: any;
  };
};

const app = new Hono<Env>();

// POST /api/auth/refresh-token
app.post('/', async c => {
  try {
    // Get refresh token from cookie
    const refreshToken = getCookie(c, 'refreshToken');

    if (!refreshToken) {
      return c.json(errorResponse('Refresh token not found'), 401);
    }

    const authService = new AuthService(c.env);
    const result = await authService.refreshToken(refreshToken);

    // Set new secure HTTP-only cookies
    const isProduction = c.env?.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';

    setCookie(c, 'accessToken', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return c.json(
      successResponse({
        message: 'Tokens refreshed successfully',
      }),
      200
    );
  } catch (error) {
    console.error('Refresh token error:', error);

    if (error instanceof Error) {
      return c.json(errorResponse(error.message), 401);
    }

    return c.json(errorResponse('Failed to refresh token'), 500);
  }
});

export default app;
