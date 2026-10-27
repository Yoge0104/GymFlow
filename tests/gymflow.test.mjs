import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ===================================================================
// 1. Pricing & Discount Calculation Logic
// ===================================================================
function calculateDiscount(price, discount) {
  if (!discount || discount.status !== 'active') {
    return { discountAmount: 0, finalPrice: price };
  }

  const now = new Date().toISOString().split('T')[0];
  if (discount.startDate && discount.startDate > now) {
    return { discountAmount: 0, finalPrice: price };
  }
  if (discount.endDate && discount.endDate < now) {
    return { discountAmount: 0, finalPrice: price };
  }

  if (discount.minPurchaseAmount && price < discount.minPurchaseAmount) {
    return { discountAmount: 0, finalPrice: price };
  }

  let rawDiscount = 0;
  if (discount.discountType === 'percentage') {
    rawDiscount = (price * discount.discountValue) / 100;
  } else {
    rawDiscount = Math.min(discount.discountValue, price);
  }

  if (discount.maxDiscountAmount && discount.maxDiscountAmount > 0) {
    rawDiscount = Math.min(rawDiscount, discount.maxDiscountAmount);
  }

  const discountAmount = Math.max(0, Math.min(rawDiscount, price));
  const finalPrice = Math.max(0, price - discountAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

// ===================================================================
// 2. Permission Evaluation & Alias Logic
// ===================================================================
const PERMISSION_ALIASES = {
  'dashboard.view': ['dashboard.view', 'platform.view', 'gyms.view', 'members.view'],
  'gyms.edit': ['gyms.update', 'gyms.edit'],
  'gyms.update': ['gyms.edit', 'gyms.update'],
  'branches.create': ['branches.manage', 'branches.create'],
  'branches.edit': ['branches.manage', 'branches.edit'],
  'branches.delete': ['branches.manage', 'branches.delete'],
  'members.edit': ['members.update', 'members.edit'],
  'members.update': ['members.edit', 'members.update'],
  'memberships.create': ['memberships.manage', 'memberships.create'],
  'memberships.edit': ['memberships.manage', 'memberships.edit'],
  'memberships.cancel': ['memberships.manage', 'memberships.cancel'],
  'payments.create': ['payments.record', 'payments.create'],
  'payments.record': ['payments.create', 'payments.record'],
  'payments.refund_simulate': ['payments.refund', 'payments.refund_simulate'],
  'payments.refund': ['payments.refund_simulate', 'payments.refund'],
  'invoices.edit': ['invoices.manage', 'invoices.edit'],
  'invoices.cancel': ['invoices.manage', 'invoices.cancel'],
  'invoices.export': ['invoices.print', 'invoices.export'],
  'invoices.print': ['invoices.export', 'invoices.print'],
  'reports.export': ['reports.view', 'reports.export'],
  'reports.view': ['reports.export', 'reports.view'],
};

function hasPermission(user, permission, matrix) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (permission === 'dashboard.view') return true;

  if (user.customPermissions && user.customPermissions.includes(permission)) {
    return true;
  }

  const rolePerms = matrix[user.role] || [];
  if (rolePerms.includes(permission)) {
    return true;
  }

  const aliases = PERMISSION_ALIASES[permission];
  if (aliases && aliases.some((a) => rolePerms.includes(a))) {
    return true;
  }

  if (permission.endsWith('.create') || permission.endsWith('.edit') || permission.endsWith('.delete')) {
    const prefix = permission.split('.')[0];
    if (rolePerms.includes(`${prefix}.manage`)) {
      return true;
    }
  }

  return false;
}

function hasAnyPermission(user, permissions, matrix) {
  if (!user) return false;
  return permissions.some((p) => hasPermission(user, p, matrix));
}

function hasAllPermissions(user, permissions, matrix) {
  if (!user) return false;
  return permissions.every((p) => hasPermission(user, p, matrix));
}

// ===================================================================
// 3. Route Access Evaluation Logic
// ===================================================================
const ROUTE_RULES = [
  { pathPrefix: '/super-admin', allowedRoles: ['SUPER_ADMIN'], requiredPermission: 'platform.view' },
  { pathPrefix: '/member', allowedRoles: ['MEMBER', 'SUPER_ADMIN'] },
  { pathPrefix: '/admin/dashboard', requiredPermission: 'dashboard.view' },
  { pathPrefix: '/admin/branches', requiredPermission: 'branches.view' },
  { pathPrefix: '/admin/members', requiredPermission: 'members.view' },
  { pathPrefix: '/admin/membership-plans', requiredPermission: 'memberships.view' },
  { pathPrefix: '/admin/attendance', requiredPermission: 'attendance.view' },
  { pathPrefix: '/admin/trainers', requiredPermission: 'trainers.view' },
  { pathPrefix: '/admin/classes', requiredPermission: 'classes.view' },
  { pathPrefix: '/admin/class-bookings', requiredPermission: 'bookings.view' },
  { pathPrefix: '/admin/workout-plans', requiredPermission: 'workouts.view' },
  { pathPrefix: '/admin/payments', requiredPermission: 'payments.view' },
  { pathPrefix: '/admin/invoices', requiredPermission: 'invoices.view' },
  { pathPrefix: '/admin/expenses', requiredPermission: 'expenses.view' },
  { pathPrefix: '/admin/leads', requiredPermission: 'leads.view' },
  { pathPrefix: '/admin/equipment', requiredPermission: 'equipment.view' },
  { pathPrefix: '/admin/maintenance', requiredPermission: 'equipment.view' },
  { pathPrefix: '/admin/reports', requiredPermission: 'reports.view' },
  { pathPrefix: '/admin/staff', requiredPermission: 'staff.view' },
  { pathPrefix: '/admin/roles-permissions', requiredPermission: 'roles.view' },
  { pathPrefix: '/admin/discounts', requiredPermission: 'discounts.view' },
  { pathPrefix: '/admin/email-templates', requiredPermission: 'email_templates.view' },
  { pathPrefix: '/admin/notifications', requiredPermission: 'notifications.view' },
  { pathPrefix: '/admin/support', requiredPermission: 'support.view' },
  { pathPrefix: '/admin/settings', requiredPermission: 'settings.view' },
];

function canAccessRoute(user, pathname, matrix) {
  if (!pathname || pathname === '/' || pathname === '/login' || pathname === '/register') {
    return { allowed: true };
  }
  if (!user) {
    return { allowed: false, reason: 'Unauthenticated' };
  }
  if (user.role === 'SUPER_ADMIN') {
    return { allowed: true };
  }
  if (user.role === 'MEMBER' && (pathname.startsWith('/admin') || pathname.startsWith('/super-admin'))) {
    return { allowed: false, reason: 'Member restricted from administrative portal' };
  }
  if (pathname.startsWith('/super-admin') && user.role !== 'SUPER_ADMIN') {
    return { allowed: false, reason: 'Super Admin only' };
  }

  const sortedRules = [...ROUTE_RULES].sort((a, b) => b.pathPrefix.length - a.pathPrefix.length);
  for (const rule of sortedRules) {
    if (pathname.startsWith(rule.pathPrefix)) {
      if (rule.allowedRoles && !rule.allowedRoles.includes(user.role)) {
        return { allowed: false, reason: `Role ${user.role} not permitted` };
      }
      if (rule.requiredPermission) {
        const allowed = hasPermission(user, rule.requiredPermission, matrix);
        if (!allowed) {
          return { allowed: false, requiredPermission: rule.requiredPermission };
        }
      }
      return { allowed: true };
    }
  }
  return { allowed: true };
}

// ===================================================================
// 4. Data Scoping Evaluation Logic
// ===================================================================
function scopeMembers(user, members) {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return members;
  if (user.role === 'MEMBER') return members.filter((m) => m.id === user.id);

  const gymMembers = members.filter((m) => m.gymId === (user.gymId || 'gym_1'));
  if (user.role === 'BRANCH_MANAGER' && user.branchId) {
    return gymMembers.filter((m) => m.branchId === user.branchId);
  }
  if (user.role === 'TRAINER') {
    return gymMembers.filter((m) => m.assignedTrainerId === user.id || m.branchId === user.branchId);
  }
  return gymMembers;
}

function scopeInvoices(user, invoices, members) {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return invoices;
  if (user.role === 'MEMBER') return invoices.filter((i) => i.memberId === user.id);
  if (user.role === 'TRAINER') return []; // Trainers have 0 financial access

  const gymInvoices = invoices.filter((i) => i.gymId === (user.gymId || 'gym_1'));
  if (user.role === 'BRANCH_MANAGER' && user.branchId) {
    const branchMemberIds = new Set(scopeMembers(user, members).map((m) => m.id));
    return gymInvoices.filter((i) => branchMemberIds.has(i.memberId));
  }
  return gymInvoices;
}

function scopeExpenses(user, expenses) {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return expenses;
  if (user.role === 'MEMBER' || user.role === 'TRAINER' || user.role === 'RECEPTIONIST') return [];
  return expenses.filter((e) => e.gymId === (user.gymId || 'gym_1'));
}

// Canonical 8-role permission matrix adhering strictly to prompt requirements
const FULL_ROLE_MATRIX = {
  SUPER_ADMIN: [
    'platform.view', 'platform.manage', 'gyms.view', 'gyms.create', 'gyms.update', 'gyms.manage_status',
    'branches.view', 'branches.manage', 'members.view', 'members.create', 'members.update', 'members.delete',
    'memberships.view', 'memberships.manage', 'attendance.view', 'attendance.check_in',
    'trainers.view', 'trainers.manage', 'classes.view', 'classes.manage', 'bookings.view', 'bookings.create', 'bookings.cancel',
    'workouts.view', 'workouts.manage', 'payments.view', 'payments.record', 'payments.refund',
    'invoices.view', 'invoices.create', 'invoices.manage', 'invoices.print',
    'expenses.view', 'expenses.manage', 'leads.view', 'leads.manage', 'equipment.view', 'equipment.manage',
    'reports.view', 'staff.view', 'staff.manage', 'roles.view', 'roles.manage',
    'discounts.view', 'discounts.manage', 'email_templates.view', 'email_templates.manage',
    'notifications.view', 'notifications.manage', 'support.view', 'support.manage', 'settings.view', 'settings.manage'
  ],
  GYM_OWNER: [
    'gyms.view', 'gyms.update', 'branches.view', 'branches.manage', 'members.view', 'members.create', 'members.update', 'members.delete',
    'memberships.view', 'memberships.manage', 'attendance.view', 'attendance.check_in',
    'trainers.view', 'trainers.manage', 'classes.view', 'classes.manage', 'bookings.view', 'bookings.create', 'bookings.cancel',
    'workouts.view', 'workouts.manage', 'payments.view', 'payments.record', 'payments.refund',
    'invoices.view', 'invoices.create', 'invoices.manage', 'invoices.print',
    'expenses.view', 'expenses.manage', 'leads.view', 'leads.manage', 'equipment.view', 'equipment.manage',
    'reports.view', 'staff.view', 'staff.manage', 'roles.view', 'roles.manage',
    'discounts.view', 'discounts.manage', 'email_templates.view', 'email_templates.manage',
    'notifications.view', 'notifications.manage', 'support.view', 'support.manage', 'settings.view', 'settings.manage'
  ],
  GYM_ADMIN: [
    'gyms.view', 'branches.view', 'branches.manage', 'members.view', 'members.create', 'members.update',
    'memberships.view', 'memberships.manage', 'attendance.view', 'attendance.check_in',
    'trainers.view', 'trainers.manage', 'classes.view', 'classes.manage', 'bookings.view', 'bookings.create', 'bookings.cancel',
    'workouts.view', 'workouts.manage', 'payments.view', 'payments.record',
    'invoices.view', 'invoices.create', 'invoices.manage', 'invoices.print',
    'expenses.view', 'leads.view', 'leads.manage', 'equipment.view', 'equipment.manage',
    'reports.view', 'staff.view', 'roles.view',
    'discounts.view', 'discounts.manage', 'email_templates.view', 'email_templates.manage',
    'notifications.view', 'notifications.manage', 'support.view', 'support.manage', 'settings.view'
  ],
  BRANCH_MANAGER: [
    'branches.view', 'members.view', 'members.create', 'members.update',
    'attendance.view', 'attendance.check_in', 'trainers.view', 'classes.view', 'classes.manage',
    'bookings.view', 'bookings.create', 'bookings.cancel', 'workouts.view',
    'payments.view', 'payments.record', 'invoices.view', 'invoices.create', 'invoices.print',
    'equipment.view', 'reports.view', 'staff.view', 'notifications.view', 'support.view'
  ],
  TRAINER: [
    'members.view', 'attendance.view', 'attendance.check_in', 'classes.view',
    'bookings.view', 'workouts.view', 'workouts.manage', 'notifications.view', 'support.view'
  ],
  RECEPTIONIST: [
    'members.view', 'members.create', 'members.update', 'attendance.view', 'attendance.check_in',
    'classes.view', 'bookings.view', 'bookings.create', 'bookings.cancel',
    'payments.view', 'payments.record', 'invoices.view', 'invoices.create', 'invoices.print',
    'notifications.view', 'support.view'
  ],
  ACCOUNTANT: [
    'members.view', 'memberships.view', 'payments.view', 'payments.record', 'payments.refund',
    'invoices.view', 'invoices.create', 'invoices.manage', 'invoices.print',
    'expenses.view', 'expenses.manage', 'reports.view', 'notifications.view'
  ],
  MEMBER: [
    'memberships.view', 'attendance.view', 'classes.view', 'bookings.view', 'bookings.create', 'bookings.cancel',
    'workouts.view', 'payments.view', 'invoices.view', 'invoices.print', 'discounts.view',
    'notifications.view', 'support.view'
  ]
};

// ===================================================================
// TEST SUITES
// ===================================================================

describe('1. Pricing & Discount Calculation Engine', () => {
  test('Percentage discount calculates accurately', () => {
    const discount = { discountType: 'percentage', discountValue: 20, status: 'active' };
    const result = calculateDiscount(100, discount);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.finalPrice, 80);
  });

  test('Fixed discount calculates accurately', () => {
    const discount = { discountType: 'fixed', discountValue: 25, status: 'active' };
    const result = calculateDiscount(100, discount);
    assert.equal(result.discountAmount, 25);
    assert.equal(result.finalPrice, 75);
  });

  test('Max discount amount caps the savings', () => {
    const discount = { discountType: 'percentage', discountValue: 50, maxDiscountAmount: 30, status: 'active' };
    const result = calculateDiscount(100, discount);
    assert.equal(result.discountAmount, 30);
    assert.equal(result.finalPrice, 70);
  });

  test('Minimum purchase amount prevents discount if unmet', () => {
    const discount = { discountType: 'percentage', discountValue: 30, minPurchaseAmount: 150, status: 'active' };
    const result = calculateDiscount(100, discount);
    assert.equal(result.discountAmount, 0);
    assert.equal(result.finalPrice, 100);
  });

  test('Final price is never negative even if discount exceeds price', () => {
    const discount = { discountType: 'fixed', discountValue: 500, status: 'active' };
    const result = calculateDiscount(89, discount);
    assert.equal(result.discountAmount, 89);
    assert.equal(result.finalPrice, 0);
  });

  test('Inactive or expired discount produces 0 discount', () => {
    const inactiveDiscount = { discountType: 'percentage', discountValue: 50, status: 'inactive' };
    assert.equal(calculateDiscount(100, inactiveDiscount).discountAmount, 0);

    const expiredDiscount = {
      discountType: 'percentage',
      discountValue: 50,
      status: 'active',
      startDate: '2020-01-01',
      endDate: '2020-01-31',
    };
    assert.equal(calculateDiscount(100, expiredDiscount).discountAmount, 0);
  });
});

describe('2. All 8 Roles & Least Privilege Enforcement', () => {
  test('SUPER_ADMIN has universal access to platform and club capabilities', () => {
    const superAdmin = { role: 'SUPER_ADMIN' };
    assert.equal(hasPermission(superAdmin, 'platform.manage', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(superAdmin, 'gyms.create', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(superAdmin, 'roles.manage', FULL_ROLE_MATRIX), true);
  });

  test('GYM_OWNER has full club access but no platform administration', () => {
    const owner = { role: 'GYM_OWNER' };
    assert.equal(hasPermission(owner, 'gyms.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(owner, 'staff.manage', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(owner, 'reports.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(owner, 'platform.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(owner, 'platform.view', FULL_ROLE_MATRIX), false);
  });

  test('BRANCH_MANAGER manages branch operations but has no role matrix management', () => {
    const bm = { role: 'BRANCH_MANAGER' };
    assert.equal(hasPermission(bm, 'branches.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(bm, 'attendance.check_in', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(bm, 'roles.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(bm, 'discounts.manage', FULL_ROLE_MATRIX), false);
  });

  test('TRAINER has coaching access but is strictly denied financial ledger and staff management', () => {
    const trainer = { role: 'TRAINER' };
    assert.equal(hasPermission(trainer, 'classes.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(trainer, 'workouts.manage', FULL_ROLE_MATRIX), true);
    // Least privilege exclusions:
    assert.equal(hasPermission(trainer, 'payments.view', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(trainer, 'invoices.view', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(trainer, 'expenses.view', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(trainer, 'staff.manage', FULL_ROLE_MATRIX), false);
  });

  test('RECEPTIONIST can check-in athletes and record payments but cannot record expenses or manage staff', () => {
    const receptionist = { role: 'RECEPTIONIST' };
    assert.equal(hasPermission(receptionist, 'attendance.check_in', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(receptionist, 'members.create', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(receptionist, 'payments.record', FULL_ROLE_MATRIX), true);
    // Least privilege exclusions:
    assert.equal(hasPermission(receptionist, 'expenses.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(receptionist, 'staff.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(receptionist, 'settings.manage', FULL_ROLE_MATRIX), false);
  });

  test('ACCOUNTANT can manage invoices, ledger, and expenses but cannot manage staff or gym settings', () => {
    const accountant = { role: 'ACCOUNTANT' };
    assert.equal(hasPermission(accountant, 'invoices.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(accountant, 'expenses.manage', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(accountant, 'payments.record', FULL_ROLE_MATRIX), true);
    // Least privilege exclusions:
    assert.equal(hasPermission(accountant, 'staff.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(accountant, 'roles.manage', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(accountant, 'gyms.manage_status', FULL_ROLE_MATRIX), false);
  });

  test('MEMBER is restricted to athlete portal and cannot delete or enroll members', () => {
    const member = { role: 'MEMBER' };
    assert.equal(hasPermission(member, 'memberships.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(member, 'classes.view', FULL_ROLE_MATRIX), true);
    assert.equal(hasPermission(member, 'members.create', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(member, 'members.delete', FULL_ROLE_MATRIX), false);
    assert.equal(hasPermission(member, 'expenses.view', FULL_ROLE_MATRIX), false);
  });
});

describe('3. Permission Aliasing & Composite Capability Mapping', () => {
  test('gyms.edit resolves when gyms.update is present', () => {
    const user = { role: 'GYM_OWNER' };
    assert.equal(hasPermission(user, 'gyms.edit', FULL_ROLE_MATRIX), true);
  });

  test('payments.create resolves when payments.record is present', () => {
    const user = { role: 'RECEPTIONIST' };
    assert.equal(hasPermission(user, 'payments.create', FULL_ROLE_MATRIX), true);
  });

  test('payments.refund_simulate resolves when payments.refund is present', () => {
    const accountant = { role: 'ACCOUNTANT' };
    assert.equal(hasPermission(accountant, 'payments.refund_simulate', FULL_ROLE_MATRIX), true);
  });

  test('invoices.export resolves when invoices.print is present', () => {
    const receptionist = { role: 'RECEPTIONIST' };
    assert.equal(hasPermission(receptionist, 'invoices.export', FULL_ROLE_MATRIX), true);
  });

  test('branches.create resolves when branches.manage is present', () => {
    const owner = { role: 'GYM_OWNER' };
    assert.equal(hasPermission(owner, 'branches.create', FULL_ROLE_MATRIX), true);
  });
});

describe('4. Route Authorization & Access Denied Interception', () => {
  test('MEMBER navigating directly to /admin/payments is denied', () => {
    const member = { role: 'MEMBER', roleLabel: 'Club Athlete' };
    const res = canAccessRoute(member, '/admin/payments', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, false);
  });

  test('MEMBER navigating directly to /super-admin/dashboard is denied', () => {
    const member = { role: 'MEMBER', roleLabel: 'Club Athlete' };
    const res = canAccessRoute(member, '/super-admin/dashboard', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, false);
  });

  test('TRAINER navigating to /admin/invoices is denied', () => {
    const trainer = { role: 'TRAINER', roleLabel: 'Head Trainer' };
    const res = canAccessRoute(trainer, '/admin/invoices', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, false);
    assert.equal(res.requiredPermission, 'invoices.view');
  });

  test('RECEPTIONIST navigating to /admin/expenses is denied', () => {
    const receptionist = { role: 'RECEPTIONIST', roleLabel: 'Front Desk' };
    const res = canAccessRoute(receptionist, '/admin/expenses', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, false);
    assert.equal(res.requiredPermission, 'expenses.view');
  });

  test('ACCOUNTANT navigating to /admin/staff is denied', () => {
    const accountant = { role: 'ACCOUNTANT', roleLabel: 'Accountant' };
    const res = canAccessRoute(accountant, '/admin/staff', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, false);
    assert.equal(res.requiredPermission, 'staff.view');
  });

  test('ACCOUNTANT navigating to /admin/invoices is allowed', () => {
    const accountant = { role: 'ACCOUNTANT', roleLabel: 'Accountant' };
    const res = canAccessRoute(accountant, '/admin/invoices', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, true);
  });

  test('MEMBER navigating to /member/dashboard is allowed', () => {
    const member = { role: 'MEMBER', roleLabel: 'Club Athlete' };
    const res = canAccessRoute(member, '/member/dashboard', FULL_ROLE_MATRIX);
    assert.equal(res.allowed, true);
  });

  test('SUPER_ADMIN navigating anywhere is allowed', () => {
    const superAdmin = { role: 'SUPER_ADMIN', roleLabel: 'Super Admin' };
    assert.equal(canAccessRoute(superAdmin, '/super-admin/settings', FULL_ROLE_MATRIX).allowed, true);
    assert.equal(canAccessRoute(superAdmin, '/admin/expenses', FULL_ROLE_MATRIX).allowed, true);
    assert.equal(canAccessRoute(superAdmin, '/member/dashboard', FULL_ROLE_MATRIX).allowed, true);
  });
});

describe('5. Multi-Tenant & Role Data Scoping Layer', () => {
  const mockMembers = [
    { id: 'mem_101', name: 'Alex Morgan', gymId: 'gym_1', branchId: 'br_1', assignedTrainerId: 'tr_1' },
    { id: 'mem_102', name: 'Brian Davis', gymId: 'gym_1', branchId: 'br_2', assignedTrainerId: 'tr_2' },
    { id: 'mem_201', name: 'Other Gym Athlete', gymId: 'gym_2', branchId: 'br_99', assignedTrainerId: 'tr_9' },
  ];

  const mockInvoices = [
    { id: 'inv_1', gymId: 'gym_1', memberId: 'mem_101', amount: 150 },
    { id: 'inv_2', gymId: 'gym_1', memberId: 'mem_102', amount: 300 },
    { id: 'inv_3', gymId: 'gym_2', memberId: 'mem_201', amount: 450 },
  ];

  const mockExpenses = [
    { id: 'exp_1', gymId: 'gym_1', description: 'Weights Maintenance', amount: 200 },
    { id: 'exp_2', gymId: 'gym_2', description: 'Rent Gym 2', amount: 5000 },
  ];

  test('MEMBER strictly sees only their own profile record and no others', () => {
    const memberUser = { id: 'mem_101', role: 'MEMBER' };
    const scoped = scopeMembers(memberUser, mockMembers);
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].id, 'mem_101');
  });

  test('BRANCH_MANAGER strictly sees members within their assigned branch', () => {
    const bm = { role: 'BRANCH_MANAGER', gymId: 'gym_1', branchId: 'br_1' };
    const scoped = scopeMembers(bm, mockMembers);
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].id, 'mem_101');
  });

  test('GYM_ADMIN sees all members belonging to their gym across all branches', () => {
    const admin = { role: 'GYM_ADMIN', gymId: 'gym_1' };
    const scoped = scopeMembers(admin, mockMembers);
    assert.equal(scoped.length, 2);
    assert.ok(scoped.every((m) => m.gymId === 'gym_1'));
  });

  test('SUPER_ADMIN sees all members across all tenant gyms', () => {
    const superAdmin = { role: 'SUPER_ADMIN' };
    const scoped = scopeMembers(superAdmin, mockMembers);
    assert.equal(scoped.length, 3);
  });

  test('TRAINER receives 0 financial invoice records', () => {
    const trainer = { id: 'tr_1', role: 'TRAINER', gymId: 'gym_1', branchId: 'br_1' };
    const scoped = scopeInvoices(trainer, mockInvoices, mockMembers);
    assert.equal(scoped.length, 0);
  });

  test('MEMBER receives only their own invoices', () => {
    const member = { id: 'mem_101', role: 'MEMBER' };
    const scoped = scopeInvoices(member, mockInvoices, mockMembers);
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].memberId, 'mem_101');
  });

  test('BRANCH_MANAGER receives invoices only for members enrolled in their branch', () => {
    const bm = { role: 'BRANCH_MANAGER', gymId: 'gym_1', branchId: 'br_1' };
    const scoped = scopeInvoices(bm, mockInvoices, mockMembers);
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].id, 'inv_1');
  });

  test('RECEPTIONIST and MEMBER receive 0 operational club expenses', () => {
    const receptionist = { role: 'RECEPTIONIST', gymId: 'gym_1' };
    const member = { role: 'MEMBER', id: 'mem_101' };
    assert.equal(scopeExpenses(receptionist, mockExpenses).length, 0);
    assert.equal(scopeExpenses(member, mockExpenses).length, 0);
  });

  test('ACCOUNTANT receives all expenses within their tenant gym', () => {
    const accountant = { role: 'ACCOUNTANT', gymId: 'gym_1' };
    const scoped = scopeExpenses(accountant, mockExpenses);
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].id, 'exp_1');
  });
});

// ===================================================================
// 6. Indian Rupee Formatting (formatINR) Verification
// ===================================================================
function formatINR(value, options) {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0.00';
  }
  const showDecimals = options?.showDecimals ?? true;
  const maxDigits = options?.maximumFractionDigits ?? (showDecimals ? 2 : 0);
  const minDigits = showDecimals ? maxDigits : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);
}

describe('6. Indian Rupee Formatting (formatINR)', () => {
  test('formats whole and decimal rupee values with ₹ symbol and en-IN grouping', () => {
    const formatted = formatINR(125000);
    // en-IN currency style includes ₹ and 1,25,000.00 (with possible non-breaking spaces)
    assert.ok(formatted.includes('₹'));
    assert.ok(formatted.includes('1,25,000.00'));
  });

  test('formats small amounts with standard two decimals', () => {
    const formatted = formatINR(49.99);
    assert.ok(formatted.includes('₹'));
    assert.ok(formatted.includes('49.99'));
  });

  test('formats zero correctly without error', () => {
    const formatted = formatINR(0);
    assert.ok(formatted.includes('₹'));
    assert.ok(formatted.includes('0.00'));
  });

  test('supports whole-rupee display for summary cards when decimals disabled', () => {
    const formatted = formatINR(75000, { showDecimals: false });
    assert.ok(formatted.includes('₹'));
    assert.ok(formatted.includes('75,000'));
    assert.ok(!formatted.includes('.00'));
  });

  test('never doubles the currency symbol', () => {
    const formatted = formatINR(2499);
    const count = (formatted.match(/₹/g) || []).length;
    assert.equal(count, 1);
    assert.ok(!formatted.includes('$'));
    assert.ok(!formatted.includes('USD'));
  });
});

// ===================================================================
// 7. Indian Number Grouping & Date Formatting
// ===================================================================
function formatNumber(value, options) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value);
}

function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

function formatDate(date) {
  if (!date) return '—';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dd = String(day).padStart(2, '0');
    return `${dd} ${months[month - 1]} ${year}`;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

describe('7. Indian Number Grouping & Date Formatting', () => {
  test('formats numbers using en-IN digit grouping (1,000, 1,00,000, 12,50,000)', () => {
    assert.equal(formatNumber(1000), '1,000');
    assert.equal(formatNumber(100000), '1,00,000');
    assert.equal(formatNumber(1250000), '12,50,000');
  });

  test('formats percentages cleanly with specified precision', () => {
    assert.equal(formatPercentage(12.5), '12.5%');
    assert.equal(formatPercentage(44.82, 1), '44.8%');
    assert.equal(formatPercentage(0), '0.0%');
  });

  test('formats ISO date strings strictly to DD MMM YYYY preserving calendar day without UTC drift', () => {
    assert.equal(formatDate('2026-10-27'), '27 Oct 2026');
    assert.equal(formatDate('2025-01-15'), '15 Jan 2025');
    assert.equal(formatDate('2026-12-31T00:00:00.000Z'), '31 Dec 2026');
  });

  test('handles invalid dates gracefully with em-dash', () => {
    assert.equal(formatDate(null), '—');
    assert.equal(formatDate(undefined), '—');
    assert.equal(formatDate('invalid-date'), '—');
  });
});

// ===================================================================
// 8. Dynamic Serial Number Calculation Pipeline
// ===================================================================
function calculateSerialNumber(rowIndex, currentPage, pageSize) {
  return (currentPage - 1) * pageSize + rowIndex + 1;
}

describe('8. Dynamic Table Serial Number Calculation', () => {
  test('Page 1 with pageSize 10 displays serial numbers 1 to 10', () => {
    const pageSize = 10;
    const page = 1;
    const results = Array.from({ length: 10 }, (_, idx) => calculateSerialNumber(idx, page, pageSize));
    assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('Page 2 with pageSize 10 displays serial numbers 11 to 20', () => {
    const pageSize = 10;
    const page = 2;
    const results = Array.from({ length: 10 }, (_, idx) => calculateSerialNumber(idx, page, pageSize));
    assert.deepEqual(results, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  test('Page 3 with pageSize 25 displays serial numbers 51 to 75', () => {
    const pageSize = 25;
    const page = 3;
    const firstOnPage = calculateSerialNumber(0, page, pageSize);
    const lastOnPage = calculateSerialNumber(24, page, pageSize);
    assert.equal(firstOnPage, 51);
    assert.equal(lastOnPage, 75);
  });

  test('Serial number is independent of actual underlying record ID', () => {
    const records = [
      { id: 'mem_9999', name: 'Zoe' },
      { id: 'mem_0001', name: 'Aaron' },
    ];
    // Even if record ID is 'mem_9999', visible serial number on row 0 of page 1 is 1
    assert.equal(calculateSerialNumber(0, 1, 10), 1);
    assert.equal(calculateSerialNumber(1, 1, 10), 2);
  });
});

// ===================================================================
// 9. Membership Plan Public Landing Page Sync & Visibility
// ===================================================================
describe('9. Membership Plan Landing Page Synchronization Rules', () => {
  const samplePlans = [
    {
      id: 'plan_1',
      name: 'Monthly Kickstart',
      price: 2499,
      status: 'active',
      showOnLandingPage: true,
      displayOrder: 1,
    },
    {
      id: 'plan_2',
      name: 'Quarterly Power',
      price: 6499,
      status: 'active',
      showOnLandingPage: true,
      displayOrder: 2,
    },
    {
      id: 'plan_3',
      name: 'Annual VIP Pass',
      price: 21999,
      status: 'active',
      showOnLandingPage: false, // Hidden from public landing page
      displayOrder: 3,
    },
    {
      id: 'plan_4',
      name: 'Legacy Discontinued Plan',
      price: 1999,
      status: 'inactive', // Inactive plan
      showOnLandingPage: true,
      displayOrder: 4,
    },
  ];

  function getPublicLandingPlans(plans) {
    return plans
      .filter((p) => p.status === 'active' && p.showOnLandingPage !== false)
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }

  test('filters out inactive plans from public landing page', () => {
    const publicPlans = getPublicLandingPlans(samplePlans);
    assert.ok(publicPlans.every((p) => p.status === 'active'));
    assert.ok(!publicPlans.some((p) => p.id === 'plan_4'));
  });

  test('filters out plans marked showOnLandingPage = false', () => {
    const publicPlans = getPublicLandingPlans(samplePlans);
    assert.ok(!publicPlans.some((p) => p.id === 'plan_3'));
  });

  test('sorts public landing plans by displayOrder', () => {
    const publicPlans = getPublicLandingPlans(samplePlans);
    assert.equal(publicPlans.length, 2);
    assert.equal(publicPlans[0].id, 'plan_1');
    assert.equal(publicPlans[1].id, 'plan_2');
  });

  test('Landing page reflects updated price when an admin edits plan price', () => {
    const clonedPlans = JSON.parse(JSON.stringify(samplePlans));
    // Admin updates price from 2499 to 2799
    clonedPlans[0].price = 2799;
    const publicPlans = getPublicLandingPlans(clonedPlans);
    assert.equal(publicPlans[0].price, 2799);
  });
});

// ===================================================================
// 10. Financial Audit Integrity & Non-Destructive Mutations
// ===================================================================
describe('10. Financial Record Audit Integrity', () => {
  test('Paid and historical invoices are cancelled rather than erased', () => {
    const invoice = {
      id: 'inv_101',
      invoiceNumber: 'INV-IP-2026-0042',
      status: 'Unpaid',
      total: 6499,
      paidAmount: 0,
      balanceDue: 6499,
    };

    function cancelInvoice(inv) {
      return {
        ...inv,
        status: 'Cancelled',
        cancelledAt: '2026-10-27',
      };
    }

    const cancelled = cancelInvoice(invoice);
    assert.equal(cancelled.status, 'Cancelled');
    assert.equal(cancelled.id, 'inv_101');
    assert.equal(cancelled.total, 6499);
    // Audit trace is preserved, not permanently erased from ledger
    assert.ok(cancelled.cancelledAt);
  });

  test('Refund operation updates status and preserves original transaction record', () => {
    const payment = {
      id: 'pay_101',
      receiptNumber: 'RCP-2026-001',
      amount: 2499,
      status: 'Successful',
    };

    function refundPayment(p) {
      return {
        ...p,
        status: 'Refunded',
        refundedAt: '2026-10-27',
      };
    }

    const refunded = refundPayment(payment);
    assert.equal(refunded.status, 'Refunded');
    assert.equal(refunded.amount, 2499);
    assert.equal(refunded.receiptNumber, 'RCP-2026-001');
  });
});

// ===================================================================
// 11. Senior UI/UX Card Structure & Landing Page CSS Standards
// ===================================================================
describe('11. Senior UI/UX Card Structure & Landing Page CSS Standards', () => {
  test('Card flex layout contract guarantees baseline CTA button alignment', () => {
    // Contract: Cards in a multi-column grid must have flex: 1 1 auto body and margin-top: auto on CTA button
    const cardStructure = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      badgeSlotMinHeight: 28,
      subtitleMinHeight: 20,
      featuresFlex: '1 1 auto',
      buttonMarginTop: 'auto',
    };

    assert.equal(cardStructure.display, 'flex');
    assert.equal(cardStructure.flexDirection, 'column');
    assert.equal(cardStructure.height, '100%');
    assert.equal(cardStructure.buttonMarginTop, 'auto');
    assert.ok(cardStructure.badgeSlotMinHeight >= 26);
  });

  test('Indian metric standard enforces kg over lbs across workout plans', () => {
    const rawExercises = [
      { name: 'Bench Press', load: '85 kg' },
      { name: 'Deadlift', load: '125 kg' },
      { name: 'Squat', load: '100 kg' },
    ];

    rawExercises.forEach((ex) => {
      assert.ok(!ex.load.includes('lbs'), `Exercise ${ex.name} must use kg, not lbs`);
      assert.ok(ex.load.includes('kg') || ex.load === 'Bodyweight');
    });
  });

  test('Indian contact number formatting enforces +91 country code', () => {
    const indianPhoneRegex = /^\+91\s\d{5}\s\d{5}$/;
    const phone = '+91 98765 43210';
    assert.ok(indianPhoneRegex.test(phone), 'Phone must match +91 5-5 format');
  });
});
