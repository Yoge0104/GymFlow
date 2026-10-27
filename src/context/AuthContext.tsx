'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PermissionKey, User, UserRole } from '@/types';
import { AuthService, DEMO_ACCOUNTS } from '@/services/AuthService';
import { PermissionService } from '@/services/PermissionService';
import { StorageService } from '@/services/StorageService';

interface AuthContextType {
  user: User;
  role: UserRole;
  login: (email: string, password?: string) => { success: boolean; user: User; redirect: string };
  loginAs: (roleKey: string) => User;
  logout: () => void;
  hasPermission: (permission: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User>(DEMO_ACCOUNTS.gymadmin);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize DB
    StorageService.init();

    // Load initial user
    const currentUser = AuthService.getUser();
    setUserState(currentUser);

    // Load theme
    const savedTheme = (localStorage.getItem('gymflow_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Subscribe to auth changes
    const unsubAuth = AuthService.subscribe((updatedUser) => {
      setUserState(updatedUser);
    });

    return () => {
      unsubAuth();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('gymflow_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const login = (email: string, password?: string) => {
    const res = AuthService.login(email, password);
    setUserState(res.user);
    return res;
  };

  const loginAs = (roleKey: string) => {
    const nextUser = AuthService.loginAs(roleKey);
    setUserState(nextUser);
    return nextUser;
  };

  const logout = () => {
    AuthService.logout();
    setUserState(DEMO_ACCOUNTS.gymadmin);
  };

  const hasPermission = (permission: PermissionKey) => {
    return PermissionService.hasPermission(user, permission);
  };

  const hasAnyPermission = (permissions: PermissionKey[]) => {
    return PermissionService.hasAnyPermission(user, permissions);
  };

  const hasAllPermissions = (permissions: PermissionKey[]) => {
    return PermissionService.hasAllPermissions(user, permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        login,
        loginAs,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        theme,
        toggleTheme,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
