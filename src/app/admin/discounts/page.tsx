'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { DiscountService } from '@/services/DiscountService';
import { StorageService } from '@/services/StorageService';
import { Discount, GymMembershipPlan } from '@/types';
import { formatINR, formatDate, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState(500);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(1000);
  const [isPublicLandingPage, setIsPublicLandingPage] = useState(true);
  const [badgeText, setBadgeText] = useState('₹500 OFF');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const refreshData = () => {
    setDiscounts(DiscountService.getByGym('gym_1'));
    setPlans(StorageService.getCollection<GymMembershipPlan>('gymPlans'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setName('');
    setCode(`PROMO${Math.floor(Math.random() * 900 + 100)}`);
    setDiscountType('fixed');
    setDiscountValue(500);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setMinPurchaseAmount(1000);
    setIsPublicLandingPage(true);
    setBadgeText('₹500 OFF');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (d: Discount) => {
    setEditingDiscount(d);
    setName(d.name);
    setCode(d.code);
    setDiscountType(d.discountType);
    setDiscountValue(d.discountValue);
    setStartDate(d.startDate);
    setEndDate(d.endDate);
    setMinPurchaseAmount(d.minPurchaseAmount || 0);
    setIsPublicLandingPage(d.isPublicLandingPage ?? true);
    setBadgeText(d.badgeText || '');
    setStatus(d.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Please provide a coupon name and code.');
      return;
    }

    const saved = DiscountService.save({
      id: editingDiscount ? editingDiscount.id : undefined,
      gymId: 'gym_1',
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      status,
      minPurchaseAmount: Number(minPurchaseAmount),
      isPublicLandingPage,
      badgeText: badgeText.trim() || (discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`),
      totalUsageLimit: editingDiscount?.totalUsageLimit || 100,
      usedCount: editingDiscount?.usedCount || 0,
    });

    refreshData();
    setModalOpen(false);
    toast.success(editingDiscount ? `Coupon "${saved.code}" updated successfully.` : `Discount "${saved.code}" active! Landing page synchronized.`);
  };

  const handleToggleStatus = (d: Discount) => {
    const nextStatus = d.status === 'active' ? 'inactive' : 'active';
    d.status = nextStatus;
    DiscountService.save(d);
    refreshData();
    toast.success(`Discount ${d.code} is now ${nextStatus}.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    DiscountService.delete(deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Discount coupon removed.');
  };

  const columns: Column<Discount>[] = [
    {
      key: 'code',
      header: 'Coupon Code & Name',
      sortable: true,
      render: (d) => (
        <div>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            {d.code}
          </span>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>{d.name}</div>
        </div>
      ),
    },
    {
      key: 'discountValue',
      header: 'Benefit',
      sortable: true,
      render: (d) => (
        <div>
          <strong style={{ color: 'var(--color-accent)' }}>
            {d.discountType === 'percentage' ? `${d.discountValue}% OFF` : `${formatINR(d.discountValue)} OFF`}
          </strong>
          {d.minPurchaseAmount > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Min spend: {formatINR(d.minPurchaseAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'usedCount',
      header: 'Redemptions',
      sortable: true,
      render: (d) => <span>{formatNumber(d.usedCount)} used</span>,
    },
    {
      key: 'dates',
      header: 'Validity Period',
      render: (d) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {formatDate(d.startDate)} to {formatDate(d.endDate)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (d) => (
        <span className={`badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
          {d.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => openEditModal(d)}
          >
            Edit
          </button>
          <button
            type="button"
            className={`btn btn-sm ${d.status === 'active' ? 'btn-outline' : 'btn-accent'}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleToggleStatus(d)}
          >
            {d.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
            onClick={() => setDeleteId(d.id)}
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Discounts</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Club Membership Promotions & Coupons
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Manage discount codes applied during athlete onboarding, renewals, and marketing pages.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={openCreateModal}>
            <i className="fa-solid fa-plus" /> Create Coupon
          </button>
        </div>
      </div>

      <DataTable
        data={discounts}
        columns={columns}
        searchPlaceholder="Search coupons..."
        exportFilename="ironpulse-discounts"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingDiscount ? 'Edit Gym Promotion' : 'Create Gym Promotion'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Promotion Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kickstart Promo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coupon Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                      <option value="fixed">Fixed Rupee (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Benefit Value</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Min Purchase (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Badge Label</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ₹500 OFF"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Valid From</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valid Until</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingDiscount ? 'Save Changes' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Coupon</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to delete this promotion? It will no longer be available for checkouts.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
