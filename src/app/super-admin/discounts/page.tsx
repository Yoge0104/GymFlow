'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { DiscountService } from '@/services/DiscountService';
import { StorageService } from '@/services/StorageService';
import { Discount, SaasPlan } from '@/types';
import { formatINR, formatDate, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

export default function SuperAdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(1000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(2500);
  const [totalUsageLimit, setTotalUsageLimit] = useState(100);
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isPublicLandingPage, setIsPublicLandingPage] = useState(true);
  const [landingHeadline, setLandingHeadline] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  const refreshData = () => {
    setDiscounts(DiscountService.getAll());
    setPlans(StorageService.getCollection<SaasPlan>('saasPlans'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    setName('');
    setDescription('');
    setCode(`PROMO${Math.floor(Math.random() * 900 + 100)}`);
    setDiscountType('percentage');
    setDiscountValue(25);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setMinPurchaseAmount(1000);
    setMaxDiscountAmount(2500);
    setTotalUsageLimit(100);
    setFirstTimeOnly(false);
    setIsFeatured(false);
    setIsPublicLandingPage(true);
    setLandingHeadline('Special Seasonal Fitness Offer');
    setBadgeText('25% OFF');
    setSelectedPlanIds([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (d: Discount) => {
    setEditingDiscount(d);
    setName(d.name);
    setDescription(d.description);
    setCode(d.code);
    setDiscountType(d.discountType);
    setDiscountValue(d.discountValue);
    setStartDate(d.startDate);
    setEndDate(d.endDate);
    setMinPurchaseAmount(d.minPurchaseAmount || 0);
    setMaxDiscountAmount(d.maxDiscountAmount || 0);
    setTotalUsageLimit(d.totalUsageLimit || 100);
    setFirstTimeOnly(d.firstTimeOnly);
    setIsFeatured(d.isFeatured);
    setIsPublicLandingPage(d.isPublicLandingPage);
    setLandingHeadline(d.landingHeadline || '');
    setBadgeText(d.badgeText || '');
    setSelectedPlanIds(d.eligiblePlanIds || []);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Please enter promotion name and coupon code.');
      return;
    }

    const saved = DiscountService.save({
      id: editingDiscount ? editingDiscount.id : undefined,
      gymId: null, // Platform-wide discount
      name: name.trim(),
      description: description.trim(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      status: 'active',
      eligiblePlanIds: selectedPlanIds,
      minPurchaseAmount: Number(minPurchaseAmount),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : undefined,
      firstTimeOnly,
      isFeatured,
      isPublicLandingPage,
      landingHeadline,
      badgeText,
    });

    refreshData();
    setModalOpen(false);
    toast.success(`Promotion "${saved.name}" published! Public landing page updated automatically.`);
  };

  const handleToggleStatus = (d: Discount) => {
    const nextStatus = d.status === 'active' ? 'inactive' : 'active';
    d.status = nextStatus;
    DiscountService.save(d);
    refreshData();
    toast.success(`Discount ${d.code} is now ${nextStatus}. Landing page updated.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    DiscountService.delete(deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Promotion deleted.');
  };

  const columns: Column<Discount>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      sortable: true,
      render: (d) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              {d.code}
            </span>
            {d.isFeatured && <span className="badge badge-accent">Featured Landing</span>}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>{d.name}</div>
        </div>
      ),
    },
    {
      key: 'discountValue',
      header: 'Value / Benefit',
      sortable: true,
      render: (d) => (
        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>
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
      render: (d) => (
        <div>
          <span>{formatNumber(d.usedCount)} used</span>
          {d.totalUsageLimit && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> of {formatNumber(d.totalUsageLimit)} limit</span>
          )}
        </div>
      ),
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
            onClick={() => handleOpenEdit(d)}
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
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Promotions & Discounts</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Discount & Promotion Engine
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Campaign manager seamlessly synchronized with the public marketing landing page and checkout simulator.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/" target="_blank" className="btn btn-secondary">
            <i className="fa-solid fa-arrow-up-right-from-square" /> View Live Landing Page
          </Link>
          <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
            <i className="fa-solid fa-plus" /> Create Promotion
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-accent-subtle)',
          border: '1px solid var(--color-accent-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '1.1rem' }} />
        <div>
          <strong>Automatic Landing Page Synchronization Active:</strong> Any promotion marked &quot;Public Landing Page&quot; updates the top announcement banner, plan price calculations, savings badges, and coupon validations on the home page in real time.
        </div>
      </div>

      <DataTable
        data={discounts}
        columns={columns}
        searchPlaceholder="Search promotions by coupon code or campaign name..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        exportFilename="gymflow-discounts"
      />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingDiscount ? `Edit Promotion: ${editingDiscount.code}` : 'Create New Campaign Promotion'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Campaign Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Summer Fitness Sprint"
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
                      placeholder="e.g. SUMMER30"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Campaign Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Details about this offer..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-control"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Rupee (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Optional"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Min Purchase Spend (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={totalUsageLimit}
                      onChange={(e) => setTotalUsageLimit(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Landing Page Synchronization</label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isPublicLandingPage}
                        onChange={(e) => setIsPublicLandingPage(e.target.checked)}
                      />
                      Display on Public Landing Page
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      Feature in Top Announcement Banner
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Landing Headline Banner</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Summer Fitness Sprint — ₹500 Off All Plans!"
                        value={landingHeadline}
                        onChange={(e) => setLandingHeadline(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Badge Pill Text</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. ₹500 OFF SPECIAL"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  <i className="fa-solid fa-cloud-arrow-up" /> Save & Sync to Landing Page
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
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Promotion</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to delete this promotion? It will be removed from the platform and landing page.
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
