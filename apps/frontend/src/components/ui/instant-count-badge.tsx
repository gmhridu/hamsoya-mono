/**
 * Instant Count Badge
 * Displays count from cookies for instant loading, then syncs with store
 * Prevents loading states and provides Amazon-style instant feedback
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface InstantCountBadgeProps {
  type: 'cart' | 'bookmark';
  storeCount: number;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

/**
 * Get count from cookie for instant display
 */
function getCookieCount(type: 'cart' | 'bookmark'): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const cookieName = type === 'cart' ? 'cart_count' : 'bookmark_count';
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`));
    
    if (cookie) {
      const value = cookie.split('=')[1];
      return parseInt(value, 10) || 0;
    }
    
    return 0;
  } catch {
    return 0;
  }
}

export function InstantCountBadge({ 
  type, 
  storeCount, 
  className, 
  variant = 'destructive' 
}: InstantCountBadgeProps) {
  const [cookieCount, setCookieCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Get cookie count immediately for instant display
  useEffect(() => {
    setCookieCount(getCookieCount(type));
    setIsHydrated(true);
  }, [type]);

  // Use cookie count initially, then switch to store count when available
  const displayCount = isHydrated && storeCount !== undefined ? storeCount : cookieCount;

  // Don't render if count is 0
  if (displayCount <= 0) {
    return null;
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-[1rem] min-h-[1rem]",
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}

/**
 * Server-side count badge that shows count from cookies
 * Use this for server-side rendering to show counts immediately
 */
interface ServerCountBadgeProps {
  count: number;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export function ServerCountBadge({ 
  count, 
  className, 
  variant = 'destructive' 
}: ServerCountBadgeProps) {
  // Don't render if count is 0
  if (count <= 0) {
    return null;
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-[1rem] min-h-[1rem]",
        className
      )}
    >
      {count}
    </Badge>
  );
}
