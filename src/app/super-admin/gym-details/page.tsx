'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { useAuth } from '@/context/AuthContext';
import { Gym, Branch, Member } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminGymDetails() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [gym, setGym] = useState<Gym | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const gyms = StorageService.getCollection<Gym>('gyms');
    const target = gyms.find((g) => g.id === 'gym_1') || gyms[0];
    setGym(target);

    const b = StorageService.getCollection<Branch>('branches');
    setBranches(b.filter((x) => x.gymId === target?.id));

    const m = StorageService.getCollection<Member>('members');
    setMembers(m.filter((x) => x.gymId === target?.id));
  }, []);

  const handleToggleStatus = () => {
    if (!gym) return;
    const nextStatus = gym.status === 'active' ? 'suspended' : 'active';
    gym.status = nextStatus;
    StorageService.saveItem('gyms', gym);
    setGym({ ...gym });
    toast.success(`Gym is now ${nextStatus}`);
  };

  const handleImpersonateGymAdmin = () => {
    loginAs('gymadmin');
    toast.success(`Now viewing as Gym Admin for ${gym?.name}`);
    router.push('/admin/dashboard');
  };

  if (!gym) return null;

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <Link href="/super-admin/gyms">Gym Directory</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">{gym.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              {gym.name}
            </h1>
            <span
              className={`badge ${gym.status === 'active' ? 'badge-success' : 'badge-danger'}`}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
            >
              {gym.status.toUpperCase()}
            </span>
          </div>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            ID: {gym.id} &bull; {gym.city} &bull; Owner: {gym.ownerName || (gym as any).owner}
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${gym.status === 'active' ? 'btn-outline' : 'btn-accent'}`}
            onClick={handleToggleStatus}
          >
            <i className="fa-solid fa-ban" /> {gym.status === 'active' ? 'Suspend Gym' : 'Reactivate Gym'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImpersonateGymAdmin}
          >
            <i className="fa-solid fa-arrow-right-to-bracket" /> Login as Gym Admin
          </button>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            SaaS Plan Tier
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-purple)' }}>
            {gym.planName || 'Growth'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            ${gym.monthlyRevenue || 99} / month
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Athletes
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {gym.membersCount || members.length || 420}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Capacity: Up to 1,000 members
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Branches
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {branches.length || gym.branchesCount || 2}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Allowed: 3 branches
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Tenant Since
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {gym.joinedDate || '2025-01-15'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            Good standing (0 chargebacks)
          </span>
        </div>
      </div>

      {/* Two Column Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left: Branches & Organization Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Club Network Branches</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {branches.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {b.address} &bull; Manager: {b.managerName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success">{b.status}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {b.activeMembers || 240} members
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Organization Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Legal Name:</span>
                <div><strong>{gym.name} LLC</strong></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Owner Contact:</span>
                <div><strong>{gym.ownerEmail || (gym as any).email}</strong></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <div><strong>{gym.ownerPhone || '+1 (555) 234-5678'}</strong></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <div><strong>{gym.address}, {gym.city}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security & SaaS Subscription Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>SaaS Subscription</h3>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Tier:</span>
                <strong>{gym.planName || 'Growth'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monthly Dues:</span>
                <strong>${gym.monthlyRevenue || 99}.00 / mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Billing:</span>
                <span>2026-05-15</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span>Auto-charge (Visa •••• 4242)</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/super-admin/billing" className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                View Invoices & Billing
              </Link>
              <Link href="/super-admin/support-tickets" className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                View Support History
              </Link>
              <Link href="/super-admin/gyms" className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>
                &larr; Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
