import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { AuthService } from '../../services/auth.service';
import { errorResponse, successResponse } from '../../utils/response-builder';

// Type for environment variables
type Env = {
  Variables: {
    user?: any;
  };
  Bindings: {
    [key: string]: any;
  };
};

const app = new Hono<Env>();

// GET /api/auth/me
app.get('/', authMiddleware, async c => {
  try {
    const user = c.get('user') as any;
    const authService = new AuthService(c.env);

    if (!user || !user.id) {
      return c.json(errorResponse('User not found'), 401);
    }

    const userProfile = await authService.getUserProfile(user.id);

    return c.json(successResponse(userProfile), 200);
  } catch (error) {
    console.error('Get user profile error:', error);

    if (error instanceof Error) {
      return c.json(errorResponse(error.message), 400);
    }

    return c.json(errorResponse('Failed to get user profile'), 500);
  }
});

export default app;
