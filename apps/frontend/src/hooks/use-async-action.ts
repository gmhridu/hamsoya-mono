import { useCallback, useTransition } from 'react';
import { useErrorHandler } from './use-error-handler';

interface AsyncActionOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  showErrorToast?: boolean;
  errorContext?: string;
}

export function useAsyncAction<T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  options: AsyncActionOptions = {}
) {
  const [isPending, startTransition] = useTransition();
  const { handleApiError } = useErrorHandler();

  const execute = useCallback(
    (...args: T) => {
      startTransition(async () => {
        try {
          const result = await asyncFunction(...args);
          options.onSuccess?.(result);
          return result;
        } catch (error) {
          // Handle error with error handler
          if (options.showErrorToast !== false) {
            handleApiError(error, options.errorContext);
          }
          
          options.onError?.(error);
          throw error;
        }
      });
    },
    [asyncFunction, options, handleApiError]
  );

  return {
    execute,
    isPending,
  };
}

// Specialized hook for form submissions
export function useFormAction<T extends Record<string, any>, R>(
  submitFunction: (data: T) => Promise<R>,
  options: AsyncActionOptions = {}
) {
  const { execute, isPending } = useAsyncAction(submitFunction, options);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries()) as T;
      
      execute(data);
    },
    [execute]
  );

  return {
    handleSubmit,
    isPending,
    execute,
  };
}

// Hook for button actions with loading states
export function useButtonAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options: AsyncActionOptions = {}
) {
  const { execute, isPending } = useAsyncAction(action, options);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      execute();
    },
    [execute]
  );

  return {
    handleClick,
    isPending,
    execute,
  };
}
