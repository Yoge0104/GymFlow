// ===================================================================
// GymFlow — Role-Based Authentication & Session Service
// ===================================================================

import { User, UserRole } from '@/types';

const AUTH_STORAGE_KEY = 'gymflow_current_user';

export const DEMO_ACCOUNTS: Record<string, User> = {
  superadmin: {
    id: 'usr_superadmin',
    name: 'Alex Vance',
    email: 'admin@gymflow.com',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin (Platform)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    gymId: null,
  },
  gymowner: {
    id: 'usr_gymowner',
    name: 'Marcus Vance',
    email: 'marcus@ironpulse.com',
    role: 'GYM_OWNER',
    roleLabel: 'Gym Owner',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
  },
  gymadmin: {
    id: 'usr_gymadmin',
    name: 'Marcus Vance',
    email: 'admin@ironpulse.com',
    role: 'GYM_ADMIN',
    roleLabel: 'Gym Admin',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
  },
  branchmanager: {
    id: 'usr_bm_1',
    name: 'Jordan Smith',
    email: 'jordan.bm@ironpulse.com',
    role: 'BRANCH_MANAGER',
    roleLabel: 'Branch Manager',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    branchId: 'br_1',
    branchName: 'Downtown Flagship',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  trainer: {
    id: 'tr_1',
    name: 'David Miller',
    email: 'david.m@ironpulse.com',
    role: 'TRAINER',
    roleLabel: 'Head Trainer',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    branchId: 'br_1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  },
  receptionist: {
    id: 'stf_2',
    name: 'Jessica Taylor',
    email: 'reception@ironpulse.com',
    role: 'RECEPTIONIST',
    roleLabel: 'Front Desk Reception',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    branchId: 'br_1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
  },
  accountant: {
    id: 'stf_3',
    name: 'Amanda Clark',
    email: 'amanda.c@ironpulse.com',
    role: 'ACCOUNTANT',
    roleLabel: 'Club Accountant',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
  },
  member: {
    id: 'mem_101',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'MEMBER',
    roleLabel: 'Club Athlete',
    gymId: 'gym_1',
    gymName: 'IronPulse Fitness Club',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  },
};

type AuthListener = (user: User) => void;
const authListeners: Set<AuthListener> = new Set();

export const AuthService = {
  getUser(): User {
    if (typeof window === 'undefined') {
      return DEMO_ACCOUNTS.gymadmin;
    }
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse current user from storage:', e);
    }
    return DEMO_ACCOUNTS.gymadmin;
  },

  setUser(user: User, remember = true): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      authListeners.forEach((fn) => fn(user));
    } catch (e) {
      console.error('Failed to set current user:', e);
    }
  },

  login(email: string, password?: string, remember = true): { success: boolean; user: User; redirect: string } {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanEmail.includes('admin@gymflow') || cleanEmail === 'superadmin') {
      const user = DEMO_ACCOUNTS.superadmin;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/super-admin/dashboard' };
    }

    if (cleanEmail.includes('alex.morgan') || cleanEmail === 'member' || cleanEmail.includes('member')) {
      const user = DEMO_ACCOUNTS.member;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/member/dashboard' };
    }

    if (cleanEmail.includes('amanda') || cleanEmail === 'accountant') {
      const user = DEMO_ACCOUNTS.accountant;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/admin/invoices' };
    }

    if (cleanEmail.includes('reception')) {
      const user = DEMO_ACCOUNTS.receptionist;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/admin/attendance' };
    }

    if (cleanEmail.includes('trainer') || cleanEmail.includes('david')) {
      const user = DEMO_ACCOUNTS.trainer;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/admin/classes' };
    }

    if (cleanEmail.includes('jordan') || cleanEmail.includes('branch')) {
      const user = DEMO_ACCOUNTS.branchmanager;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/admin/dashboard' };
    }

    if (cleanEmail.includes('marcus') || cleanEmail.includes('owner')) {
      const user = DEMO_ACCOUNTS.gymowner;
      this.setUser(user, remember);
      return { success: true, user, redirect: '/admin/dashboard' };
    }

    // Default to gym admin
    const user = DEMO_ACCOUNTS.gymadmin;
    this.setUser(user, remember);
    return { success: true, user, redirect: '/admin/dashboard' };
  },

  loginAs(key: keyof typeof DEMO_ACCOUNTS | UserRole | string, remember = true): User {
    const normalizedKey = key.toLowerCase().replace('_', '');
    const user = DEMO_ACCOUNTS[normalizedKey] || DEMO_ACCOUNTS.gymadmin;
    this.setUser(user, remember);
    return user;
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    authListeners.forEach((fn) => fn(DEMO_ACCOUNTS.gymadmin));
  },

  subscribe(listener: AuthListener): () => void {
    authListeners.add(listener);
    return () => authListeners.delete(listener);
  },

  getTenantGymId(): string {
    const user = this.getUser();
    return user.gymId || 'gym_1';
  },

  getActiveMemberId(): string {
    const user = this.getUser();
    return user.role === 'MEMBER' ? user.id : 'mem_101';
  },
};
