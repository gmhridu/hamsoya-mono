import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Security headers middleware
export const securityHeaders = async (c: Context, next: Next) => {
  await next();

  // Set security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Only set HSTS in production
  if (c.env?.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
};

// Request size limiting middleware
export const requestSizeLimit = (maxSize: number = 1024 * 1024) => {
  // Default 1MB
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length');

    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      throw new HTTPException(413, { message: 'Request entity too large' });
    }

    await next();
  };
};

// IP whitelist/blacklist middleware
export const ipFilter = (options: {
  whitelist?: string[];
  blacklist?: string[];
  message?: string;
}) => {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('X-Forwarded-For') ||
      c.req.header('X-Real-IP') ||
      'unknown';

    // Check blacklist first
    if (options.blacklist && options.blacklist.includes(ip)) {
      throw new HTTPException(403, {
        message: options.message || 'Access denied from this IP address',
      });
    }

    // Check whitelist if provided
    if (options.whitelist && !options.whitelist.includes(ip)) {
      throw new HTTPException(403, {
        message: options.message || 'Access denied from this IP address',
      });
    }

    await next();
  };
};

// User agent validation middleware
export const userAgentValidation = async (c: Context, next: Next) => {
  const userAgent = c.req.header('User-Agent');

  // Block requests without user agent (potential bots)
  if (!userAgent) {
    throw new HTTPException(400, { message: 'User-Agent header is required' });
  }

  // Block known malicious user agents
  const maliciousPatterns = [/sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /nmap/i, /zap/i, /burp/i];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(userAgent)) {
      throw new HTTPException(403, { message: 'Access denied' });
    }
  }

  await next();
};

// Request method validation
export const methodValidation = (allowedMethods: string[]) => {
  return async (c: Context, next: Next) => {
    if (!allowedMethods.includes(c.req.method)) {
      throw new HTTPException(405, { message: 'Method not allowed' });
    }

    await next();
  };
};

// Content type validation for POST/PUT requests
export const contentTypeValidation = async (c: Context, next: Next) => {
  const method = c.req.method;

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = c.req.header('Content-Type');

    if (!contentType) {
      throw new HTTPException(400, { message: 'Content-Type header is required' });
    }

    // Allow only JSON and form data
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ];

    const isAllowed = allowedTypes.some(type => contentType.includes(type));

    if (!isAllowed) {
      throw new HTTPException(415, { message: 'Unsupported Media Type' });
    }
  }

  await next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  // Default 30 seconds
  return async (c: Context, next: Next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new HTTPException(408, { message: 'Request timeout' }));
      }, timeoutMs);
    });

    try {
      await Promise.race([next(), timeoutPromise]);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal server error' });
    }
  };
};

// CSRF protection for state-changing operations
export const csrfProtection = async (c: Context, next: Next) => {
  const method = c.req.method;

  // Only check CSRF for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = c.req.header('Origin');
    const referer = c.req.header('Referer');

    // In production, ensure requests come from allowed origins
    if (c.env?.NODE_ENV === 'production') {
      const allowedOrigins = ['https://hamsoya.com', 'https://www.hamsoya.com'];

      if (origin && !allowedOrigins.includes(origin)) {
        throw new HTTPException(403, { message: 'CSRF protection: Invalid origin' });
      }

      if (referer) {
        const refererUrl = new URL(referer);
        if (!allowedOrigins.includes(refererUrl.origin)) {
          throw new HTTPException(403, { message: 'CSRF protection: Invalid referer' });
        }
      }
    }
  }

  await next();
};

// Combine all security middlewares
export const applySecurity = () => {
  return [
    securityHeaders,
    requestSizeLimit(2 * 1024 * 1024), // 2MB limit
    userAgentValidation,
    contentTypeValidation,
    requestTimeout(30000), // 30 second timeout
    csrfProtection,
  ];
};
