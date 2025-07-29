import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { zValidator } from '../../lib/zod-validator-fix';
import { AuthService } from '../../services/auth.service';
import { LoginSchema } from '../../types/auth';
import { errorResponse, successResponse } from '../../utils/response-builder';

// Type for environment variables
type Env = {
  NODE_ENV?: string;
  [key: string]: any;
};

const app = new Hono<{ Bindings: Env }>();

// POST /api/auth/login
app.post('/', zValidator('json', LoginSchema), async c => {
  try {
    const input = c.req.valid('json');
    const authService = new AuthService(c.env);

    const result = await authService.login(input);

    // Set secure HTTP-only cookies
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
        user: result.user,
        message: 'Login successful',
      }),
      200
    );
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error) {
      return c.json(errorResponse(error.message), 401);
    }

    return c.json(errorResponse('Login failed'), 500);
  }
});

export default app;
