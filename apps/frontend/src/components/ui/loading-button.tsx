import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      loadingIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : children;
    const icon = loading ? (loadingIcon || <Loader2 className="h-4 w-4 animate-spin" />) : null;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {displayText}
      </Comp>
    );
  }
);
LoadingButton.displayName = 'LoadingButton';

// Specialized loading button for async actions
interface AsyncButtonProps extends Omit<LoadingButtonProps, 'loading' | 'onClick'> {
  action: () => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  successText?: string;
  errorText?: string;
}

const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  (
    {
      action,
      onSuccess,
      onError,
      successText,
      errorText,
      loadingText = 'Loading...',
      children,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    const handleClick = async () => {
      setIsLoading(true);
      setStatus('idle');

      try {
        await action();
        setStatus('success');
        onSuccess?.();
      } catch (error) {
        setStatus('error');
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    const getDisplayText = () => {
      if (isLoading) return loadingText;
      if (status === 'success' && successText) return successText;
      if (status === 'error' && errorText) return errorText;
      return children;
    };

    const getVariant = () => {
      if (status === 'success') return 'default';
      if (status === 'error') return 'destructive';
      return props.variant || 'default';
    };

    return (
      <LoadingButton
        {...props}
        ref={ref}
        loading={isLoading}
        variant={getVariant()}
        onClick={handleClick}
      >
        {getDisplayText()}
      </LoadingButton>
    );
  }
);
AsyncButton.displayName = 'AsyncButton';

// Form submit button with loading state
interface SubmitButtonProps extends Omit<LoadingButtonProps, 'type'> {
  form?: string;
  submitting?: boolean;
  submitText?: string;
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      submitting = false,
      submitText = 'Submitting...',
      children = 'Submit',
      ...props
    },
    ref
  ) => {
    return (
      <LoadingButton
        {...props}
        ref={ref}
        type="submit"
        loading={submitting}
        loadingText={submitText}
      >
        {children}
      </LoadingButton>
    );
  }
);
SubmitButton.displayName = 'SubmitButton';

export { LoadingButton, AsyncButton, SubmitButton, buttonVariants };
export type { LoadingButtonProps, AsyncButtonProps, SubmitButtonProps };
