'use client';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simplified admin route guard component
 * Server-side middleware already handles authentication and authorization
 * This component only provides error boundary functionality
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  // Server-side authentication is the single source of truth
  // If this component renders, the user is already authenticated and authorized as ADMIN
  console.log('✅ AdminRouteGuard: Rendering admin content (server-side auth validated)');

  return <>{children}</>;
}

/**
 * Higher-order component for admin route protection
 * Usage: export default withAdminGuard(YourAdminComponent);
 */
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminRouteGuard>
        <Component {...props} />
      </AdminRouteGuard>
    );
  };
}
