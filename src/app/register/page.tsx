'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/services/StorageService';
import { DiscountService } from '@/services/DiscountService';
import { PricingService } from '@/services/PricingService';
import { Gym, SaasPlan } from '@/types';
import { toast } from 'sonner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserState } = { setUserState: (u: any) => {} };
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('saas_growth');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  const [plans, setPlans] = useState<SaasPlan[]>([]);

  useEffect(() => {
    const p = StorageService.getCollection<SaasPlan>('saasPlans');
    setPlans(p);
    const planParam = searchParams.get('plan');
    if (planParam) {
      setSelectedPlanId(planParam);
    }
    const couponParam = searchParams.get('coupon');
    if (couponParam) {
      setCouponCode(couponParam);
      validateCoupon(couponParam);
    }
  }, [searchParams]);

  const validateCoupon = (code: string) => {
    if (!code.trim()) {
      setCouponMsg('');
      setAppliedDiscount(null);
      return;
    }
    const selectedPlan = plans.find((x) => x.id === selectedPlanId) || plans[0];
    const planPrice = selectedPlan ? selectedPlan.monthlyPrice : 99;
    const allDiscounts = DiscountService.getAll();
    const result = PricingService.calculatePlanPrice(planPrice, selectedPlanId, code, allDiscounts, true);

    if (result.isValid && result.appliedDiscount) {
      setAppliedDiscount(result.appliedDiscount);
      setCouponMsg(result.message || 'Coupon applied successfully!');
    } else {
      setAppliedDiscount(null);
      setCouponMsg(result.message || 'Invalid coupon code');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    validateCoupon(couponCode);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName || !ownerName || !email) {
      toast.error('Please fill in all required organization fields.');
      return;
    }

    const selectedPlan = plans.find((x) => x.id === selectedPlanId) || plans[0];
    const newGymId = `gym_${Date.now()}`;
    const newGym: Gym = {
      id: newGymId,
      name: gymName,
      slug: gymName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerName,
      ownerEmail: email,
      ownerPhone: phone || '+1 (555) 000-0000',
      planId: selectedPlanId,
      planName: selectedPlan?.name || 'Growth',
      status: 'active',
      branchesCount: 1,
      membersCount: 0,
      monthlyRevenue: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      address: address || 'Main Commercial Suite',
      city: city || 'Austin, TX',
      country: 'USA',
    };

    StorageService.saveItem<Gym>('gyms', newGym);

    // If coupon was used, increment usage
    if (appliedDiscount) {
      DiscountService.incrementUsage(appliedDiscount.id);
    }

    // Sign user in as admin of this new gym
    const newUser = {
      id: `usr_${Date.now()}`,
      name: ownerName,
      email: email,
      role: 'GYM_OWNER' as const,
      roleLabel: 'Gym Owner',
      gymId: newGymId,
      gymName: gymName,
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
    };

    localStorage.setItem('gymflow_current_user', JSON.stringify(newUser));
    toast.success(`Welcome to GymFlow, ${gymName}! Your trial has started.`);
    router.push('/admin/dashboard');
  };

  const selectedPlan = plans.find((x) => x.id === selectedPlanId);
  const basePrice = selectedPlan?.monthlyPrice || 99;
  const calcResult = PricingService.calculateDiscount(basePrice, appliedDiscount);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, var(--bg-body) 0%, var(--bg-surface-secondary) 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="brand-link" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div className="brand-icon">
              <i className="fa-solid fa-dumbbell" />
            </div>
            <div className="brand-text">
              Gym<span>Flow</span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            Onboard Your Gym
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: step === 1 ? 'var(--color-accent)' : 'var(--color-accent-subtle)',
                color: step === 1 ? '#fff' : 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              1
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: step === 1 ? 700 : 500 }}>Club Profile</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: step === 2 ? 'var(--color-accent)' : 'var(--bg-surface-secondary)',
                color: step === 2 ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              2
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: step === 2 ? 700 : 500 }}>Select SaaS Tier</span>
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Gym / Organization Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IronPulse Fitness Club"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Owner / Manager Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Marcus Vance"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. marcus@ironpulse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City, State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Austin, TX"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 742 Evergreen Terrace"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-accent w-100"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => {
                if (!gymName || !ownerName || !email) {
                  toast.error('Please enter Gym Name, Owner Name, and Email.');
                  return;
                }
                setStep(2);
              }}
            >
              Next: Select Subscription Tier <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      if (couponCode) validateCoupon(couponCode);
                    }}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--color-accent-subtle)' : 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{p.name}</strong>
                        {p.badge && <span className="badge badge-accent">{p.badge}</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Up to {p.maxBranches} branches, {p.maxMembers} members • {p.trialDays}-day trial
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>${p.monthlyPrice}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Have a Promo or Coupon Code?</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SUMMER30"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="button" className="btn btn-secondary" onClick={() => validateCoupon(couponCode)}>
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    marginTop: '0.35rem',
                    color: appliedDiscount ? 'var(--color-accent)' : 'var(--color-danger)',
                    fontWeight: 600,
                  }}
                >
                  {couponMsg}
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Plan Monthly Dues:</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {calcResult.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-accent)', marginBottom: '0.35rem' }}>
                  <span>Discount ({couponCode}):</span>
                  <span>-${calcResult.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total Due After Trial:</span>
                <span style={{ color: 'var(--color-accent)' }}>${calcResult.finalPrice.toFixed(2)}/mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                * Billed only after your 14-day free trial concludes. Simulated billing.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={() => setStep(1)}
              >
                &larr; Back
              </button>
              <button
                type="button"
                className="btn btn-accent"
                style={{ flex: 2, padding: '0.75rem' }}
                onClick={handleCompleteRegistration}
              >
                <i className="fa-solid fa-rocket" /> Provision Gym & Enter Portal
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
