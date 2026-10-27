// ===================================================================
// GymFlow — Centralized Role & Permission Service
// ===================================================================

import { PermissionKey, User, UserRole } from '@/types';
import { StorageService } from './StorageService';

// Permission Alias Map: maps equivalent action verbs and composite permissions
export const PERMISSION_ALIASES: Record<string, PermissionKey[]> = {
  // Dashboard
  'dashboard.view': ['dashboard.view', 'platform.view', 'gyms.view', 'members.view'],
  
  // Gyms
  'gyms.edit': ['gyms.update', 'gyms.edit'],
  'gyms.update': ['gyms.edit', 'gyms.update'],
  'gyms.delete': ['gyms.delete', 'gyms.manage_status'],
  'gyms.manage_status': ['gyms.manage_status', 'gyms.delete'],

  // Branches
  'branches.create': ['branches.manage', 'branches.create'],
  'branches.edit': ['branches.manage', 'branches.edit'],
  'branches.delete': ['branches.manage', 'branches.delete'],
  'branches.manage': ['branches.manage', 'branches.create', 'branches.edit', 'branches.delete'],

  // Members
  'members.edit': ['members.update', 'members.edit'],
  'members.update': ['members.edit', 'members.update'],

  // Memberships
  'memberships.create': ['memberships.manage', 'memberships.create'],
  'memberships.edit': ['memberships.manage', 'memberships.edit'],
  'memberships.cancel': ['memberships.manage', 'memberships.cancel'],
  'memberships.manage': ['memberships.manage', 'memberships.create', 'memberships.edit', 'memberships.cancel'],

  // Trainers
  'trainers.create': ['trainers.manage', 'trainers.create', 'staff.manage'],
  'trainers.edit': ['trainers.manage', 'trainers.edit', 'staff.manage'],
  'trainers.delete': ['trainers.manage', 'trainers.delete', 'staff.manage'],
  'trainers.manage': ['trainers.manage', 'trainers.create', 'trainers.edit', 'trainers.delete', 'staff.manage'],

  // Classes & Schedules
  'classes.create': ['classes.manage', 'classes.create'],
  'classes.edit': ['classes.manage', 'classes.edit'],
  'classes.cancel': ['classes.manage', 'classes.cancel'],
  'classes.manage': ['classes.manage', 'classes.create', 'classes.edit', 'classes.cancel'],

  // Payments
  'payments.create': ['payments.record', 'payments.create'],
  'payments.record': ['payments.create', 'payments.record'],
  'payments.refund_simulate': ['payments.refund', 'payments.refund_simulate'],
  'payments.refund': ['payments.refund_simulate', 'payments.refund'],

  // Invoices
  'invoices.edit': ['invoices.manage', 'invoices.edit'],
  'invoices.cancel': ['invoices.manage', 'invoices.cancel'],
  'invoices.export': ['invoices.print', 'invoices.export'],
  'invoices.print': ['invoices.export', 'invoices.print'],
  'invoices.manage': ['invoices.manage', 'invoices.edit', 'invoices.cancel'],

  // Discounts
  'discounts.create': ['discounts.manage', 'discounts.create'],
  'discounts.edit': ['discounts.manage', 'discounts.edit'],
  'discounts.delete': ['discounts.manage', 'discounts.delete'],
  'discounts.publish': ['discounts.manage', 'discounts.publish'],
  'discounts.manage': ['discounts.manage', 'discounts.create', 'discounts.edit', 'discounts.delete', 'discounts.publish'],

  // Reports
  'reports.export': ['reports.view', 'reports.export'],
  'reports.view': ['reports.export', 'reports.view'],

  // Email Templates
  'email_templates.create': ['email_templates.manage', 'email_templates.create'],
  'email_templates.edit': ['email_templates.manage', 'email_templates.edit'],
  'email_templates.delete': ['email_templates.manage', 'email_templates.delete'],
  'email_templates.manage': ['email_templates.manage', 'email_templates.create', 'email_templates.edit', 'email_templates.delete'],

  // Settings
  'settings.edit': ['settings.manage', 'settings.edit'],
  'settings.manage': ['settings.edit', 'settings.manage'],
};

export const ALL_PERMISSION_MODULES: {
  module: string;
  label: string;
  permissions: { key: PermissionKey; label: string; description: string }[];
}[] = [
  {
    module: 'dashboard',
    label: 'Dashboard & Telemetry',
    permissions: [
      { key: 'dashboard.view', label: 'View Dashboard', description: 'Access dashboard metrics and live telemetry' },
    ],
  },
  {
    module: 'platform',
    label: 'Platform Administration',
    permissions: [
      { key: 'platform.view', label: 'View Platform Telemetry', description: 'Access global SaaS statistics and system health' },
      { key: 'platform.manage', label: 'Manage Platform Settings', description: 'Configure multi-currency, maintenance, and global policies' },
    ],
  },
  {
    module: 'gyms',
    label: 'Gym Organizations',
    permissions: [
      { key: 'gyms.view', label: 'View Gyms Directory', description: 'Browse registered gym clubs and metrics' },
      { key: 'gyms.create', label: 'Onboard New Gyms', description: 'Register new tenant gym organizations' },
      { key: 'gyms.update', label: 'Update Gym Profile', description: 'Edit gym business info and subscription tier' },
      { key: 'gyms.edit', label: 'Edit Gym Profile (Alias)', description: 'Edit gym details and contact configuration' },
      { key: 'gyms.delete', label: 'Delete Gym Organization', description: 'Remove or archive tenant gym club' },
      { key: 'gyms.manage_status', label: 'Suspend / Activate Gyms', description: 'Toggle active, trial, or suspended states' },
    ],
  },
  {
    module: 'branches',
    label: 'Branch Management',
    permissions: [
      { key: 'branches.view', label: 'View Branches', description: 'List network club locations and operating hours' },
      { key: 'branches.create', label: 'Create Branches', description: 'Add new branch locations' },
      { key: 'branches.edit', label: 'Edit Branch Details', description: 'Modify branch address, facilities, and manager' },
      { key: 'branches.delete', label: 'Delete Branches', description: 'Decommission branch location' },
      { key: 'branches.manage', label: 'Manage Branches (Full)', description: 'Full branch administration capabilities' },
    ],
  },
  {
    module: 'members',
    label: 'Member Operations',
    permissions: [
      { key: 'members.view', label: 'View Members', description: 'View club athlete directory and membership records' },
      { key: 'members.create', label: 'Enroll New Member', description: 'Create and register new club members' },
      { key: 'members.update', label: 'Update Member File', description: 'Edit athlete status, contact, and assigned trainer' },
      { key: 'members.edit', label: 'Edit Member File (Alias)', description: 'Modify member information and notes' },
      { key: 'members.delete', label: 'Delete / Cancel Member', description: 'Permanently remove or freeze member profile' },
    ],
  },
  {
    module: 'memberships',
    label: 'Membership Plans',
    permissions: [
      { key: 'memberships.view', label: 'View Plans Catalog', description: 'Browse retail membership tiers and pricing' },
      { key: 'memberships.create', label: 'Create Plans', description: 'Define new membership plans and pricing' },
      { key: 'memberships.edit', label: 'Edit Plans', description: 'Update plan benefits, fees, and billing frequency' },
      { key: 'memberships.cancel', label: 'Cancel / Archive Plans', description: 'Retire plans from active public sale' },
      { key: 'memberships.manage', label: 'Manage Plans (Full)', description: 'Full membership plan lifecycle control' },
    ],
  },
  {
    module: 'attendance',
    label: 'Attendance & Kiosk',
    permissions: [
      { key: 'attendance.view', label: 'View Attendance Logs', description: 'Inspect check-in history and daily gym floor traffic' },
      { key: 'attendance.check_in', label: 'Process Check-Ins', description: 'Verify QR codes and perform reception desk check-ins' },
    ],
  },
  {
    module: 'trainers',
    label: 'Trainers & Instructors',
    permissions: [
      { key: 'trainers.view', label: 'View Trainers', description: 'Browse certified coaches, ratings, and bios' },
      { key: 'trainers.create', label: 'Add Trainer', description: 'Onboard new personal trainer profile' },
      { key: 'trainers.edit', label: 'Edit Trainer Profile', description: 'Update specialities, rate, and availability' },
      { key: 'trainers.delete', label: 'Delete Trainer', description: 'Remove trainer profile from active roster' },
      { key: 'trainers.manage', label: 'Manage Trainers (Full)', description: 'Comprehensive coach management' },
    ],
  },
  {
    module: 'classes',
    label: 'Classes & Schedules',
    permissions: [
      { key: 'classes.view', label: 'View Timetable', description: 'View weekly class calendar' },
      { key: 'classes.create', label: 'Schedule Class', description: 'Create new group fitness session' },
      { key: 'classes.edit', label: 'Edit Class', description: 'Change instructor, time slot, or capacity' },
      { key: 'classes.cancel', label: 'Cancel Class', description: 'Cancel scheduled class session' },
      { key: 'classes.manage', label: 'Manage Timetable (Full)', description: 'Full timetable and studio room scheduling' },
      { key: 'bookings.view', label: 'View Rosters', description: 'Inspect attendee lists and booked spots' },
      { key: 'bookings.create', label: 'Book Class Spots', description: 'Reserve class slots for members' },
      { key: 'bookings.cancel', label: 'Cancel Bookings', description: 'Release reservations and process cancellations' },
    ],
  },
  {
    module: 'workouts',
    label: 'Workout & Fitness Plans',
    permissions: [
      { key: 'workouts.view', label: 'View Workout Regimens', description: 'Browse athlete splits and exercise logs' },
      { key: 'workouts.manage', label: 'Prescribe Workouts', description: 'Build and assign personalized exercise routines' },
    ],
  },
  {
    module: 'payments',
    label: 'Payments & Transactions',
    permissions: [
      { key: 'payments.view', label: 'View Payment Ledger', description: 'Browse simulated transactions and dues' },
      { key: 'payments.create', label: 'Create Payment Record', description: 'Record member payment transaction' },
      { key: 'payments.record', label: 'Record Payments (Alias)', description: 'Process simulated cash, card, or UPI transaction' },
      { key: 'payments.refund', label: 'Process Refunds', description: 'Issue simulated refunds on transactions' },
      { key: 'payments.refund_simulate', label: 'Simulate Refund (Alias)', description: 'Simulate transaction refund flow' },
    ],
  },
  {
    module: 'invoices',
    label: 'Invoices & Billing',
    permissions: [
      { key: 'invoices.view', label: 'View Invoices', description: 'Browse itemized member invoices and billing statuses' },
      { key: 'invoices.create', label: 'Generate Invoices', description: 'Create new itemized invoices for dues or fees' },
      { key: 'invoices.edit', label: 'Edit Invoices', description: 'Modify draft line items and due dates' },
      { key: 'invoices.cancel', label: 'Cancel Invoices', description: 'Void or cancel unpaid invoices' },
      { key: 'invoices.print', label: 'Print Invoices', description: 'Access print-ready view and simulation' },
      { key: 'invoices.export', label: 'Export Invoices', description: 'Export invoice lists to CSV/PDF' },
      { key: 'invoices.manage', label: 'Manage Invoices (Full)', description: 'Full invoice lifecycle control' },
    ],
  },
  {
    module: 'expenses',
    label: 'Club Expenditures',
    permissions: [
      { key: 'expenses.view', label: 'View Expenses', description: 'Review operational club expenditures' },
      { key: 'expenses.manage', label: 'Record Expenses', description: 'Log facility rent, utilities, and vendor charges' },
    ],
  },
  {
    module: 'crm',
    label: 'Leads & Sales CRM',
    permissions: [
      { key: 'leads.view', label: 'View Sales Pipeline', description: 'Inspect inquiries, trial appointments, and stages' },
      { key: 'leads.manage', label: 'Manage Leads', description: 'Advance lead stages, record notes, and convert members' },
    ],
  },
  {
    module: 'discounts',
    label: 'Discounts & Promotions',
    permissions: [
      { key: 'discounts.view', label: 'View Promotions', description: 'View active discount codes and promotional campaigns' },
      { key: 'discounts.create', label: 'Create Discounts', description: 'Create coupon code or percentage promotion' },
      { key: 'discounts.edit', label: 'Edit Discounts', description: 'Modify discount values, limits, and valid dates' },
      { key: 'discounts.delete', label: 'Delete Discounts', description: 'Remove obsolete discount campaigns' },
      { key: 'discounts.publish', label: 'Publish Discounts', description: 'Toggle discount public display on landing page' },
      { key: 'discounts.manage', label: 'Manage Discounts (Full)', description: 'Full discount rules and lifecycle' },
    ],
  },
  {
    module: 'reports',
    label: 'Reports & Analytics',
    permissions: [
      { key: 'reports.view', label: 'View Reports', description: 'Inspect revenue, attendance, and churn graphs' },
      { key: 'reports.export', label: 'Export Reports', description: 'Export report datasets for accounting' },
    ],
  },
  {
    module: 'equipment',
    label: 'Equipment & Maintenance',
    permissions: [
      { key: 'equipment.view', label: 'View Equipment', description: 'Track gym machines, weights, and maintenance' },
      { key: 'equipment.manage', label: 'Manage Equipment', description: 'Log service dates and equipment lifecycle' },
    ],
  },
  {
    module: 'marketing',
    label: 'Email Templates & Alerts',
    permissions: [
      { key: 'email_templates.view', label: 'View Email Templates', description: 'Browse platform and gym notification templates' },
      { key: 'email_templates.create', label: 'Create Templates', description: 'Draft new email templates' },
      { key: 'email_templates.edit', label: 'Edit Templates', description: 'Customize subject lines, HTML bodies, and placeholders' },
      { key: 'email_templates.delete', label: 'Delete Templates', description: 'Remove unused email templates' },
      { key: 'email_templates.manage', label: 'Manage Templates (Full)', description: 'Full email template management' },
      { key: 'notifications.view', label: 'View Notifications', description: 'Receive system alerts and updates' },
      { key: 'notifications.manage', label: 'Broadcast Notifications', description: 'Send club-wide announcements to athletes' },
    ],
  },
  {
    module: 'system',
    label: 'Roles & Settings',
    permissions: [
      { key: 'staff.view', label: 'View Staff Accounts', description: 'Inspect club team members' },
      { key: 'staff.manage', label: 'Manage Staff Accounts', description: 'Invite, update, and manage staff members' },
      { key: 'roles.view', label: 'View Permissions Matrix', description: 'Inspect role access configurations' },
      { key: 'roles.manage', label: 'Edit Permissions Matrix', description: 'Toggle granular permissions for system roles' },
      { key: 'settings.view', label: 'View Settings', description: 'Inspect gym profile, tax rates, and policies' },
      { key: 'settings.edit', label: 'Edit Settings', description: 'Modify club settings and preferences' },
      { key: 'settings.manage', label: 'Manage Settings (Full)', description: 'Modify club identity, invoice prefixes, and policies' },
    ],
  },
];

type MatrixChangeListener = (matrix: Record<UserRole, PermissionKey[]>) => void;
const matrixListeners: Set<MatrixChangeListener> = new Set();

export const PermissionService = {
  getMatrix(): Record<UserRole, PermissionKey[]> {
    const db = StorageService.init();
    return (db.defaultRolePermissions as unknown as Record<UserRole, PermissionKey[]>) || {};
  },

  getRolePermissions(role: UserRole): PermissionKey[] {
    const matrix = this.getMatrix();
    return matrix[role] || [];
  },

  /**
   * Evaluates if a user has a specific permission key.
   * Handles SUPER_ADMIN full access, custom user overrides, and permission aliases.
   */
  hasPermission(user: User | null | undefined, permission: PermissionKey): boolean {
    if (!user) return false;

    // Super Admin has all permissions unconditionally
    if (user.role === 'SUPER_ADMIN') return true;

    // dashboard.view is granted to every authenticated role by default
    if (permission === 'dashboard.view') return true;

    // Custom user-level permission override
    if (user.customPermissions && user.customPermissions.includes(permission)) {
      return true;
    }

    const rolePerms = this.getRolePermissions(user.role);

    // Direct match
    if (rolePerms.includes(permission)) {
      return true;
    }

    // Check alias mappings (e.g. gyms.update <=> gyms.edit, branches.manage <=> branches.create)
    const aliases = PERMISSION_ALIASES[permission];
    if (aliases && aliases.some((alias) => rolePerms.includes(alias))) {
      return true;
    }

    // Check if user has a broader management permission that encompasses this action
    if (permission.endsWith('.create') || permission.endsWith('.edit') || permission.endsWith('.delete')) {
      const prefix = permission.split('.')[0];
      const broadManageKey = `${prefix}.manage` as PermissionKey;
      if (rolePerms.includes(broadManageKey)) {
        return true;
      }
    }

    return false;
  },

  hasAnyPermission(user: User | null | undefined, permissions: PermissionKey[]): boolean {
    if (!user) return false;
    return permissions.some((p) => this.hasPermission(user, p));
  },

  hasAllPermissions(user: User | null | undefined, permissions: PermissionKey[]): boolean {
    if (!user) return false;
    return permissions.every((p) => this.hasPermission(user, p));
  },

  updateRolePermissions(role: UserRole, permissions: PermissionKey[]): { success: boolean; message?: string } {
    // Safety guard: Super Admin cannot have critical governance capabilities stripped
    if (role === 'SUPER_ADMIN') {
      const criticalKeys: PermissionKey[] = ['roles.manage', 'platform.manage', 'platform.view'];
      const missingCritical = criticalKeys.filter((k) => !permissions.includes(k));
      if (missingCritical.length > 0) {
        // Enforce preservation of critical Super Admin rights to prevent administrative lockout
        permissions = Array.from(new Set([...permissions, ...criticalKeys]));
      }
    }

    const matrix = this.getMatrix();
    matrix[role] = permissions;
    const db = StorageService.init();
    db.defaultRolePermissions = matrix;
    localStorage.setItem('gymflow_db_v2', JSON.stringify(db));

    // Notify listeners for live updates without page reload
    matrixListeners.forEach((fn) => fn(matrix));

    return { success: true };
  },

  resetDefaultPermissions(): void {
    StorageService.resetDatabase();
    const updated = this.getMatrix();
    matrixListeners.forEach((fn) => fn(updated));
  },

  subscribe(listener: MatrixChangeListener): () => void {
    matrixListeners.add(listener);
    return () => matrixListeners.delete(listener);
  },
};
