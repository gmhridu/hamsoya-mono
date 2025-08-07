/**
 * Route Pre-compilation Strategy
 * Eliminates compilation delays for admin routes by warming them up
 * Provides ChatGPT-style instant navigation performance
 */

/**
 * Critical routes that should be pre-compiled for instant access
 */
const CRITICAL_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/orders',
  '/admin/products',
  '/admin/analytics',
  '/dashboard',
  '/profile',
  '/orders',
] as const;

/**
 * Pre-compile critical routes by making HEAD requests
 * This forces Next.js to compile the routes in advance
 */
export async function precompileRoutes(): Promise<void> {
  if (typeof window === 'undefined') return; // Server-side only

  try {
    console.log('[ROUTE-PRECOMPILATION] Starting route pre-compilation...');
    
    const precompilePromises = CRITICAL_ROUTES.map(async (route) => {
      try {
        // Use HEAD request to trigger compilation without loading content
        await fetch(route, { 
          method: 'HEAD',
          cache: 'no-cache',
        });
        console.log(`[ROUTE-PRECOMPILATION] Pre-compiled: ${route}`);
      } catch (error) {
        console.warn(`[ROUTE-PRECOMPILATION] Failed to pre-compile ${route}:`, error);
      }
    });

    await Promise.allSettled(precompilePromises);
    console.log('[ROUTE-PRECOMPILATION] Route pre-compilation completed');
  } catch (error) {
    console.error('[ROUTE-PRECOMPILATION] Pre-compilation failed:', error);
  }
}

/**
 * Pre-compile admin routes specifically
 * Called when admin user is detected
 */
export async function precompileAdminRoutes(): Promise<void> {
  if (typeof window === 'undefined') return;

  const adminRoutes = CRITICAL_ROUTES.filter(route => route.startsWith('/admin'));
  
  try {
    console.log('[ROUTE-PRECOMPILATION] Pre-compiling admin routes...');
    
    const precompilePromises = adminRoutes.map(async (route) => {
      try {
        await fetch(route, { 
          method: 'HEAD',
          cache: 'no-cache',
        });
        console.log(`[ROUTE-PRECOMPILATION] Admin route pre-compiled: ${route}`);
      } catch (error) {
        console.warn(`[ROUTE-PRECOMPILATION] Failed to pre-compile admin route ${route}:`, error);
      }
    });

    await Promise.allSettled(precompilePromises);
    console.log('[ROUTE-PRECOMPILATION] Admin route pre-compilation completed');
  } catch (error) {
    console.error('[ROUTE-PRECOMPILATION] Admin route pre-compilation failed:', error);
  }
}

/**
 * Pre-compile user routes specifically
 * Called when regular user is detected
 */
export async function precompileUserRoutes(): Promise<void> {
  if (typeof window === 'undefined') return;

  const userRoutes = CRITICAL_ROUTES.filter(route => !route.startsWith('/admin'));
  
  try {
    console.log('[ROUTE-PRECOMPILATION] Pre-compiling user routes...');
    
    const precompilePromises = userRoutes.map(async (route) => {
      try {
        await fetch(route, { 
          method: 'HEAD',
          cache: 'no-cache',
        });
        console.log(`[ROUTE-PRECOMPILATION] User route pre-compiled: ${route}`);
      } catch (error) {
        console.warn(`[ROUTE-PRECOMPILATION] Failed to pre-compile user route ${route}:`, error);
      }
    });

    await Promise.allSettled(precompilePromises);
    console.log('[ROUTE-PRECOMPILATION] User route pre-compilation completed');
  } catch (error) {
    console.error('[ROUTE-PRECOMPILATION] User route pre-compilation failed:', error);
  }
}

/**
 * Initialize route pre-compilation on app startup
 * Should be called in the root layout or app component
 */
export function initializeRoutePrecompilation(): void {
  if (typeof window === 'undefined') return;

  // Pre-compile routes after a short delay to avoid blocking initial load
  setTimeout(() => {
    precompileRoutes().catch(console.error);
  }, 1000);
}

/**
 * Role-based route pre-compilation
 * Pre-compiles routes based on user role for optimal performance
 */
export async function precompileRoleBasedRoutes(userRole: 'USER' | 'SELLER' | 'ADMIN'): Promise<void> {
  switch (userRole) {
    case 'ADMIN':
      await precompileAdminRoutes();
      break;
    case 'SELLER':
      await precompileUserRoutes();
      break;
    case 'USER':
    default:
      await precompileUserRoutes();
      break;
  }
}

/**
 * Prefetch critical resources for instant loading
 * Includes CSS, JavaScript, and other assets
 */
export function prefetchCriticalResources(): void {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    '/_next/static/css/app/admin/layout.css',
    '/_next/static/chunks/app/admin/layout.js',
    '/_next/static/chunks/app/admin/page.js',
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });
}

/**
 * Comprehensive performance optimization
 * Combines route pre-compilation with resource prefetching
 */
export async function optimizeAppPerformance(userRole?: 'USER' | 'SELLER' | 'ADMIN'): Promise<void> {
  try {
    // Prefetch critical resources
    prefetchCriticalResources();

    // Pre-compile routes based on user role
    if (userRole) {
      await precompileRoleBasedRoutes(userRole);
    } else {
      await precompileRoutes();
    }

    console.log('[PERFORMANCE] App performance optimization completed');
  } catch (error) {
    console.error('[PERFORMANCE] Performance optimization failed:', error);
  }
}
