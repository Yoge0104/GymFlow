'use client';

import { useAuth } from '@/context/AuthContext';
import { PermissionKey } from '@/types';

export function usePermission(permission: PermissionKey): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, role } = useAuth();
  return { hasPermission, hasAnyPermission, hasAllPermissions, user, role };
}
