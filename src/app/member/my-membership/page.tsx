'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { Member } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function MemberMyMembershipPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  // Freeze form
  const [freezeStart, setFreezeStart] = useState('2026-06-01');
  const [freezeEnd, setFreezeEnd] = useState('2026-06-30');
  const [freezeReason, setFreezeReason] = useState('Work travel / Temporary relocation');

  useEffect(() => {
    const all = StorageService.getCollection<Member>('members');
    const cur = all.find((m) => m.id === 'mem-001') || all[0];
    setMember(cur);
  }, []);

  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Membership freeze request submitted for ${freezeStart} to ${freezeEnd}. Gym Admin will review.`);
    setShowFreezeModal(false);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Membership renewal scheduled! Your plan will extend by 12 months.');
    setShowRenewModal(false);
  };

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">My Membership</span>
          </div>
          <h1 className="page-title">Active Membership & Privileges</h1>
          <p className="page-subtitle">
            View your subscription validity, included amenities, renewal dates, and freeze options.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            <i className="fa-solid fa-print" style={{ marginRight: '0.4rem' }} /> Print Card
          </button>
          <button type="button" className="btn btn-accent" onClick={() => setShowRenewModal(true)}>
            <i className="fa-solid fa-rotate" style={{ marginRight: '0.4rem' }} /> Renew Membership
          </button>
        </div>
      </div>

      {/* VIP Membership Pass Container */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #38bdf8',
          boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.2)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '220px',
            height: '220px',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div className="card-body" style={{ padding: '2.5rem 2rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px', color: '#ffffff' }}>
                  Iron<span style={{ color: 'var(--color-accent)' }}>Pulse</span>
                </span>
                <span className="badge" style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, fontSize: '0.75rem' }}>
                  VIP PASS
                </span>
              </div>
              <h2 style={{ color: '#ffffff', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
                {member?.planName || 'Annual VIP All-Access'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Multi-Branch Access (Downtown & Westside Club)
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '0.3rem' }} /> Status: Active
              </span>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Member ID: <strong style={{ color: '#ffffff' }}>#{member?.id || 'MEM-101'}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Member Name
              </span>
              <h4 style={{ color: '#ffffff', margin: '0.25rem 0 0', fontSize: '1.1rem' }}>
                {member?.name || 'Alex Morgan'}
              </h4>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Start Date
              </span>
              <h4 style={{ color: '#ffffff', margin: '0.25rem 0 0', fontSize: '1.1rem' }}>
                {member?.startDate ? formatDate(member.startDate) : '01 May 2025'}
              </h4>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Expiration Date
              </span>
              <h4 style={{ color: '#38bdf8', margin: '0.25rem 0 0', fontSize: '1.1rem' }}>
                {member?.endDate ? formatDate(member.endDate) : '01 May 2026'}
              </h4>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Auto-Renewal
              </span>
              <h4 style={{ color: '#10b981', margin: '0.25rem 0 0', fontSize: '1.1rem' }}>
                Enabled (Visa •••• 4242)
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Perks & Actions */}
      <div className="grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fa-solid fa-crown text-accent" style={{ marginRight: '0.4rem' }} />
              Included Membership Privileges
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="stat-icon green" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div>
                  <strong>24/7 Keycard Access</strong>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>
                    Unrestricted door access to Downtown & Westside branches at any time.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="stat-icon green" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div>
                  <strong>Unlimited Group Fitness</strong>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>
                    Access to HIIT, Spin, Yoga, and Powerlifting classes at zero surcharge.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="stat-icon green" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div>
                  <strong>Spa & Hydro-Therapy</strong>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>
                    Full access to steam room, eucalyptus sauna, and dry hydro-beds.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="stat-icon green" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div>
                  <strong>Monthly Guest Passes</strong>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>
                    Bring 2 guests per calendar month at no extra fee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Actions Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fa-solid fa-sliders text-accent" style={{ marginRight: '0.4rem' }} />
                Membership Controls
              </h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/member/plans" className="btn btn-primary" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-arrow-up-right-dots" style={{ marginRight: '0.4rem' }} /> Compare & Upgrade Plan
              </Link>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowFreezeModal(true)}
              >
                <i className="fa-solid fa-snowflake" style={{ marginRight: '0.4rem' }} /> Request Membership Freeze
              </button>
              <Link href="/member/payments" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-file-invoice" style={{ marginRight: '0.4rem' }} /> Billing Statements
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Freeze Modal */}
      {showFreezeModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '520px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-snowflake text-accent" style={{ marginRight: '0.4rem' }} />
                Request Membership Freeze
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowFreezeModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleFreezeSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  You can pause your membership for 14 to 60 days per calendar year without penalty.
                </p>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={freezeStart}
                      onChange={(e) => setFreezeStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={freezeEnd}
                      onChange={(e) => setFreezeEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason for Freeze</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFreezeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Freeze Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-rotate text-accent" style={{ marginRight: '0.4rem' }} />
                Renew Annual VIP Pass
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowRenewModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleRenewSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Plan:</span>
                    <strong>Annual VIP All-Access</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Current Expiration:</span>
                    <strong>May 1, 2026</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                    <span>New Expiration:</span>
                    <strong>May 1, 2027 (+365 Days)</strong>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method on File</label>
                  <input
                    type="text"
                    className="form-control"
                    value="Visa card ending in •••• 4242 (Expires 08/28)"
                    readOnly
                    style={{ background: 'var(--bg-hover)' }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Renewal ({formatINR(21999)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
