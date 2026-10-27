'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RouteAccessService } from '@/services/RouteAccessService';
import { UserRole } from '@/types';
import { toast } from 'sonner';

interface DemoRoleCard {
  key: string;
  role: UserRole;
  label: string;
  email: string;
  icon: string;
  color: string;
  tag: string;
  initialPath: string;
  description: string;
}

const SEEDED_DEMO_ROLES: DemoRoleCard[] = [
  {
    key: 'superadmin',
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    email: 'admin@gymflow.com',
    icon: 'fa-solid fa-shield-halved',
    color: 'var(--color-purple, #8b5cf6)',
    tag: 'Platform Console',
    initialPath: '/super-admin/dashboard',
    description: 'Universal platform management, tenant gyms, subscriptions & SaaS telemetry',
  },
  {
    key: 'gymowner',
    role: 'GYM_OWNER',
    label: 'Gym Owner',
    email: 'marcus@ironpulse.com',
    icon: 'fa-solid fa-crown',
    color: 'var(--color-electric, #3b82f6)',
    tag: 'Club Executive',
    initialPath: '/admin/dashboard',
    description: 'Complete club governance, pricing plans, team management & revenue analytics',
  },
  {
    key: 'gymadmin',
    role: 'GYM_ADMIN',
    label: 'Gym Admin',
    email: 'admin@ironpulse.com',
    icon: 'fa-solid fa-building',
    color: 'var(--color-electric, #3b82f6)',
    tag: 'Club Operations',
    initialPath: '/admin/dashboard',
    description: 'Operational administration, athlete roster, class timetable & discounts',
  },
  {
    key: 'branchmanager',
    role: 'BRANCH_MANAGER',
    label: 'Branch Manager',
    email: 'jordan.bm@ironpulse.com',
    icon: 'fa-solid fa-network-wired',
    color: '#0891b2',
    tag: 'Downtown Flagship',
    initialPath: '/admin/dashboard',
    description: 'Scoped to Downtown Flagship branch records, attendance, staff & equipment',
  },
  {
    key: 'trainer',
    role: 'TRAINER',
    label: 'Head Trainer',
    email: 'david.m@ironpulse.com',
    icon: 'fa-solid fa-user-ninja',
    color: '#d97706',
    tag: 'Fitness Coaching',
    initialPath: '/admin/classes',
    description: 'Assigned workout regimens, classes & athlete fitness plans (no financial records)',
  },
  {
    key: 'receptionist',
    role: 'RECEPTIONIST',
    label: 'Front Desk Reception',
    email: 'reception@ironpulse.com',
    icon: 'fa-solid fa-id-card-clip',
    color: '#059669',
    tag: 'Front Desk Kiosk',
    initialPath: '/admin/attendance',
    description: 'Check-in validation kiosk, athlete enrollment & point-of-sale receipt recording',
  },
  {
    key: 'accountant',
    role: 'ACCOUNTANT',
    label: 'Club Accountant',
    email: 'amanda.c@ironpulse.com',
    icon: 'fa-solid fa-file-invoice-dollar',
    color: '#4f46e5',
    tag: 'Finance & Ledger',
    initialPath: '/admin/invoices',
    description: 'Invoices, payment settlements, club expenses & tax reports (no user admin)',
  },
  {
    key: 'member',
    role: 'MEMBER',
    label: 'Club Athlete',
    email: 'alex.morgan@example.com',
    icon: 'fa-solid fa-person-running',
    color: 'var(--color-accent, #10b981)',
    tag: 'Member Portal',
    initialPath: '/member/dashboard',
    description: 'Personal workout splits, class timetable, check-in history & invoice receipts',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

  const handleQuickLogin = (demo: DemoRoleCard) => {
    const user = loginAs(demo.key);
    toast.success(`Logged in as ${user.roleLabel}`);
    const target = demo.initialPath || RouteAccessService.getDefaultDashboardForRole(user.role);
    router.push(target);
  };

  const handleFillCredentials = (demo: DemoRoleCard) => {
    setEmail(demo.email);
    setPassword('DemoPass123!');
    setActiveTab('credentials');
    toast.info(`Filled credentials for ${demo.label}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    const res = login(email, password);
    toast.success(`Welcome back, ${res.user.name}!`);
    router.push(res.redirect);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'linear-gradient(135deg, var(--bg-body) 0%, var(--bg-surface-secondary) 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link href="/" className="brand-link" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div className="brand-icon">
              <i className="fa-solid fa-dumbbell" />
            </div>
            <div className="brand-text">
              Gym<span>Flow</span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            Sign In to GymFlow
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Select an authorized demo role account or enter your credentials.
          </p>
        </div>

        {/* Prototype Security Disclaimer */}
        <div

        >


        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'quick' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'quick' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'quick' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fa-solid fa-bolt" style={{ color: 'var(--color-accent)', marginRight: '0.35rem' }} />
            One-Click Demo Roles (8 Accounts)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'credentials' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'credentials' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'credentials' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fa-solid fa-key" style={{ marginRight: '0.35rem' }} />
            Credentials Form
          </button>
        </div>

        {activeTab === 'quick' ? (
          /* 8 Seeded Demo Accounts Grid */
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {SEEDED_DEMO_ROLES.map((demo) => (
                <div
                  key={demo.key}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.65rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className={demo.icon} style={{ color: demo.color, fontSize: '1.1rem' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{demo.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0,0,0,0.06)',
                          color: 'var(--text-subtle)',
                          fontWeight: 600,
                        }}
                      >
                        {demo.tag}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <code>{demo.email}</code>
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', lineHeight: 1.35 }}>
                      {demo.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleQuickLogin(demo)}
                    >
                      <i className="fa-solid fa-arrow-right-to-bracket" /> Login
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleFillCredentials(demo)}
                      title="Fill into credentials form"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. admin@ironpulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Remember this device
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100" style={{ width: '100%', padding: '0.75rem' }}>
              <i className="fa-solid fa-arrow-right-to-bracket" /> Sign In with Credentials
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an organization account?{' '}
          <Link href="/register" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            Register Your Gym
          </Link>
        </div>
      </div>
    </div>
  );
}
