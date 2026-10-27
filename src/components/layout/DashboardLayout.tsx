'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '@/context/AuthContext';
import { RouteAccessService } from '@/services/RouteAccessService';
import { PermissionService } from '@/services/PermissionService';
import { AccessDenied } from '@/components/common/AccessDenied';

interface DashboardLayoutProps {
  portal: 'super-admin' | 'admin' | 'member';
  children: React.ReactNode;
}

export function DashboardLayout({ portal, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [, setMatrixVersion] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Listen to live matrix changes to re-evaluate route permissions in real time
    const unsub = PermissionService.subscribe(() => {
      setMatrixVersion((v) => v + 1);
    });

    return () => {
      unsub();
    };
  }, []);

  // During SSR / initial hydration, mount smoothly
  const access = mounted ? RouteAccessService.canAccessRoute(user, pathname) : { allowed: true };

  return (
    <div className="dashboard-layout">
      <Sidebar portal={portal} />
      <div className="main-wrapper">
        <Topbar />
        <main className="content-wrapper">
          {mounted && !access.allowed ? (
            <AccessDenied
              requiredPermission={access.requiredPermission}
              reason={access.reason}
              targetPath={pathname}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
