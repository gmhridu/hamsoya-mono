import { Hono } from 'hono';
import authRoutes from './auth';

const app = new Hono();

// Mount route modules
app.route('/auth', authRoutes);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hamsoya-backend',
    version: '1.0.0',
  });
});

export default app;
