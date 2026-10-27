'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { DiscountService } from '@/services/DiscountService';
import { PricingService } from '@/services/PricingService';
import { formatINR, formatNumber } from '@/lib/formatters';
import { useAuth } from '@/context/AuthContext';
import { GymMembershipPlan, Discount } from '@/types';
import { toast } from 'sonner';

// Standard Curated Membership Benefits for One-Click Selection
const PRESET_MEMBERSHIP_BENEFITS = [
  'Full Gym Floor Access',
  'Locker Room & Shower Privileges',
  'Cardio & Free Weights Zone',
  'Sauna & Eucalyptus Steam Room',
  'Unlimited Group Fitness Classes',
  '1-on-1 Certified Coach Consultation',
  'Customized Workout & Diet Regimen',
  'Multi-Branch All-Access Pass',
  '2 Monthly Guest Passes',
  'Towel & Hydration Service',
  '24/7 Keycard Facility Access',
  'Biometric InBody Scans & Progress Tracking',
  'Nutritionist Consultation Session',
  'Complimentary Gym Welcome Kit',
];

const BENEFIT_TIER_PRESETS = {
  standard: [
    'Full Gym Floor Access',
    'Locker Room & Shower Privileges',
    'Cardio & Free Weights Zone',
    'Biometric InBody Scans & Progress Tracking',
  ],
  pro: [
    'Full Gym Floor Access',
    'Locker Room & Shower Privileges',
    'Cardio & Free Weights Zone',
    'Unlimited Group Fitness Classes',
    '1-on-1 Certified Coach Consultation',
    'Biometric InBody Scans & Progress Tracking',
  ],
  vip: [
    'Full Gym Floor Access',
    'Locker Room & Shower Privileges',
    'Cardio & Free Weights Zone',
    'Sauna & Eucalyptus Steam Room',
    'Unlimited Group Fitness Classes',
    '1-on-1 Certified Coach Consultation',
    'Customized Workout & Diet Regimen',
    'Multi-Branch All-Access Pass',
    '2 Monthly Guest Passes',
    '24/7 Keycard Facility Access',
  ],
};

export default function AdminMembershipPlans() {
  const { user, hasPermission } = useAuth();
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymMembershipPlan | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(2499);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Quarterly' | 'Annual' | 'One-Time'>('Monthly');
  const [accessLevel, setAccessLevel] = useState<'All Branches' | 'Single Branch' | 'VIP'>('All Branches');
  const [joiningFee, setJoiningFee] = useState<number>(0);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(BENEFIT_TIER_PRESETS.standard);
  const [customBenefit, setCustomBenefit] = useState('');
  const [benefitSearch, setBenefitSearch] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [showOnLandingPage, setShowOnLandingPage] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Authorized roles check (SUPER_ADMIN, GYM_ADMIN, GYM_OWNER or hasPermission('memberships.manage' / 'memberships.edit'))
  const canManagePlans =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'GYM_OWNER' ||
    user?.role === 'GYM_ADMIN' ||
    hasPermission('memberships.manage') ||
    hasPermission('memberships.edit');

  const refreshData = () => {
    const list = StorageService.getCollection<GymMembershipPlan>('gymPlans');
    setPlans(list.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99)));
    setDiscounts(DiscountService.getAll());
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName('Monthly Starter Pass');
    setPrice(2499);
    setDurationMonths(1);
    setBillingCycle('Monthly');
    setAccessLevel('All Branches');
    setJoiningFee(0);
    setSelectedBenefits(BENEFIT_TIER_PRESETS.standard);
    setCustomBenefit('');
    setBenefitSearch('');
    setIsPopular(false);
    setStatus('active');
    setShowOnLandingPage(true);
    setDisplayOrder(plans.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: GymMembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDurationMonths(plan.durationMonths || 1);
    setBillingCycle(plan.billingCycle || 'Monthly');
    setAccessLevel(plan.accessLevel || 'All Branches');
    setJoiningFee(plan.joiningFee || 0);
    setSelectedBenefits(plan.benefits && plan.benefits.length > 0 ? plan.benefits : BENEFIT_TIER_PRESETS.standard);
    setCustomBenefit('');
    setBenefitSearch('');
    setIsPopular(!!plan.isPopular);
    setStatus(plan.status || 'active');
    setShowOnLandingPage(plan.showOnLandingPage !== false);
    setDisplayOrder(plan.displayOrder || 1);
    setModalOpen(true);
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]
    );
  };

  const applyBenefitPreset = (presetKey: 'standard' | 'pro' | 'vip') => {
    setSelectedBenefits(BENEFIT_TIER_PRESETS[presetKey]);
    if (presetKey === 'standard') {
      setName('Monthly Starter Pass');
      setPrice(2499);
      setDurationMonths(1);
      setBillingCycle('Monthly');
      setAccessLevel('Single Branch');
      setIsPopular(false);
    } else if (presetKey === 'pro') {
      setName('Quarterly Pro Athlete');
      setPrice(6499);
      setDurationMonths(3);
      setBillingCycle('Quarterly');
      setAccessLevel('All Branches');
      setIsPopular(true);
    } else {
      setName('Annual VIP All-Access');
      setPrice(19999);
      setDurationMonths(12);
      setBillingCycle('Annual');
      setAccessLevel('VIP');
      setIsPopular(true);
    }
    toast.success(`Applied "${presetKey.toUpperCase()}" benefits & pricing preset!`);
  };

  const handleAddCustomBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBenefit.trim()) return;
    if (selectedBenefits.includes(customBenefit.trim())) {
      toast.warning('Benefit is already included in the plan.');
      return;
    }
    setSelectedBenefits((prev) => [...prev, customBenefit.trim()]);
    toast.success(`Added custom benefit: "${customBenefit.trim()}"`);
    setCustomBenefit('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Plan title is required.');
      return;
    }
    if (price < 0) {
      toast.error('Price cannot be negative.');
      return;
    }

    const planToSave: GymMembershipPlan = {
      id: editingPlan ? editingPlan.id : `gplan_${Date.now()}`,
      gymId: editingPlan ? editingPlan.gymId : (user?.gymId || 'gym_1'),
      name: name.trim(),
      duration: `${durationMonths} Month${durationMonths > 1 ? 's' : ''}`,
      durationDays: durationMonths * 30,
      durationMonths: Number(durationMonths),
      price: Number(price),
      billingCycle,
      accessLevel,
      joiningFee: Number(joiningFee),
      benefits:
        selectedBenefits.length > 0
          ? selectedBenefits
          : ['Full Gym Floor Access', 'Locker Room Privileges'],
      status,
      isPopular,
      showOnLandingPage,
      displayOrder: Number(displayOrder),
    };

    StorageService.saveItem<GymMembershipPlan>('gymPlans', planToSave);
    refreshData();
    setModalOpen(false);
    toast.success(
      editingPlan
        ? `Plan "${name}" updated! Public landing page & checkout synchronized.`
        : `Plan "${name}" created successfully and published live!`
    );
  };

  const handleDelete = (plan: GymMembershipPlan) => {
    if (
      confirm(
        `Are you sure you want to deactivate or remove the membership plan "${plan.name}"?\nThis plan will be unpublished from the public landing page.`
      )
    ) {
      StorageService.deleteItem('gymPlans', plan.id);
      refreshData();
      toast.success(`Plan "${plan.name}" removed from active catalog.`);
    }
  };

  const activePromo = DiscountService.getFeaturedLandingPromotion();

  // Pricing calculations for live preview
  const livePromoPricing = PricingService.calculateDiscount(price, activePromo);
  const monthlyEquivalent = durationMonths > 1 ? Math.round(price / durationMonths) : price;

  return (
    <DashboardLayout portal="admin">
      <div
        className="page-header"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">Membership Plans</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Retail Membership Packages Catalog
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure gym pricing packages, duration terms, and synchronize promotions live with the public landing page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/discounts" className="btn btn-secondary">
            <i className="fa-solid fa-percent" /> Manage Gym Discounts
          </Link>
          {canManagePlans && (
            <button type="button" className="btn btn-accent" onClick={handleOpenCreate}>
              <i className="fa-solid fa-plus" /> Create Membership Plan
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Promotion Callout */}
      {activePromo && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              <i className="fa-solid fa-bolt" />
            </div>
            <div>
              <strong style={{ color: 'var(--color-accent-hover)', fontSize: '0.95rem' }}>
                Active Public Promotion: {activePromo.name} (Code: {activePromo.code})
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activePromo.discountType === 'percentage'
                  ? `${activePromo.discountValue}% discount auto-applied on eligible plans on public landing page.`
                  : `${formatINR(activePromo.discountValue)} flat discount active.`}
              </div>
            </div>
          </div>
          <Link href="/admin/discounts" className="btn btn-sm btn-outline-accent">
            Configure Promotions &rarr;
          </Link>
        </div>
      )}

      {/* Plans Catalog Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          alignItems: 'stretch',
        }}
      >
        {plans.map((p) => {
          const isEligible =
            activePromo &&
            (activePromo.eligiblePlanIds.length === 0 || activePromo.eligiblePlanIds.includes(p.id));
          const calc = PricingService.calculateDiscount(p.price, isEligible ? activePromo : null);

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 'var(--radius-lg)',
                border: p.isPopular ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                boxShadow: p.isPopular ? '0 10px 25px -5px rgba(16, 185, 129, 0.16)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              <div style={{ minHeight: '28px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {p.isPopular ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: 'var(--color-accent)',
                      color: '#ffffff',
                    }}
                  >
                    <i className="fa-solid fa-star" /> Most Popular
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {p.accessLevel || 'Club Tier'}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {p.showOnLandingPage && (
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }} title="Published on Public Landing Page">
                      <i className="fa-solid fa-globe" /> Landing
                    </span>
                  )}
                  <span className={`badge ${p.status === 'active' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.68rem' }}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 0.35rem' }}>
                  {p.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '0 0 1rem' }}>
                  {p.billingCycle} Access &bull; {p.accessLevel}
                </p>

                {/* Price block with promotion awareness */}
                <div style={{ margin: '1rem 0' }}>
                  {calc.discountAmount > 0 ? (
                    <div>
                      <span style={{ fontSize: '0.95rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                        {formatINR(p.price, { showDecimals: false })}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '2.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                          {formatINR(calc.finalPrice, { showDecimals: false })}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {p.billingCycle === 'Annual' ? ' /year' : ` /${p.durationMonths || 1} mo`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '0.2rem' }}>
                        Promo active ({activePromo?.code}) &bull; Save {formatINR(calc.discountAmount, { showDecimals: false })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '2.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                        {formatINR(p.price, { showDecimals: false })}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {p.billingCycle === 'Annual' ? ' /year' : ` /${p.durationMonths || 1} mo`}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Joining Fee: {p.joiningFee ? formatINR(p.joiningFee, { showDecimals: false }) : 'Nil'} &bull; Term:{' '}
                  {p.durationMonths || 1} Month{(p.durationMonths || 1) > 1 ? 's' : ''} &bull; Order #{p.displayOrder || 1}
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  Included Amenities ({p.benefits?.length || 0}):
                </div>
                <ul
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    paddingLeft: 0,
                    listStyle: 'none',
                    marginBottom: '1.5rem',
                  }}
                >
                  {(p.benefits || []).map((b, bIdx) => (
                    <li key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.85rem' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {canManagePlans && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontWeight: 700 }}
                      onClick={() => handleOpenEdit(p)}
                    >
                      <i className="fa-solid fa-pen-to-square" /> Edit Plan & Benefits
                    </button>
                  )}
                  {canManagePlans && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.35rem 0.65rem' }}
                      onClick={() => handleDelete(p)}
                      title="Deactivate or delete plan"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </div>
                <Link
                  href="/admin/members"
                  className="btn btn-outline btn-sm w-100"
                  style={{ width: '100%', textAlign: 'center', fontWeight: 600 }}
                >
                  Enroll Athlete Under Plan
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Plan with Live Automatic Price Preview & One-Click Benefit Selection */}
      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div
            className="modal active"
            style={{
              width: '95%',
              maxWidth: '1060px',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem' }}>
              <div>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                  {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Retail Membership Plan'}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Includes automatic price calculations, active discount preview, and one-click amenity selection.
                </span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.5rem 1.75rem' }}>
                <div className="modal-split-layout">
                  {/* LEFT: Configuration & Modular Benefits Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Basic Plan Metadata */}
                    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fa-solid fa-id-card text-accent" /> Plan Title & Organization
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Plan Title *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 6-Month Strength Pass"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Display Order</label>
                          <input
                            type="number"
                            className="form-control"
                            value={displayOrder}
                            min="1"
                            onChange={(e) => setDisplayOrder(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Automatic Pricing Engine */}
                    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fa-solid fa-indian-rupee-sign text-accent" /> Pricing & Term Engine
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Membership Price (INR ₹) *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={price}
                            min="0"
                            step="100"
                            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                            required
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Base package rate
                          </span>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Joining Fee (INR ₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={joiningFee}
                            min="0"
                            step="100"
                            onChange={(e) => setJoiningFee(Math.max(0, Number(e.target.value)))}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            One-time registration fee (0 for Nil)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Duration (Months)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={durationMonths}
                            min="1"
                            max="60"
                            onChange={(e) => setDurationMonths(Math.max(1, Number(e.target.value)))}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Billing Cycle</label>
                          <select
                            className="form-control"
                            value={billingCycle}
                            onChange={(e) => setBillingCycle(e.target.value as any)}
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Annual">Annual</option>
                            <option value="One-Time">One-Time</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Access Level</label>
                          <select
                            className="form-control"
                            value={accessLevel}
                            onChange={(e) => setAccessLevel(e.target.value as any)}
                          >
                            <option value="All Branches">All Branches</option>
                            <option value="Single Branch">Single Branch</option>
                            <option value="VIP">VIP All-Access</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Modular Benefit Selector ("No Manual Needed") */}
                    <div className="feature-selector-container">
                      <div className="feature-selector-header">
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <i className="fa-solid fa-list-check text-accent" /> Included Amenities & Benefits
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                            Select amenities to bundle into this plan. No manual typing needed.
                          </span>
                        </div>

                        {/* Presets */}
                        <div className="feature-selector-presets">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyBenefitPreset('standard')}
                          >
                            Standard Pass
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyBenefitPreset('pro')}
                          >
                            Pro Athlete
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyBenefitPreset('vip')}
                          >
                            VIP All-Access
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => setSelectedBenefits(PRESET_MEMBERSHIP_BENEFITS)}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => setSelectedBenefits([])}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Benefit Search Filter */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Filter amenities..."
                          value={benefitSearch}
                          onChange={(e) => setBenefitSearch(e.target.value)}
                          style={{ paddingLeft: '32px' }}
                        />
                        <i
                          className="fa-solid fa-magnifying-glass"
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                        />
                      </div>

                      {/* Benefit Chips Grid */}
                      <div className="feature-selector-grid">
                        {PRESET_MEMBERSHIP_BENEFITS.filter((b) =>
                          b.toLowerCase().includes(benefitSearch.toLowerCase())
                        ).map((benefit) => {
                          const isSelected = selectedBenefits.includes(benefit);
                          return (
                            <div
                              key={benefit}
                              className={`feature-chip ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleBenefit(benefit)}
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                  e.preventDefault();
                                  toggleBenefit(benefit);
                                }
                              }}
                            >
                              <i className={`fa-solid ${isSelected ? 'fa-square-check text-accent' : 'fa-square'}`} />
                              <span>{benefit}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Custom Benefit Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Add custom amenity (optional)..."
                          value={customBenefit}
                          onChange={(e) => setCustomBenefit(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAddCustomBenefit}
                        >
                          <i className="fa-solid fa-plus" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Status & Visibility Flags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label htmlFor="chk-active" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                          Active Status
                        </label>
                        <input
                          type="checkbox"
                          id="chk-active"
                          checked={status === 'active'}
                          onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label htmlFor="chk-popular" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                          Feature as &quot;Most Popular&quot;
                        </label>
                        <input
                          type="checkbox"
                          id="chk-popular"
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label htmlFor="chk-landing" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                          Publish on Public Landing Page & Member Portal
                        </label>
                        <input
                          type="checkbox"
                          id="chk-landing"
                          checked={showOnLandingPage}
                          onChange={(e) => setShowOnLandingPage(e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Live Automatic Price Preview */}
                  <div className="plan-live-preview-container">
                    <div className="plan-preview-live-tag">
                      <i className="fa-solid fa-eye" /> Live Retail Card Preview
                    </div>

                    <div className="plan-live-preview-card">
                      {/* Badge Row */}
                      <div className="plan-preview-badge-row">
                        {isPopular ? (
                          <span
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <i className="fa-solid fa-star" /> Most Popular
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'var(--bg-surface-secondary)',
                              color: 'var(--text-muted)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {accessLevel}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 0.35rem' }}>
                        {name || 'Untitled Membership Plan'}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                        {billingCycle} Access &bull; {accessLevel}
                      </p>

                      {/* Pricing block */}
                      <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                        {livePromoPricing.discountAmount > 0 ? (
                          <div>
                            <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              {formatINR(price, { showDecimals: false })}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                              <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-accent)', lineHeight: 1 }}>
                                {formatINR(livePromoPricing.finalPrice, { showDecimals: false })}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                /{durationMonths === 1 ? 'mo' : `${durationMonths} mos`}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '0.35rem' }}>
                              <i className="fa-solid fa-tag" /> Promo &quot;{activePromo?.code}&quot; active: Save {formatINR(livePromoPricing.discountAmount, { showDecimals: false })}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
                              {formatINR(price, { showDecimals: false })}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              /{durationMonths === 1 ? 'mo' : `${durationMonths} mos`}
                            </span>
                          </div>
                        )}

                        {durationMonths > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span>Monthly equivalent:</span>
                            <strong>{formatINR(monthlyEquivalent, { showDecimals: false })}/month</strong>
                          </div>
                        )}

                        <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '0.6rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Registration / Joining Fee:</span>
                          <strong>{joiningFee > 0 ? formatINR(joiningFee, { showDecimals: false }) : 'Nil'}</strong>
                        </div>
                      </div>

                      {/* Validity and Order */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <div><i className="fa-solid fa-calendar-check text-accent" /> Validity: {durationMonths} Month{durationMonths > 1 ? 's' : ''}</div>
                        <div><i className="fa-solid fa-arrow-down-1-9 text-accent" /> Priority: #{displayOrder}</div>
                      </div>

                      {/* Benefits Included List */}
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Included Amenities</span>
                        <span style={{ color: 'var(--color-accent)' }}>{selectedBenefits.length} Active</span>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.35rem' }}>
                        {selectedBenefits.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', padding: '0.5rem', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-sm)' }}>
                            No amenities selected yet. Select from the checklist on the left!
                          </div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {selectedBenefits.map((b, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.8rem' }} />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Simulated CTA button */}
                      <button
                        type="button"
                        className="btn btn-accent w-100"
                        style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                        disabled
                      >
                        Join with {name || 'Plan'}
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <i className="fa-solid fa-circle-check text-success" /> Synchronizes with Member Portal & Landing Page
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.75rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                }}
              >
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Total {selectedBenefits.length} amenities bundled in this plan.
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent" style={{ fontWeight: 700 }}>
                    <i className="fa-solid fa-check" /> {editingPlan ? 'Save Changes' : 'Create & Publish Plan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
