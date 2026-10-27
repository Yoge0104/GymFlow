'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { SaasPlan } from '@/types';
import { SUPER_ADMIN_PLAN_FEATURES } from '@/lib/mock-data';
import { formatINR } from '@/lib/formatters';
import { toast } from 'sonner';

// Curated categorized feature groups for SaaS tiers
const SAAS_FEATURE_CATEGORIES = [
  {
    category: 'Operations & Facility',
    icon: 'fa-dumbbell',
    features: [
      'Multi-Branch Gym Management',
      'Live Attendance Kiosk & QR Desk',
      'Member & Athlete Self-Service Portal',
      'Coach & Trainer Scheduling',
      'Equipment & Maintenance Tracking',
      'Lead CRM & Inquiries Pipeline',
    ],
  },
  {
    category: 'Financial & Commerce',
    icon: 'fa-file-invoice-dollar',
    features: [
      'Automated Indian GST Invoicing',
      'Point of Sale (POS) & Walk-In Ledger',
      'Online UPI & Card Payment Gateway',
      'Operational Expense & Vendor Tracking',
      'Promotional Coupon & Discount Engine',
    ],
  },
  {
    category: 'Reporting & Governance',
    icon: 'fa-chart-pie',
    features: [
      'Executive MRR & Revenue Analytics',
      'Multi-Tenant Role & Permissions Matrix',
      'Attendance & Peak Hour Heatmaps',
      'Consolidated Multi-Branch Auditing',
    ],
  },
  {
    category: 'Infrastructure & Support',
    icon: 'fa-server',
    features: [
      'Automated SMS & WhatsApp Alerts',
      'Custom Domain & Whitelabel Branding',
      'Developer API & Webhooks Access',
      'Dedicated Key Account Manager',
      '24/7 Priority SLA Technical Support',
    ],
  },
];

// Quick Presets
const FEATURE_PRESETS = {
  starter: [
    '1 Gym Branch',
    'Up to 300 active members',
    'Live Attendance Kiosk & QR Desk',
    'Automated Indian GST Invoicing',
    'Member & Athlete Self-Service Portal',
    'Email Support',
  ],
  growth: [
    'Multi-Branch Gym Management',
    'Live Attendance Kiosk & QR Desk',
    'Coach & Trainer Scheduling',
    'Automated Indian GST Invoicing',
    'Point of Sale (POS) & Walk-In Ledger',
    'Lead CRM & Inquiries Pipeline',
    'Equipment & Maintenance Tracking',
    '24/7 Priority SLA Technical Support',
  ],
  enterprise: [
    'Multi-Branch Gym Management',
    'Live Attendance Kiosk & QR Desk',
    'Coach & Trainer Scheduling',
    'Automated Indian GST Invoicing',
    'Point of Sale (POS) & Walk-In Ledger',
    'Executive MRR & Revenue Analytics',
    'Multi-Tenant Role & Permissions Matrix',
    'Custom Domain & Whitelabel Branding',
    'Developer API & Webhooks Access',
    'Dedicated Key Account Manager',
    '24/7 Priority SLA Technical Support',
  ],
};

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SaasPlan | null>(null);

  // Form state
  const [name, setName] = useState('Growth Tier');
  const [badge, setBadge] = useState('Recommended');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(6999);
  const [annualPrice, setAnnualPrice] = useState<number>(69999);
  const [autoSyncAnnual, setAutoSyncAnnual] = useState(true);
  const [maxBranches, setMaxBranches] = useState<number>(3);
  const [maxMembers, setMaxMembers] = useState<number>(1000);
  const [staffLimit, setStaffLimit] = useState<number>(10);
  const [trialDays, setTrialDays] = useState<number>(14);

  // Feature Select state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(FEATURE_PRESETS.growth);
  const [customFeature, setCustomFeature] = useState('');
  const [featureSearch, setFeatureSearch] = useState('');

  const refreshData = () => {
    setPlans(StorageService.getCollection<SaasPlan>('saasPlans'));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, []);

  const handleMonthlyChange = (val: number) => {
    const cleanVal = Math.max(0, val);
    setMonthlyPrice(cleanVal);
    if (autoSyncAnnual) {
      // 10 months billing = 2 months free (~16.7% discount)
      setAnnualPrice(cleanVal * 10);
    }
  };

  const handleApplyAnnualDiscount = (discountPercent: number) => {
    const calculated = Math.round(monthlyPrice * 12 * (1 - discountPercent / 100));
    setAnnualPrice(calculated);
    toast.info(`Annual price set to ${formatINR(calculated)} (${discountPercent}% OFF).`);
  };

  const toggleFeature = (featureName: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureName)
        ? prev.filter((f) => f !== featureName)
        : [...prev, featureName]
    );
  };

  const applyPreset = (presetKey: 'starter' | 'growth' | 'enterprise') => {
    setSelectedFeatures(FEATURE_PRESETS[presetKey]);
    if (presetKey === 'starter') {
      setName('Starter Tier');
      setBadge('Single Gyms');
      setMonthlyPrice(2999);
      setAnnualPrice(29999);
      setMaxBranches(1);
      setMaxMembers(300);
      setStaffLimit(3);
      setTrialDays(14);
    } else if (presetKey === 'growth') {
      setName('Growth Tier');
      setBadge('Recommended');
      setMonthlyPrice(6999);
      setAnnualPrice(69999);
      setMaxBranches(3);
      setMaxMembers(1000);
      setStaffLimit(10);
      setTrialDays(14);
    } else {
      setName('Enterprise Pro');
      setBadge('Chains & Franchises');
      setMonthlyPrice(14999);
      setAnnualPrice(149999);
      setMaxBranches(10);
      setMaxMembers(5000);
      setStaffLimit(50);
      setTrialDays(30);
    }
    toast.success(`Applied "${presetKey.toUpperCase()}" feature and quota preset!`);
  };

  const handleSelectAllFeatures = () => {
    const all = Array.from(
      new Set(SAAS_FEATURE_CATEGORIES.flatMap((c) => c.features))
    );
    setSelectedFeatures(all);
    toast.info('All modular features selected.');
  };

  const handleClearFeatures = () => {
    setSelectedFeatures([]);
    toast.info('Feature selection cleared.');
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeature.trim()) return;
    if (selectedFeatures.includes(customFeature.trim())) {
      toast.warning('Feature is already in the plan.');
      return;
    }
    setSelectedFeatures((prev) => [...prev, customFeature.trim()]);
    toast.success(`Added custom feature: "${customFeature.trim()}"`);
    setCustomFeature('');
  };

  const handleDelete = (plan: SaasPlan) => {
    if (confirm(`Remove or deactivate SaaS Tier "${plan.name}"?`)) {
      StorageService.deleteItem('saasPlans', plan.id);
      refreshData();
      toast.success(`SaaS tier "${plan.name}" removed.`);
    }
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setName('Growth Tier');
    setBadge('Recommended');
    setMonthlyPrice(6999);
    setAnnualPrice(69999);
    setAutoSyncAnnual(true);
    setMaxBranches(3);
    setMaxMembers(1000);
    setStaffLimit(10);
    setTrialDays(14);
    setSelectedFeatures(FEATURE_PRESETS.growth);
    setCustomFeature('');
    setFeatureSearch('');
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: SaasPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setBadge(plan.badge || '');
    setMonthlyPrice(plan.monthlyPrice);
    setAnnualPrice(plan.annualPrice);
    setAutoSyncAnnual(false);
    setMaxBranches(plan.maxBranches);
    setMaxMembers(plan.maxMembers);
    setStaffLimit(plan.staffLimit || 10);
    setTrialDays(plan.trialDays);
    setSelectedFeatures(plan.features && plan.features.length > 0 ? plan.features : FEATURE_PRESETS.growth);
    setCustomFeature('');
    setFeatureSearch('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Plan name is required.');
      return;
    }

    const fullPlan: SaasPlan = {
      id: editingPlan ? editingPlan.id : `saas_${Date.now()}`,
      name: name.trim(),
      badge: badge.trim() || undefined,
      monthlyPrice: Number(monthlyPrice),
      annualPrice: Number(annualPrice),
      maxBranches: Number(maxBranches),
      maxMembers: Number(maxMembers),
      staffLimit: Number(staffLimit),
      trialDays: Number(trialDays),
      status: 'active',
      features:
        selectedFeatures.length > 0
          ? selectedFeatures
          : [
              `Up to ${maxBranches} Gym Branches`,
              `Up to ${maxMembers} Members`,
              'Attendance & Kiosk',
              'Invoicing & Simulated Payments',
              'Email Support',
            ],
    };

    StorageService.saveItem<SaasPlan>('saasPlans', fullPlan);
    refreshData();
    setModalOpen(false);
    toast.success(
      editingPlan
        ? `Tier "${name}" updated! Real-time public landing page synchronized.`
        : `New tier "${name}" created and published to landing page!`
    );
  };

  // Pricing calculations for live preview
  const annualSavings = Math.max(0, monthlyPrice * 12 - annualPrice);
  const annualSavingsPercent =
    monthlyPrice > 0
      ? Math.max(0, Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100))
      : 0;
  const monthlyEquivalent = Math.round(annualPrice / 12);
  const monthlyWithGst = Math.round(monthlyPrice * 1.18);

  return (
    <DashboardLayout portal="super-admin">
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
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">SaaS Plans</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            SaaS Pricing Tiers & Feature Matrix
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure multi-tenant gym platform subscription packages, quotas, and automatic price calculations.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
            <i className="fa-solid fa-plus" /> Create New Tier
          </button>
        </div>
      </div>

      {/* Plans Grid */}
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
          const pSavings = Math.max(0, p.monthlyPrice * 12 - p.annualPrice);
          const isFeatured = p.id === 'saas_growth' || (p.badge && p.badge.toLowerCase().includes('popular'));

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                border: isFeatured ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                boxShadow: isFeatured ? '0 10px 25px -5px rgba(16, 185, 129, 0.16)' : 'var(--shadow-sm)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
              }}
            >
              <div style={{ minHeight: '28px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {p.badge ? (
                  <span
                    style={{
                      backgroundColor: isFeatured ? 'var(--color-accent)' : 'var(--bg-surface-secondary)',
                      color: isFeatured ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <i className="fa-solid fa-bolt" /> {p.badge}
                  </span>
                ) : (
                  <span />
                )}
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  Active Tier
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 0.35rem' }}>
                  {p.name}
                </h3>

                <div style={{ margin: '0.85rem 0 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{ fontSize: '2.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                      {formatINR(p.monthlyPrice, { showDecimals: false })}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/month</span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Annual: {formatINR(p.annualPrice, { showDecimals: false })}/year
                    {pSavings > 0 && (
                      <span style={{ color: 'var(--color-success)', fontWeight: 700, marginLeft: '0.4rem' }}>
                        (Save {formatINR(pSavings, { showDecimals: false })})
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0.85rem 0',
                    marginBottom: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-code-branch text-accent" style={{ marginRight: '0.35rem' }} />
                    Branches: <strong>{p.maxBranches}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-users text-accent" style={{ marginRight: '0.35rem' }} />
                    Members: <strong>{p.maxMembers}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-user-shield text-accent" style={{ marginRight: '0.35rem' }} />
                    Staff: <strong>{p.staffLimit || 10}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-clock text-accent" style={{ marginRight: '0.35rem' }} />
                    Trial: <strong>{p.trialDays} Days</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  Included Capabilities ({p.features.length}):
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
                    margin: '0 0 1.5rem',
                  }}
                >
                  {p.features.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.85rem' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontWeight: 700 }}
                  onClick={() => handleOpenEdit(p)}
                >
                  <i className="fa-solid fa-pen-to-square" /> Edit Tier & Matrix
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.35rem 0.65rem' }}
                  onClick={() => handleDelete(p)}
                  title="Delete or retire tier"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Platform Capability Reference Matrix */}
      <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              Master Platform Capability Matrix ({SUPER_ADMIN_PLAN_FEATURES.length} Modular Features)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Standard system feature flags available for one-click selection when provisioning SaaS packages.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <i className="fa-solid fa-layer-group" /> Provision New Package
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.65rem' }}>
          {SUPER_ADMIN_PLAN_FEATURES.map((feat, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.8rem' }} />
              <span style={{ fontWeight: 600 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create or Edit SaaS Tier with Automatic Price Preview & One-Click Feature Select */}
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
                  {editingPlan ? `Edit SaaS Tier: ${editingPlan.name}` : 'Create New SaaS Tier'}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Includes automatic price calculations, savings preview, and modular feature selection.
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
                  {/* LEFT: Configuration & Modular Selectors */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Basic Info */}
                    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fa-solid fa-tag text-accent" /> Plan Identification & Marketing
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Tier Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Pro Growth Network"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Promotional Badge</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Most Popular"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Automatic Pricing Engine */}
                    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className="fa-solid fa-indian-rupee-sign text-accent" /> Pricing & Automatic Savings Engine
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-accent-hover)', cursor: 'pointer', fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={autoSyncAnnual}
                            onChange={(e) => {
                              setAutoSyncAnnual(e.target.checked);
                              if (e.target.checked) setAnnualPrice(monthlyPrice * 10);
                            }}
                          />
                          Auto-Sync Annual (2 Mo Free)
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Monthly Rate (INR ₹) *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={monthlyPrice}
                            min="0"
                            step="100"
                            onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                            required
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Billed monthly to client gym
                          </span>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Annual Rate (INR ₹) *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={annualPrice}
                            min="0"
                            step="500"
                            onChange={(e) => {
                              setAnnualPrice(Math.max(0, Number(e.target.value)));
                              setAutoSyncAnnual(false);
                            }}
                            required
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            1-year upfront billing
                          </span>
                        </div>
                      </div>

                      {/* Quick Auto-Discount Calculators */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Quick Annual Discounts:
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                          onClick={() => handleApplyAnnualDiscount(15)}
                        >
                          Save 15% ({formatINR(Math.round(monthlyPrice * 12 * 0.85))})
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                          onClick={() => handleApplyAnnualDiscount(20)}
                        >
                          Save 20% / 10 Mo ({formatINR(monthlyPrice * 10)})
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                          onClick={() => handleApplyAnnualDiscount(25)}
                        >
                          Save 25% ({formatINR(Math.round(monthlyPrice * 12 * 0.75))})
                        </button>
                      </div>
                    </div>

                    {/* Quotas & Capacity Limits */}
                    <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fa-solid fa-sliders text-accent" /> Tenant Quotas & Trial Limits
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Branches</label>
                          <input
                            type="number"
                            className="form-control"
                            value={maxBranches}
                            min="1"
                            onChange={(e) => setMaxBranches(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Max Members</label>
                          <input
                            type="number"
                            className="form-control"
                            value={maxMembers}
                            min="50"
                            step="50"
                            onChange={(e) => setMaxMembers(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Staff Users</label>
                          <input
                            type="number"
                            className="form-control"
                            value={staffLimit}
                            min="1"
                            onChange={(e) => setStaffLimit(Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Trial Days</label>
                          <input
                            type="number"
                            className="form-control"
                            value={trialDays}
                            min="0"
                            onChange={(e) => setTrialDays(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modular Feature Select ("No Manual Needed") */}
                    <div className="feature-selector-container">
                      <div className="feature-selector-header">
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <i className="fa-solid fa-list-check text-accent" /> Plan Features & Capability Select
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                            Click to toggle features into this plan. No manual typing needed.
                          </span>
                        </div>

                        {/* Presets */}
                        <div className="feature-selector-presets">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyPreset('starter')}
                          >
                            Starter
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyPreset('growth')}
                          >
                            Growth
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={() => applyPreset('enterprise')}
                          >
                            Enterprise
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={handleSelectAllFeatures}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                            onClick={handleClearFeatures}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Feature Filter Search */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Filter modular features..."
                          value={featureSearch}
                          onChange={(e) => setFeatureSearch(e.target.value)}
                          style={{ paddingLeft: '32px' }}
                        />
                        <i
                          className="fa-solid fa-magnifying-glass"
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                        />
                      </div>

                      {/* Feature Chips by Category */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.35rem' }}>
                        {SAAS_FEATURE_CATEGORIES.map((cat) => {
                          const matchedFeatures = cat.features.filter((f) =>
                            f.toLowerCase().includes(featureSearch.toLowerCase())
                          );
                          if (matchedFeatures.length === 0) return null;

                          return (
                            <div key={cat.category}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                                <i className={`fa-solid ${cat.icon} text-accent`} style={{ marginRight: '0.35rem' }} />
                                {cat.category}
                              </div>
                              <div className="feature-selector-grid">
                                {matchedFeatures.map((feat) => {
                                  const isSelected = selectedFeatures.includes(feat);
                                  return (
                                    <div
                                      key={feat}
                                      className={`feature-chip ${isSelected ? 'active' : ''}`}
                                      onClick={() => toggleFeature(feat)}
                                      role="checkbox"
                                      aria-checked={isSelected}
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === ' ' || e.key === 'Enter') {
                                          e.preventDefault();
                                          toggleFeature(feat);
                                        }
                                      }}
                                    >
                                      <i className={`fa-solid ${isSelected ? 'fa-square-check text-accent' : 'fa-square'}`} />
                                      <span>{feat}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Custom Feature Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Add custom feature (optional)..."
                          value={customFeature}
                          onChange={(e) => setCustomFeature(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAddCustomFeature}
                        >
                          <i className="fa-solid fa-plus" /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Live Automatic Price Preview */}
                  <div className="plan-live-preview-container">
                    <div className="plan-preview-live-tag">
                      <i className="fa-solid fa-eye" /> Live Pricing & Card Preview
                    </div>

                    <div className="plan-live-preview-card">
                      {/* Badge Row */}
                      <div className="plan-preview-badge-row">
                        {badge ? (
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
                            <i className="fa-solid fa-bolt" /> {badge}
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
                            SaaS Package
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 0.35rem' }}>
                        {name || 'Untitled SaaS Tier'}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                        Multi-tenant platform package configured with Indian Rupee (INR) billing.
                      </p>

                      {/* Pricing block */}
                      <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
                            {formatINR(monthlyPrice, { showDecimals: false })}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/month</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Annual Plan:</span>
                          <strong>{formatINR(annualPrice, { showDecimals: false })}/yr</strong>
                        </div>

                        {annualSavings > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                              <i className="fa-solid fa-tag" /> Annual Savings:
                            </span>
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                              Save {formatINR(annualSavings, { showDecimals: false })} ({annualSavingsPercent}% OFF)
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>Equivalent monthly:</span>
                          <span>{formatINR(monthlyEquivalent, { showDecimals: false })}/month</span>
                        </div>

                        <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '0.6rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>18% GST estimate:</span>
                          <span>{formatINR(monthlyWithGst, { showDecimals: false })}/mo incl. tax</span>
                        </div>
                      </div>

                      {/* Quotas */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <div><i className="fa-solid fa-code-branch text-accent" /> Up to {maxBranches} Branches</div>
                        <div><i className="fa-solid fa-users text-accent" /> Up to {maxMembers} Members</div>
                        <div><i className="fa-solid fa-user-shield text-accent" /> {staffLimit} Staff Accounts</div>
                        <div><i className="fa-solid fa-clock text-accent" /> {trialDays}-Day Free Trial</div>
                      </div>

                      {/* Features List */}
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Included Features</span>
                        <span style={{ color: 'var(--color-accent)' }}>{selectedFeatures.length} Active</span>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.35rem' }}>
                        {selectedFeatures.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', padding: '0.5rem', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-sm)' }}>
                            No features selected yet. Select from the checklist on the left!
                          </div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {selectedFeatures.map((f, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.8rem' }} />
                                <span>{f}</span>
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
                        Start {trialDays}-Day Free Trial
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <i className="fa-solid fa-circle-check text-success" /> Live synchronized with public landing page
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
                  Total {selectedFeatures.length} modular capabilities included in tier.
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent" style={{ fontWeight: 700 }}>
                    <i className="fa-solid fa-check" /> {editingPlan ? 'Save Tier Changes' : 'Create & Publish Tier'}
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
