'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PermissionKey } from '@/types';
import { PermissionService } from '@/services/PermissionService';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  permission?: PermissionKey;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar({ portal }: { portal: 'super-admin' | 'admin' | 'member' }) {
  const pathname = usePathname();
  const { user, isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen, hasPermission } = useAuth();
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsub = PermissionService.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  let sections: NavSection[] = [];

  if (portal === 'super-admin') {
    sections = [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', href: '/super-admin/dashboard', icon: 'fa-solid fa-chart-pie', permission: 'platform.view' },
        ],
      },
      {
        title: 'Organizations',
        items: [
          { label: 'Gym Directory', href: '/super-admin/gyms', icon: 'fa-solid fa-building', permission: 'gyms.view' },
          { label: 'Subscriptions', href: '/super-admin/subscriptions', icon: 'fa-solid fa-receipt', permission: 'platform.manage' },
          { label: 'SaaS Plans', href: '/super-admin/plans', icon: 'fa-solid fa-tags', permission: 'platform.manage' },
          { label: 'Discounts & Offers', href: '/super-admin/discounts', icon: 'fa-solid fa-percent', permission: 'discounts.view' },
        ],
      },
      {
        title: 'Finance',
        items: [
          { label: 'Platform Billing', href: '/super-admin/billing', icon: 'fa-solid fa-credit-card', permission: 'platform.manage' },
        ],
      },
      {
        title: 'Platform Team',
        items: [
          { label: 'Platform Users', href: '/super-admin/platform-users', icon: 'fa-solid fa-user-shield', permission: 'staff.view' },
          { label: 'Roles & Matrix', href: '/super-admin/roles-permissions', icon: 'fa-solid fa-lock', permission: 'roles.view' },
          { label: 'Announcements', href: '/super-admin/announcements', icon: 'fa-solid fa-bullhorn', permission: 'platform.manage' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Support Tickets', href: '/super-admin/support-tickets', icon: 'fa-solid fa-headset', badge: '3', badgeClass: 'badge-danger', permission: 'support.view' },
          { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'fa-solid fa-list-check', permission: 'platform.view' },
          { label: 'System Health', href: '/super-admin/system-health', icon: 'fa-solid fa-heart-pulse', permission: 'platform.view' },
          { label: 'Email Templates', href: '/super-admin/email-templates', icon: 'fa-solid fa-envelope-open-text', permission: 'email_templates.view' },
          { label: 'Platform Settings', href: '/super-admin/settings', icon: 'fa-solid fa-gear', permission: 'settings.view' },
        ],
      },
    ];
  } else if (portal === 'admin') {
    sections = [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high' },
          { label: 'Branches', href: '/admin/branches', icon: 'fa-solid fa-network-wired', permission: 'branches.view' },
          { label: 'Members', href: '/admin/members', icon: 'fa-solid fa-users', permission: 'members.view' },
          { label: 'Plans', href: '/admin/membership-plans', icon: 'fa-solid fa-tags', permission: 'memberships.view' },
          { label: 'Attendance Desk', href: '/admin/attendance', icon: 'fa-solid fa-id-card-clip', permission: 'attendance.view' },
        ],
      },
      {
        title: 'Training & Classes',
        items: [
          { label: 'Trainers', href: '/admin/trainers', icon: 'fa-solid fa-user-ninja', permission: 'trainers.view' },
          { label: 'Classes & Timetable', href: '/admin/classes', icon: 'fa-solid fa-calendar-days', permission: 'classes.view' },
          { label: 'Class Bookings', href: '/admin/class-bookings', icon: 'fa-solid fa-book-bookmark', permission: 'bookings.view' },
          { label: 'Workout Plans', href: '/admin/workout-plans', icon: 'fa-solid fa-clipboard-list', permission: 'workouts.view' },
        ],
      },
      {
        title: 'Financials & Sales',
        items: [
          { label: 'Payments', href: '/admin/payments', icon: 'fa-solid fa-credit-card', permission: 'payments.view' },
          { label: 'Invoices', href: '/admin/invoices', icon: 'fa-solid fa-file-invoice-dollar', permission: 'invoices.view' },
          { label: 'Expenses', href: '/admin/expenses', icon: 'fa-solid fa-receipt', permission: 'expenses.view' },
          { label: 'Leads CRM', href: '/admin/leads', icon: 'fa-solid fa-user-plus', permission: 'leads.view' },
          { label: 'Discounts & Offers', href: '/admin/discounts', icon: 'fa-solid fa-percent', permission: 'discounts.view' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Equipment', href: '/admin/equipment', icon: 'fa-solid fa-dumbbell', permission: 'equipment.view' },
          { label: 'Maintenance', href: '/admin/maintenance', icon: 'fa-solid fa-screwdriver-wrench', permission: 'equipment.view' },
          { label: 'Reports & Analytics', href: '/admin/reports', icon: 'fa-solid fa-chart-line', permission: 'reports.view' },
        ],
      },
      {
        title: 'Administration',
        items: [
          { label: 'Staff Accounts', href: '/admin/staff', icon: 'fa-solid fa-user-tie', permission: 'staff.view' },
          { label: 'Roles & Access', href: '/admin/roles-permissions', icon: 'fa-solid fa-lock', permission: 'roles.view' },
          { label: 'Notifications', href: '/admin/notifications', icon: 'fa-solid fa-bell', permission: 'notifications.view' },
          { label: 'Email Templates', href: '/admin/email-templates', icon: 'fa-solid fa-envelope-open-text', permission: 'email_templates.view' },
          { label: 'Support Helpdesk', href: '/admin/support', icon: 'fa-solid fa-headset', permission: 'support.view' },
          { label: 'Gym Settings', href: '/admin/settings', icon: 'fa-solid fa-gear', permission: 'settings.view' },
        ],
      },
    ];
  } else {
    // Member Portal
    sections = [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', href: '/member/dashboard', icon: 'fa-solid fa-gauge-high' },
        ],
      },
      {
        title: 'Fitness & Training',
        items: [
          { label: 'Workout Plan', href: '/member/workout-plan', icon: 'fa-solid fa-clipboard-list' },
          { label: 'Classes & Timetable', href: '/member/classes', icon: 'fa-solid fa-calendar-days' },
          { label: 'My Bookings', href: '/member/my-bookings', icon: 'fa-solid fa-bookmark' },
          { label: 'Body Progress', href: '/member/progress', icon: 'fa-solid fa-chart-line' },
          { label: 'Attendance History', href: '/member/attendance', icon: 'fa-solid fa-clock-rotate-left' },
        ],
      },
      {
        title: 'Membership & Billing',
        items: [
          { label: 'My Membership', href: '/member/my-membership', icon: 'fa-solid fa-id-card' },
          { label: 'Plans & Upgrade', href: '/member/plans', icon: 'fa-solid fa-tags' },
          { label: 'Billing & Receipts', href: '/member/payments', icon: 'fa-solid fa-credit-card' },
        ],
      },
      {
        title: 'Account & Support',
        items: [
          { label: 'My Profile', href: '/member/my-profile', icon: 'fa-solid fa-user' },
          { label: 'Notifications', href: '/member/notifications', icon: 'fa-solid fa-bell' },
          { label: 'Member Support', href: '/member/support', icon: 'fa-solid fa-headset' },
        ],
      },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside
        className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${
          isMobileSidebarOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <Link href="/" className="brand-link">
            <div className="brand-icon">
              <i className="fa-solid fa-dumbbell" />
            </div>
            <div className="brand-text">
              Gym<span>Flow</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-nav">
          {sections.map((section, sIdx) => {
            // Filter items by permission
            const visibleItems = section.items.filter((item) => {
              if (!item.permission) return true;
              return hasPermission(item.permission);
            });

            if (visibleItems.length === 0) return null;

            return (
              <React.Fragment key={sIdx}>
                {section.title && <div className="nav-section-title">{section.title}</div>}
                {visibleItems.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <div key={iIdx} className="nav-item">
                      <Link
                        href={item.href}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        <i className={item.icon} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`badge ${item.badgeClass || 'badge-accent'} nav-badge`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm">
              <img src={user.avatar} alt={user.name} className="current-user-avatar" />
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name current-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
