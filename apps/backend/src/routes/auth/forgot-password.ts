import { Hono } from 'hono';
import { zValidator } from '../../lib/zod-validator-fix';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordSchema } from '../../types/auth';
import { errorResponse, successResponse } from '../../utils/response-builder';

const app = new Hono();

// POST /api/auth/forgot-password
app.post('/', zValidator('json', ForgotPasswordSchema), async c => {
  try {
    const input = c.req.valid('json');
    const authService = new AuthService(c.env);

    const result = await authService.forgotPassword(input);

    return c.json(successResponse(result), 200);
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof Error) {
      return c.json(errorResponse(error.message), 400);
    }

    return c.json(errorResponse('Failed to process forgot password request'), 500);
  }
});

export default app;
