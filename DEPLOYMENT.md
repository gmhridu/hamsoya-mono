# Hamsoya Deployment Guide

This guide covers the complete deployment process for the Hamsoya project, including both frontend (Next.js) and backend (Hono.js on Cloudflare Workers) on the same domain.

## 🏗️ Architecture Overview

- **Frontend**: Next.js app deployed on Cloudflare Pages
- **Backend**: Hono.js API deployed on Cloudflare Workers
- **Database**: Neon PostgreSQL (serverless)
- **Cache**: Upstash Redis (serverless)
- **Domain**: Single domain with routing rules
- **Email**: Gmail SMTP via nodemailer

## 📋 Prerequisites

1. **Cloudflare Account** with domain management
2. **Neon Database** account and database setup
3. **Upstash Redis** account and database setup
4. **Gmail App Password** for SMTP
5. **Domain** configured in Cloudflare DNS

## 🚀 Deployment Steps

### 1. Environment Setup

#### Backend Environment Variables (Cloudflare Workers Secrets)

```bash
# Navigate to backend directory
cd apps/backend

# Set up secrets for production
bun run setup-secrets:prod

# Or manually set each secret:
echo "your-database-url" | wrangler secret put DATABASE_URL --env production
echo "your-redis-url" | wrangler secret put REDIS_URL --env production
echo "your-jwt-access-secret" | wrangler secret put JWT_ACCESS_SECRET --env production
echo "your-jwt-refresh-secret" | wrangler secret put JWT_REFRESH_SECRET --env production
echo "smtp.gmail.com" | wrangler secret put SMTP_HOST --env production
echo "465" | wrangler secret put SMTP_PORT --env production
echo "gmail" | wrangler secret put SMTP_SERVICE --env production
echo "your-email@gmail.com" | wrangler secret put SMTP_USER --env production
echo "your-app-password" | wrangler secret put SMTP_PASSWORD --env production
```

#### Frontend Environment Variables (Cloudflare Pages)

Set these in the Cloudflare Pages dashboard:

```env
NEXT_PUBLIC_API_URL=https://hamsoya.com/api
NEXT_PUBLIC_TRPC_URL=https://hamsoya.com/trpc
NEXT_PUBLIC_APP_URL=https://hamsoya.com
NODE_ENV=production
```

### 2. Database Setup

```bash
# Generate and run migrations
cd apps/backend
bun run db:generate
bun run db:setup
```

### 3. Backend Deployment (Cloudflare Workers)

```bash
# Deploy to production
cd apps/backend
bun run deploy:prod

# Or step by step:
bun run build
bun run type-check
wrangler deploy --env production
```

### 4. Frontend Deployment (Cloudflare Pages)

#### Option A: Git Integration (Recommended)

1. Connect your repository to Cloudflare Pages
2. Set build configuration:
   - **Build command**: `cd apps/frontend && bun run build`
   - **Build output directory**: `apps/frontend/.next`
   - **Root directory**: `/`

#### Option B: Manual Deployment

```bash
# Build frontend
cd apps/frontend
bun run build

# Deploy using Wrangler Pages
wrangler pages deploy .next --project-name hamsoya-frontend
```

### 5. Domain Configuration

#### DNS Setup

In Cloudflare DNS, ensure your domain points to Cloudflare:

```
Type: A
Name: @
Content: 192.0.2.1 (Cloudflare proxy)
Proxy: Enabled (Orange cloud)

Type: CNAME
Name: www
Content: hamsoya.com
Proxy: Enabled (Orange cloud)
```

#### Routing Rules

Configure Cloudflare routing rules to direct traffic:

1. **API Routes to Workers**:
   - Pattern: `hamsoya.com/api/*`
   - Action: Route to Workers (hamsoya-backend-prod)

2. **tRPC Routes to Workers**:
   - Pattern: `hamsoya.com/trpc/*`
   - Action: Route to Workers (hamsoya-backend-prod)

3. **All Other Routes to Pages**:
   - Pattern: `hamsoya.com/*`
   - Action: Route to Pages (hamsoya-frontend)

### 6. SSL/TLS Configuration

1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Configure HSTS (optional but recommended)

### 7. Performance Optimization

#### Cloudflare Settings

1. **Speed → Optimization**:
   - Enable Auto Minify (HTML, CSS, JS)
   - Enable Brotli compression
   - Enable Rocket Loader (optional)

2. **Caching → Configuration**:
   - Set Browser Cache TTL to "Respect Existing Headers"
   - Enable "Always Online"

3. **Speed → Polish**:
   - Enable WebP conversion
   - Enable image optimization

#### Workers Configuration

Update `wrangler.toml` for production:

```toml
[env.production]
name = "hamsoya-backend-prod"
routes = [
  { pattern = "hamsoya.com/api/*", zone_name = "hamsoya.com" },
  { pattern = "hamsoya.com/trpc/*", zone_name = "hamsoya.com" }
]

[env.production.vars]
NODE_ENV = "production"
FRONTEND_URL = "https://hamsoya.com"
BACKEND_URL = "https://hamsoya.com"
```

## 🧪 Testing Deployment

### 1. Health Checks

```bash
# Test backend health
curl https://hamsoya.com/api/health

# Test tRPC health
curl -X POST https://hamsoya.com/trpc/health.check \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Authentication Flow Test

```bash
# Test registration
curl -X POST https://hamsoya.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "USER"
  }'
```

### 3. Performance Testing

```bash
# Run performance tests against production
cd apps/backend
API_BASE_URL=https://hamsoya.com bun run test:performance
```

## 📊 Monitoring & Analytics

### 1. Cloudflare Analytics

Monitor your deployment through:
- Cloudflare Dashboard → Analytics
- Workers → Analytics
- Pages → Analytics

### 2. Error Tracking

Set up error monitoring:
- Cloudflare Workers → Logs
- Real User Monitoring (RUM)
- Custom error tracking (Sentry, etc.)

### 3. Performance Monitoring

Track key metrics:
- Response times
- Error rates
- Cache hit ratios
- Database performance

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies**:
   ```bash
   bun update
   ```

2. **Database Maintenance**:
   ```bash
   bun run db:setup  # Cleanup expired tokens
   ```

3. **Security Updates**:
   - Rotate JWT secrets periodically
   - Update SMTP passwords
   - Review access logs

### Backup Strategy

1. **Database**: Neon provides automatic backups
2. **Redis**: Upstash provides persistence
3. **Code**: Git repository serves as backup
4. **Secrets**: Store securely in password manager

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check domain configuration
   - Verify routing rules
   - Ensure same-origin setup

2. **Authentication Issues**:
   - Verify JWT secrets
   - Check cookie settings
   - Validate domain configuration

3. **Database Connection**:
   - Verify DATABASE_URL
   - Check Neon database status
   - Review connection pooling

4. **Email Delivery**:
   - Verify SMTP credentials
   - Check Gmail app password
   - Review email templates

### Debug Commands

```bash
# Check Workers logs
wrangler tail --env production

# Test database connection
bun run db:studio

# Validate environment
bun run type-check
```

## 📞 Support

For deployment issues:
1. Check Cloudflare status page
2. Review Neon/Upstash status
3. Check application logs
4. Verify environment variables

---

**🎉 Congratulations!** Your Hamsoya application is now deployed and ready for production use.
