// ===================================================================
// GymFlow — Route Access Control & Authorization Service
// ===================================================================

import { PermissionKey, User, UserRole } from '@/types';
import { PermissionService } from './PermissionService';

export interface RouteRule {
  pathPrefix: string;
  exact?: boolean;
  requiredPermission?: PermissionKey;
  allowedRoles?: UserRole[];
  description: string;
}

export const ROUTE_ACCESS_RULES: RouteRule[] = [
  // Super Admin Platform Routes
  {
    pathPrefix: '/super-admin',
    allowedRoles: ['SUPER_ADMIN'],
    requiredPermission: 'platform.view',
    description: 'Platform Super Administration Console',
  },

  // Member Portal Routes
  {
    pathPrefix: '/member',
    allowedRoles: ['MEMBER', 'SUPER_ADMIN'],
    description: 'Athlete Member Portal',
  },

  // Gym Admin Dashboard & Operational Routes
  {
    pathPrefix: '/admin/dashboard',
    requiredPermission: 'dashboard.view',
    description: 'Club Overview Dashboard',
  },
  {
    pathPrefix: '/admin/branches',
    requiredPermission: 'branches.view',
    description: 'Branch Network Management',
  },
  {
    pathPrefix: '/admin/members',
    requiredPermission: 'members.view',
    description: 'Athlete Member Directory & Profiles',
  },
  {
    pathPrefix: '/admin/membership-plans',
    requiredPermission: 'memberships.view',
    description: 'Membership Pricing Plans',
  },
  {
    pathPrefix: '/admin/attendance',
    requiredPermission: 'attendance.view',
    description: 'Check-In Kiosk & Attendance Roster',
  },
  {
    pathPrefix: '/admin/trainers',
    requiredPermission: 'trainers.view',
    description: 'Trainer Roster & Schedules',
  },
  {
    pathPrefix: '/admin/classes',
    requiredPermission: 'classes.view',
    description: 'Class Schedules & Timetable',
  },
  {
    pathPrefix: '/admin/class-bookings',
    requiredPermission: 'bookings.view',
    description: 'Class Booking Reservations',
  },
  {
    pathPrefix: '/admin/workout-plans',
    requiredPermission: 'workouts.view',
    description: 'Workout Regimens & Exercise Prescriptions',
  },
  {
    pathPrefix: '/admin/payments',
    requiredPermission: 'payments.view',
    description: 'Simulated Payments & Ledger',
  },
  {
    pathPrefix: '/admin/invoices',
    requiredPermission: 'invoices.view',
    description: 'Itemized Invoices & Billing Records',
  },
  {
    pathPrefix: '/admin/expenses',
    requiredPermission: 'expenses.view',
    description: 'Club Expenditures & Operating Costs',
  },
  {
    pathPrefix: '/admin/leads',
    requiredPermission: 'leads.view',
    description: 'Sales Inquiries & Lead Pipeline',
  },
  {
    pathPrefix: '/admin/equipment',
    requiredPermission: 'equipment.view',
    description: 'Equipment Tracking & Inventory',
  },
  {
    pathPrefix: '/admin/maintenance',
    requiredPermission: 'equipment.view',
    description: 'Equipment Service & Maintenance Logs',
  },
  {
    pathPrefix: '/admin/reports',
    requiredPermission: 'reports.view',
    description: 'Financial & Operational Reports',
  },
  {
    pathPrefix: '/admin/staff',
    requiredPermission: 'staff.view',
    description: 'Staff Directory & Team Permissions',
  },
  {
    pathPrefix: '/admin/roles-permissions',
    requiredPermission: 'roles.view',
    description: 'Role-Permission Capability Matrix',
  },
  {
    pathPrefix: '/admin/discounts',
    requiredPermission: 'discounts.view',
    description: 'Discounts & Promotional Campaigns',
  },
  {
    pathPrefix: '/admin/email-templates',
    requiredPermission: 'email_templates.view',
    description: 'Email Templates & Automated Notifications',
  },
  {
    pathPrefix: '/admin/notifications',
    requiredPermission: 'notifications.view',
    description: 'Broadcast Notifications & Alerts',
  },
  {
    pathPrefix: '/admin/support',
    requiredPermission: 'support.view',
    description: 'Customer Support Helpdesk',
  },
  {
    pathPrefix: '/admin/settings',
    requiredPermission: 'settings.view',
    description: 'Club Configuration & Preferences',
  },
];

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: PermissionKey;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const RouteAccessService = {
  getDefaultDashboardForRole(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'MEMBER':
        return '/member/dashboard';
      case 'TRAINER':
        return '/admin/classes';
      case 'RECEPTIONIST':
        return '/admin/attendance';
      case 'ACCOUNTANT':
        return '/admin/invoices';
      case 'BRANCH_MANAGER':
      case 'GYM_OWNER':
      case 'GYM_ADMIN':
      default:
        return '/admin/dashboard';
    }
  },

  canAccessRoute(user: User | null | undefined, pathname: string): AccessCheckResult {
    // Public routes are always accessible
    if (
      !pathname ||
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forgot-password'
    ) {
      return { allowed: true };
    }

    if (!user) {
      return {
        allowed: false,
        reason: 'Authentication required. Please sign in to access this portal.',
        redirectPath: '/login',
      };
    }

    // Super Admin has universal access
    if (user.role === 'SUPER_ADMIN') {
      return { allowed: true };
    }

    // Member trying to access administrative routes
    if (user.role === 'MEMBER' && (pathname.startsWith('/admin') || pathname.startsWith('/super-admin'))) {
      return {
        allowed: false,
        reason: 'Athlete members are restricted to the Member Portal.',
        redirectPath: '/member/dashboard',
      };
    }

    // Non-super-admins trying to access platform super-admin console
    if (pathname.startsWith('/super-admin')) {
      return {
        allowed: false,
        reason: 'The Platform Super Admin console requires SUPER_ADMIN credentials.',
        requiredPermission: 'platform.view',
        redirectPath: this.getDefaultDashboardForRole(user.role),
      };
    }

    // Match against specific route access rules
    // Match longest prefix first
    const sortedRules = [...ROUTE_ACCESS_RULES].sort((a, b) => b.pathPrefix.length - a.pathPrefix.length);

    for (const rule of sortedRules) {
      const isMatch = rule.exact
        ? pathname === rule.pathPrefix
        : pathname.startsWith(rule.pathPrefix);

      if (isMatch) {
        // Check allowed roles if specified
        if (rule.allowedRoles && !rule.allowedRoles.includes(user.role)) {
          return {
            allowed: false,
            reason: `Access restricted. Your current role (${user.roleLabel}) is not permitted on this route.`,
            allowedRoles: rule.allowedRoles,
            redirectPath: this.getDefaultDashboardForRole(user.role),
          };
        }

        // Check required permission if specified
        if (rule.requiredPermission) {
          const hasPerm = PermissionService.hasPermission(user, rule.requiredPermission);
          if (!hasPerm) {
            return {
              allowed: false,
              reason: `Insufficient privileges. You need the '${rule.requiredPermission}' capability to view ${rule.description}.`,
              requiredPermission: rule.requiredPermission,
              redirectPath: this.getDefaultDashboardForRole(user.role),
            };
          }
        }

        return { allowed: true };
      }
    }

    // Default: allow if no explicit restrictive rule matches
    return { allowed: true };
  },
};
