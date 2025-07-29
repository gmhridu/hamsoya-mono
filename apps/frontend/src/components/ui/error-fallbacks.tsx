'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Server, 
  ShoppingCart, 
  User,
  Search,
  Package
} from 'lucide-react';

interface ErrorFallbackProps {
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}

// Network/Connection Error
export function NetworkErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Wifi className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Connection Problem</CardTitle>
          <CardDescription>
            We're having trouble connecting to our servers. Please check your internet connection and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Server Error
export function ServerErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Server className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Server Error</CardTitle>
          <CardDescription>
            Our servers are experiencing some issues. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Products Loading Error
export function ProductsErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Unable to Load Products</CardTitle>
          <CardDescription>
            We couldn't load the products right now. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Authentication Error
export function AuthErrorFallback({ onRetry, onGoBack, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to be logged in to access this feature. Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Sign In
          </Button>
          <Button onClick={onGoBack} variant="outline" className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Search Error
export function SearchErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle>Search Unavailable</CardTitle>
          <CardDescription>
            We're having trouble with search right now. Please try again in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Search Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Cart Error
export function CartErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Cart Unavailable</CardTitle>
          <CardDescription>
            We're having trouble loading your cart. Your items are safe and will be restored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Inline Error Alert (for smaller errors)
export function InlineErrorAlert({ 
  title = "Something went wrong", 
  description, 
  onRetry, 
  className 
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>{title}</strong>
          {description && <div className="mt-1 text-sm">{description}</div>}
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="ml-4 shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
