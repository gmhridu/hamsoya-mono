#!/bin/bash

# Hamsoya Backend Secrets Setup Script
# This script helps set up environment secrets for Cloudflare Workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_prompt() {
    echo -e "${BLUE}[PROMPT]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    print_error "Environment not specified. Usage: ./setup-secrets.sh [development|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment. Use 'development' or 'production'"
    exit 1
fi

print_status "Setting up secrets for $ENVIRONMENT environment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    print_error "Not logged in to Cloudflare. Please run 'wrangler login' first"
    exit 1
fi

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local is_required=${3:-true}
    
    print_prompt "Enter $secret_description:"
    if [ "$is_required" = true ]; then
        print_warning "This secret is required"
    fi
    
    read -s secret_value
    echo
    
    if [ -z "$secret_value" ] && [ "$is_required" = true ]; then
        print_error "Secret value cannot be empty for required secrets"
        return 1
    fi
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | wrangler secret put "$secret_name" --env "$ENVIRONMENT"
        print_status "Secret $secret_name set successfully"
    else
        print_warning "Skipping empty secret $secret_name"
    fi
}

print_status "Setting up required secrets..."

# Database URL
set_secret "DATABASE_URL" "Neon Database URL (postgresql://...)" true

# Redis URL
set_secret "REDIS_URL" "Upstash Redis URL (rediss://...)" true

# JWT Secrets
set_secret "JWT_ACCESS_SECRET" "JWT Access Token Secret (use a strong random string)" true
set_secret "JWT_REFRESH_SECRET" "JWT Refresh Token Secret (use a different strong random string)" true

# SMTP Configuration
set_secret "SMTP_HOST" "SMTP Host (default: smtp.gmail.com)" false
set_secret "SMTP_PORT" "SMTP Port (default: 465)" false
set_secret "SMTP_SERVICE" "SMTP Service (default: gmail)" false
set_secret "SMTP_USER" "SMTP Username/Email" true
set_secret "SMTP_PASSWORD" "SMTP Password/App Password" true

print_status "All secrets have been configured!"

print_status "Verifying deployment configuration..."
wrangler deploy --dry-run --env "$ENVIRONMENT"

if [ $? -eq 0 ]; then
    print_status "Configuration verified successfully!"
    print_status "You can now deploy using: ./deploy.sh $ENVIRONMENT"
else
    print_error "Configuration verification failed. Please check your secrets and wrangler.toml"
    exit 1
fi

print_status "Secret setup completed!"

# Show next steps
echo
print_status "Next steps:"
echo "1. Run './deploy.sh $ENVIRONMENT' to deploy your application"
echo "2. Test your deployment with the health check endpoint"
echo "3. Configure your domain routing in Cloudflare dashboard"

if [ "$ENVIRONMENT" = "production" ]; then
    echo
    print_warning "Production Environment Notes:"
    echo "- Make sure your domain is configured in Cloudflare"
    echo "- Update DNS records to point to Cloudflare"
    echo "- Configure SSL/TLS settings"
    echo "- Set up monitoring and alerts"
fi
