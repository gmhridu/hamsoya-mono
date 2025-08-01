/**
 * Professional Error Boundary
 * Provides comprehensive error handling with smooth fallbacks
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ProfessionalErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  goHome: () => void;
  showDetails?: boolean;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, resetError, goHome, showDetails = false }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try refreshing the page or go back to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && error && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">Error Details:</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={goHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Professional Error Boundary Class Component
 */
export class ProfessionalErrorBoundary extends React.Component<
  ProfessionalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ProfessionalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  goHome = () => {
    // Use window.location for immediate navigation
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error boundary in functional components
 */
export function useErrorHandler() {
  const router = useRouter();

  return {
    handleError: (error: Error) => {
      console.error('Handled error:', error);
      // You could also send this to an error reporting service
    },
    goHome: () => router.push('/'),
    refresh: () => {
      router.refresh();
    },
  };
}

/**
 * Async Error Boundary for handling async errors
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return (
      <DefaultErrorFallback
        error={error}
        resetError={() => setError(null)}
        goHome={() => window.location.href = '/'}
      />
    );
  }

  return <>{children}</>;
}

export { DefaultErrorFallback };
export type { ErrorBoundaryState, ErrorFallbackProps, ProfessionalErrorBoundaryProps };
