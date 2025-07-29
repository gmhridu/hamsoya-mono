#!/bin/bash

# Hamsoya Backend Deployment Script
# This script handles deployment to Cloudflare Workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if environment is provided
if [ -z "$1" ]; then
    print_error "Environment not specified. Usage: ./deploy.sh [development|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment. Use 'development' or 'production'"
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment..."

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

# Build the project
print_status "Building the project..."
if ! bun run build; then
    print_error "Build failed"
    exit 1
fi

# Run type checking
print_status "Running type checks..."
if ! bun run type-check; then
    print_error "Type checking failed"
    exit 1
fi

# Run linting
print_status "Running linter..."
if ! bun run lint; then
    print_warning "Linting issues found, but continuing with deployment"
fi

# Deploy to Cloudflare Workers
print_status "Deploying to Cloudflare Workers ($ENVIRONMENT)..."

if [ "$ENVIRONMENT" = "production" ]; then
    # Production deployment
    print_warning "Deploying to PRODUCTION environment!"
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    wrangler deploy --env production
else
    # Development deployment
    wrangler deploy --env development
fi

# Check deployment status
if [ $? -eq 0 ]; then
    print_status "Deployment successful!"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Production URL: https://hamsoya.com/api"
    else
        print_status "Development URL: Check wrangler output for the URL"
    fi
    
    print_status "Health check: Testing the deployment..."
    sleep 5
    
    if [ "$ENVIRONMENT" = "production" ]; then
        curl -f https://hamsoya.com/api/health || print_warning "Health check failed"
    fi
else
    print_error "Deployment failed"
    exit 1
fi

print_status "Deployment completed successfully!"
