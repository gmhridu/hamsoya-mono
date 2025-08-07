'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ViewTransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * ViewTransitionLink Component
 * 
 * A client-side navigation component that uses the browser's native View Transition API
 * for smooth page transitions. Falls back gracefully for browsers that don't support it.
 * 
 * Features:
 * - Native View Transitions for supported browsers
 * - Graceful fallback to regular navigation
 * - Preserves accessibility attributes
 * - Supports all standard link props
 * - Maintains browser history correctly
 */
export const ViewTransitionLink = forwardRef<HTMLAnchorElement, ViewTransitionLinkProps>(
  (
    {
      href,
      children,
      className,
      replace = false,
      scroll = true,
      onClick,
      target,
      rel,
      'aria-label': ariaLabel,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      // Call custom onClick handler if provided
      if (onClick) {
        onClick(e);
      }

      // Don't intercept if:
      // - Default was prevented
      // - It's a modified click (ctrl, shift, etc.)
      // - It's a right click
      // - It has a target attribute (external links)
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0 ||
        target
      ) {
        return;
      }

      e.preventDefault();

      // Check if View Transitions are supported
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        // Use View Transition API for smooth navigation
        (document as any).startViewTransition(() => {
          if (replace) {
            router.replace(href, { scroll });
          } else {
            router.push(href, { scroll });
          }
        });
      } else {
        // Fallback to regular navigation
        if (replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }
      }
    };

    return (
      <a
        ref={ref}
        href={href}
        className={cn(className)}
        onClick={handleClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        role={role}
        tabIndex={tabIndex}
        {...props}
      >
        {children}
      </a>
    );
  }
);

ViewTransitionLink.displayName = 'ViewTransitionLink';

/**
 * Hook for programmatic navigation with View Transitions
 * 
 * Use this hook when you need to navigate programmatically (e.g., after form submission)
 * while still getting the benefits of View Transitions.
 */
export function useViewTransitionRouter() {
  const router = useRouter();

  const push = (href: string, options?: { scroll?: boolean }) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.push(href, options);
      });
    } else {
      router.push(href, options);
    }
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.replace(href, options);
      });
    } else {
      router.replace(href, options);
    }
  };

  const back = () => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.back();
      });
    } else {
      router.back();
    }
  };

  const forward = () => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.forward();
      });
    } else {
      router.forward();
    }
  };

  return {
    push,
    replace,
    back,
    forward,
  };
}
