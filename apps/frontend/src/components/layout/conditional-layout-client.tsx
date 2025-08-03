'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ConditionalLayoutClientProps {
  children: React.ReactNode;
  serverPathname: string;
}

export function ConditionalLayoutClient({ children, serverPathname }: ConditionalLayoutClientProps) {
  const clientPathname = usePathname();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Double-check that this is not an admin route
    // If either server or client pathname indicates admin route, don't render navbar/footer
    const isAdminRoute = serverPathname.startsWith('/admin') || clientPathname.startsWith('/admin');

    if (isAdminRoute) {
      setShouldRender(false);
    } else {
      setShouldRender(true);
    }
  }, [serverPathname, clientPathname]);

  // If this is an admin route, don't render the navbar/footer layout
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
