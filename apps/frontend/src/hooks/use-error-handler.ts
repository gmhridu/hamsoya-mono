import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export type ErrorType = 
  | 'network'
  | 'server'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not_found'
  | 'rate_limit'
  | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  canRetry: boolean;
  shouldRedirect?: string;
}

export function useErrorHandler() {
  const classifyError = useCallback((error: any): ErrorInfo => {
    // Network errors
    if (!navigator.onLine) {
      return {
        type: 'network',
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        canRetry: true,
      };
    }

    // If it's a fetch error or network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please try again.',
        canRetry: true,
      };
    }

    // API errors with status codes
    if (error?.status) {
      switch (error.status) {
        case 400:
          return {
            type: 'validation',
            title: 'Invalid Request',
            message: error.message || 'Please check your input and try again.',
            canRetry: false,
          };
        
        case 401:
          return {
            type: 'authentication',
            title: 'Authentication Required',
            message: 'Please sign in to continue.',
            canRetry: false,
            shouldRedirect: '/login',
          };
        
        case 403:
          return {
            type: 'authorization',
            title: 'Access Denied',
            message: 'You don\'t have permission to access this resource.',
            canRetry: false,
          };
        
        case 404:
          return {
            type: 'not_found',
            title: 'Not Found',
            message: error.message || 'The requested resource was not found.',
            canRetry: false,
          };
        
        case 429:
          return {
            type: 'rate_limit',
            title: 'Too Many Requests',
            message: 'Please wait a moment before trying again.',
            canRetry: true,
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'server',
            title: 'Server Error',
            message: 'Our servers are experiencing issues. Please try again later.',
            canRetry: true,
          };
        
        default:
          return {
            type: 'unknown',
            title: 'Something Went Wrong',
            message: error.message || 'An unexpected error occurred.',
            canRetry: true,
          };
      }
    }

    // Generic error
    return {
      type: 'unknown',
      title: 'Something Went Wrong',
      message: error?.message || 'An unexpected error occurred.',
      canRetry: true,
    };
  }, []);

  const handleError = useCallback((error: any, options?: {
    showToast?: boolean;
    toastType?: 'error' | 'warning' | 'info';
    customMessage?: string;
  }) => {
    const errorInfo = classifyError(error);
    
    // Log error for debugging
    console.error('Error handled:', error, errorInfo);
    
    // Show toast notification if requested
    if (options?.showToast !== false) {
      const message = options?.customMessage || errorInfo.message;
      const toastType = options?.toastType || 'error';
      
      switch (toastType) {
        case 'error':
          toast.error(errorInfo.title, { description: message });
          break;
        case 'warning':
          toast.warning(errorInfo.title, { description: message });
          break;
        case 'info':
          toast.info(errorInfo.title, { description: message });
          break;
      }
    }
    
    // Handle redirects
    if (errorInfo.shouldRedirect) {
      setTimeout(() => {
        window.location.href = errorInfo.shouldRedirect!;
      }, 1000);
    }
    
    return errorInfo;
  }, [classifyError]);

  const handleApiError = useCallback((error: any, context?: string) => {
    const contextMessages: Record<string, string> = {
      'products': 'Unable to load products',
      'categories': 'Unable to load categories',
      'auth': 'Authentication failed',
      'cart': 'Cart operation failed',
      'search': 'Search failed',
    };
    
    const customMessage = context ? contextMessages[context] : undefined;
    
    return handleError(error, {
      showToast: true,
      customMessage,
    });
  }, [handleError]);

  const createRetryHandler = useCallback((
    originalFunction: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ) => {
    let retryCount = 0;
    
    const retry = async (): Promise<any> => {
      try {
        return await originalFunction();
      } catch (error) {
        const errorInfo = classifyError(error);
        
        if (errorInfo.canRetry && retryCount < maxRetries) {
          retryCount++;
          
          // Show retry toast
          toast.info(`Retrying... (${retryCount}/${maxRetries})`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * retryCount));
          
          return retry();
        } else {
          // Max retries reached or error is not retryable
          throw error;
        }
      }
    };
    
    return retry;
  }, [classifyError]);

  return {
    handleError,
    handleApiError,
    classifyError,
    createRetryHandler,
  };
}
