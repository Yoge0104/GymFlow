'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { DiscountService } from '@/services/DiscountService';
import { PricingService } from '@/services/PricingService';
import { PaymentService } from '@/services/PaymentService';
import { GymMembershipPlan, Discount } from '@/types';
import { formatINR } from '@/lib/formatters';
import { toast } from 'sonner';

export default function MemberPlansPage() {
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');

  // Coupon code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);

  // Upgrade Modal
  const [selectedPlan, setSelectedPlan] = useState<GymMembershipPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'Bank Transfer'>('Card');

  const refreshData = () => {
    const gymPlans = StorageService.getCollection<GymMembershipPlan>('gymPlans');
    const legacyPlans = StorageService.getCollection<GymMembershipPlan>('membershipPlans');
    const allPlans = gymPlans.length > 0 ? gymPlans : legacyPlans;
    setPlans(allPlans.filter((p) => p.status === 'active'));

    const featured = DiscountService.getFeaturedLandingPromotion();
    if (featured && !couponCode) {
      setCouponCode(featured.code);
      setAppliedDiscount(featured);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setAppliedDiscount(null);
      toast.info('Coupon cleared.');
      return;
    }

    const allDiscounts = DiscountService.getAll();
    const found = allDiscounts.find(
      (d) => d.code.toUpperCase() === couponCode.trim().toUpperCase() && d.status === 'active'
    );

    if (!found) {
      toast.error('Invalid or expired coupon code.');
      setAppliedDiscount(null);
      return;
    }

    setAppliedDiscount(found);
    toast.success(`Coupon "${found.code}" applied! ${found.name}`);
  };

  const handleSelectPlan = (plan: GymMembershipPlan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;

    // Calculate final price with discount if applicable
    const pricing = PricingService.calculateDiscount(selectedPlan.price, appliedDiscount);

    // Record dummy payment
    PaymentService.simulatePayment({
      gymId: 'gym-001',
      memberId: 'mem-001',
      memberName: 'Alex Morgan',
      planName: selectedPlan.name,
      amount: pricing.finalPrice,
      method: paymentMethod,
    });

    // Update member's plan in storage
    const members = StorageService.getCollection<any>('members');
    const member = members.find((m) => m.id === 'mem-001');
    if (member) {
      member.planId = selectedPlan.id;
      member.planName = selectedPlan.name;
      StorageService.saveItem('members', member);
    }

    toast.success(`Successfully upgraded to ${selectedPlan.name}! Invoice and receipt generated.`);
    setSelectedPlan(null);
  };

  const resetFilters = () => {
    setSearch('');
    setFrequencyFilter('');
    setPriceRange('');
    setSortBy('price_asc');
  };

  // Filter and sort plans
  const filteredPlans = plans
    .filter((p) => {
      const matchesSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase());

      const matchesFreq =
        frequencyFilter === '' ||
        (frequencyFilter === '1' && p.durationMonths === 1) ||
        (frequencyFilter === '3' && p.durationMonths === 3) ||
        (frequencyFilter === '12' && p.durationMonths === 12);

      let matchesPrice = true;
      if (priceRange === '0-5000') matchesPrice = p.price <= 5000;
      else if (priceRange === '5000-15000') matchesPrice = p.price > 5000 && p.price <= 15000;
      else if (priceRange === '15000+') matchesPrice = p.price > 15000;

      return matchesSearch && matchesFreq && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'duration_desc') return b.durationMonths - a.durationMonths;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Gym Plans</span>
          </div>
          <h1 className="page-title">Gym Membership Options</h1>
          <p className="page-subtitle">
            Compare club membership plans and easily upgrade or adjust your subscription.
          </p>
        </div>
      </div>

      {/* Coupon Banner & Input */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderLeft: '4px solid var(--color-accent)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-tags text-accent" /> Have a Promo Coupon?
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enter code below to unlock promotional savings across eligible packages.
            </div>
          </div>
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SUMMER30"
              style={{ width: '160px', textTransform: 'uppercase', fontWeight: 700 }}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="btn btn-accent btn-sm">
              Apply Code
            </button>
            {appliedDiscount && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setAppliedDiscount(null);
                  setCouponCode('');
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
        {appliedDiscount && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '0.3rem' }} />
            Coupon &quot;{appliedDiscount.code}&quot; active: {appliedDiscount.discountType === 'percentage' ? `${appliedDiscount.discountValue}% OFF` : `${formatINR(appliedDiscount.discountValue)} OFF`} ({appliedDiscount.name})
          </div>
        )}
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '340px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search plan name or perks..."
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ minWidth: '150px' }}
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
            >
              <option value="">All Frequencies</option>
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="12">12 Months (Annual)</option>
            </select>

            <select
              className="form-select"
              style={{ minWidth: '160px' }}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">All Price Tiers</option>
              <option value="0-5000">Under ₹5,000</option>
              <option value="5000-15000">₹5,000 - ₹15,000</option>
              <option value="15000+">₹15,000 & Above</option>
            </select>

            <select
              className="form-select"
              style={{ minWidth: '160px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price_asc">Price (Lowest First)</option>
              <option value="price_desc">Price (Highest First)</option>
              <option value="duration_desc">Duration (Longest)</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
              title="Reset all filters"
            >
              <i className="fa-solid fa-arrow-rotate-left" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div
        className="pricing-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          alignItems: 'stretch',
        }}
      >
        {filteredPlans.map((plan) => {
          const pricing = PricingService.calculateDiscount(plan.price, appliedDiscount);
          const isCurrentPlan = plan.name === 'Annual VIP All-Access' || plan.id === 'plan-003';

          return (
            <div
              key={plan.id}
              className={`member-plan-card ${isCurrentPlan ? 'current-active' : ''}`}
            >
              <div className="member-plan-card-body">
                {/* Dedicated Badge Row for pixel-perfect vertical alignment across all cards */}
                <div className="member-plan-badge-row">
                  {isCurrentPlan ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'var(--color-accent)',
                        color: '#ffffff',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <i className="fa-solid fa-circle-check" /> Current Active Plan
                    </span>
                  ) : plan.isPopular ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: '#0284c7',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <i className="fa-solid fa-star" /> Recommended Tier
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-surface-secondary)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {plan.accessLevel || 'Club Tier'}
                    </span>
                  )}
                </div>

                <h3 className="member-plan-title">{plan.name}</h3>
                <p className="member-plan-subtitle">
                  {plan.accessLevel} &bull; {plan.billingCycle} package
                </p>

                {/* Price block */}
                <div className="member-plan-price-wrap">
                  <div className="member-plan-original-price">
                    {pricing.discountAmount > 0 && formatINR(plan.price)}
                  </div>

                  <div className={`member-plan-amount ${pricing.discountAmount > 0 ? 'discounted' : ''}`}>
                    {formatINR(pricing.finalPrice)}
                    <span className="member-plan-unit">
                      /{plan.durationMonths === 1 ? 'mo' : `${plan.durationMonths} mos`}
                    </span>
                  </div>

                  {pricing.discountAmount > 0 ? (
                    <div style={{ marginTop: '0.35rem', minHeight: '22px' }}>
                      <span
                        className="badge badge-success"
                        style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <i className="fa-solid fa-tag" /> Save {formatINR(pricing.discountAmount)} with coupon!
                      </span>
                    </div>
                  ) : (
                    <div style={{ minHeight: '22px', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Standard club membership rate
                    </div>
                  )}
                </div>

                <hr style={{ margin: '0 0 1.25rem', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Benefits */}
                <ul className="member-plan-features">
                  {plan.benefits?.map((feat, idx) => (
                    <li key={idx}>
                      <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.85rem' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  {isCurrentPlan ? (
                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                      disabled
                    >
                      <i className="fa-solid fa-check" style={{ marginRight: '0.4rem' }} /> Active Package
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-accent w-100"
                      style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Select & Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fa-solid fa-circle-question text-accent" style={{ marginRight: '0.4rem' }} /> Membership FAQs
          </h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <strong>Can I upgrade or downgrade my plan at any time?</strong>
            <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0' }}>
              Yes. When upgrading, any unused days on your previous package are prorated as credit towards your new plan.
            </p>
          </div>
          <div>
            <strong>How do promo coupon codes work?</strong>
            <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0' }}>
              Promotional codes apply to the first billing cycle. Enter the coupon at the top of this page to view discounted pricing.
            </p>
          </div>
          <div>
            <strong>Are there cancellation fees?</strong>
            <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0' }}>
              No cancellation fees apply on standard month-to-month memberships. Annual plans require a 30-day advance notice.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade / Checkout Modal */}
      {selectedPlan && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '520px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-credit-card text-accent" style={{ marginRight: '0.4rem' }} />
                Confirm Plan Upgrade: {selectedPlan.name}
              </h3>
              <button type="button" className="modal-close" onClick={() => setSelectedPlan(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Retail Plan Price:</span>
                  <strong>{formatINR(selectedPlan.price)}</strong>
                </div>
                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--success-color)' }}>
                    <span>Coupon Savings ({appliedDiscount.code}):</span>
                    <strong>-{formatINR(PricingService.calculateDiscount(selectedPlan.price, appliedDiscount).discountAmount)}</strong>
                  </div>
                )}
                <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>Total Due Today:</span>
                  <span style={{ color: 'var(--primary-color)' }}>
                    {formatINR(PricingService.calculateDiscount(selectedPlan.price, appliedDiscount).finalPrice)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn ${paymentMethod === 'Card' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <i className="fa-brands fa-cc-visa" style={{ marginRight: '0.3rem' }} /> Credit Card (•••• 4242)
                  </button>
                  <button
                    type="button"
                    className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <i className="fa-solid fa-mobile-screen" style={{ marginRight: '0.3rem' }} /> UPI / QR
                  </button>
                  <button
                    type="button"
                    className={`btn ${paymentMethod === 'Bank Transfer' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setPaymentMethod('Bank Transfer')}
                  >
                    <i className="fa-solid fa-building-columns" style={{ marginRight: '0.3rem' }} /> Direct Wire
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlan(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-accent" onClick={handleConfirmUpgrade}>
                <i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }} /> Pay & Activate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
