'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

/**
 * Enhanced Error Boundary specifically for handling ChunkLoadError
 * Provides automatic retry and recovery mechanisms
 */
export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // Check if this is a chunk loading error
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading CSS chunk');

    return {
      hasError: true,
      error,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log chunk errors for debugging
    if (this.state.isChunkError) {
      console.warn('Chunk loading error detected:', error.message);

      // Attempt automatic retry for chunk errors
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.setState({ hasError: false, error: null, isChunkError: false });
        }, 1000 * this.retryCount); // Exponential backoff
      }
    }
  }

  handleManualRetry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleHardRefresh = () => {
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Use window.location.reload() for chunk errors in App Router
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback for chunk errors
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Loading Issue</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  We're having trouble loading this page. This usually happens when the app has been
                  updated.
                </p>

                <div className="space-y-2">
                  <Button onClick={this.handleManualRetry} className="w-full" variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>

                  <Button onClick={this.handleHardRefresh} className="w-full" variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Refresh Page
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  If the problem persists, try clearing your browser cache.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Use custom fallback or default error UI for other errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                An unexpected error occurred. Please try refreshing the page.
              </p>

              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = window.location.href;
                  }
                }}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components
 */
export function useChunkErrorRecovery() {
  const handleChunkError = (error: Error) => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      // Attempt to reload the page after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    }
  };

  return { handleChunkError };
}
