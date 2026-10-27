'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PermissionKey } from '@/types';

interface PermissionGateProps {
  permission?: PermissionKey;
  permissions?: PermissionKey[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    isAllowed = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    isAllowed = true;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
