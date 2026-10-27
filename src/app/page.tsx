
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DiscountService } from '@/services/DiscountService';
import { PricingService } from '@/services/PricingService';
import { StorageService } from '@/services/StorageService';
import { Discount, SaasPlan, GymMembershipPlan } from '@/types';
import { formatINR } from '@/lib/formatters';

type BillingInterval = 'monthly' | 'yearly';

type SaasPlanWithYearlyPrice = SaasPlan & {
  yearlyPrice?: number;
  yearlyDiscountPercentage?: number;
  monthlyEnabled?: boolean;
  yearlyEnabled?: boolean;
};

const currency = (amount: number) =>
  formatINR(Math.max(0, amount), { showDecimals: false });

function calculateYearlyPrice(plan: SaasPlanWithYearlyPrice): number {
  const monthlyPrice = Math.max(0, Number(plan.monthlyPrice) || 0);
  const configuredYearlyPrice = Number(plan.yearlyPrice);

  if (
    plan.yearlyPrice !== undefined &&
    Number.isFinite(configuredYearlyPrice) &&
    configuredYearlyPrice >= 0
  ) {
    return Math.round(configuredYearlyPrice);
  }

  const discountPercentage = Number(plan.yearlyDiscountPercentage);

  if (
    Number.isFinite(discountPercentage) &&
    discountPercentage > 0 &&
    discountPercentage <= 100
  ) {
    return Math.round(
      monthlyPrice * 12 * (1 - discountPercentage / 100)
    );
  }

  return Math.round(monthlyPrice * 12);
}

function calculatePromotion(
  price: number,
  promo: Discount | null,
  eligible: boolean
): { discountAmount: number; finalPrice: number } {
  if (!promo || !eligible || price <= 0) {
    return { discountAmount: 0, finalPrice: price };
  }

  const result = PricingService.calculateDiscount(price, promo);

  const finalPrice = Math.min(
    price,
    Math.max(0, Number(result.finalPrice) || 0)
  );

  return {
    discountAmount: Math.max(0, price - finalPrice),
    finalPrice,
  };
}

export default function LandingPage() {
  const router = useRouter();
  const { loginAs, theme, toggleTheme } = useAuth();

  const [featuredPromo, setFeaturedPromo] = useState<Discount | null>(null);
  const [saasPlans, setSaasPlans] = useState<SaasPlanWithYearlyPrice[]>([]);
  const [gymPlans, setGymPlans] = useState<GymMembershipPlan[]>([]);
  const [pricingTab, setPricingTab] = useState<'retail' | 'saas'>('retail');
  const [saasBilling, setSaasBilling] =
    useState<BillingInterval>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dataReady, setDataReady] = useState(false);

  const refreshData = useCallback(() => {
    try {
      const promo = DiscountService.getFeaturedLandingPromotion();
      setFeaturedPromo(promo);

      const sPlans = StorageService.getCollection<SaasPlan>('saasPlans')
        .filter((plan) => plan.status === 'active');

      setSaasPlans(sPlans);

      const gPlans = StorageService
        .getCollection<GymMembershipPlan>('gymPlans')
        .filter(
          (plan) =>
            plan.status === 'active' &&
            plan.showOnLandingPage !== false
        )
        .sort(
          (a, b) =>
            (a.displayOrder || 99) - (b.displayOrder || 99)
        );

      setGymPlans(gPlans);
    } catch (error) {
      console.error('Failed to load landing page pricing:', error);
    } finally {
      setDataReady(true);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const unsubscribe = StorageService.subscribe(refreshData);

    // Keep pricing synchronized with other tabs when storage changes.
    const handleStorage = () => refreshData();

    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshData]);

  const handleRoleQuickStart = (roleKey: string, destination: string) => {
    loginAs(roleKey);
    router.push(destination);
  };

  const faqs = [
    {
      q: 'Can I manage multiple gym branches under a single subscription?',
      a: 'Yes! GymFlow is built for single-site gyms and multi-branch networks. Your available features depend on your selected SaaS plan.',
    },
    {
      q: 'Does GymFlow require local installation or servers?',
      a: 'GymFlow is designed to be accessible through modern web browsers on desktop, tablet, and mobile devices.',
    },
    {
      q: 'How does the Member Portal work for athletes?',
      a: 'Members can access their membership information, view assigned workouts, manage class bookings where available, and review payment records.',
    },
    {
      q: 'Are promotional discount codes automatically applied?',
      a: 'Eligible active public promotions can be displayed on the landing page. The registration and checkout flow must validate the promotion before applying it.',
    },
  ];

  return (
    <div className="landing-wrapper">
      {/* Dynamic Promotion Banner */}
      {featuredPromo && (
        <div className="landing-banner">
          {featuredPromo.badgeText && (
            <span className="landing-banner-badge">
              {featuredPromo.badgeText}
            </span>
          )}

          <span>
            {featuredPromo.landingHeadline ||
              `${featuredPromo.name} — Save with code:`}{' '}
            <strong className="landing-banner-code">
              {featuredPromo.code}
            </strong>
          </span>

          <Link href="#pricing" className="landing-banner-link">
            View Pricing ↓
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand">
            <span className="landing-brand-icon">
              <i className="fa-solid fa-dumbbell" />
            </span>
            <span>
              Gym<span className="landing-brand-accent">Flow</span>
            </span>
          </Link>

          <nav className="landing-nav-group">
            <div className="landing-nav-links">
              <a href="#roles" className="landing-nav-link">Portals</a>
              <a href="#pricing" className="landing-nav-link">Pricing</a>
              <a href="#faq" className="landing-nav-link">FAQ</a>
            </div>

            <button
              type="button"
              className="topbar-action-btn theme-toggle-btn"
              onClick={toggleTheme}
              title="Toggle Theme"
              aria-label="Toggle theme"
            >
              <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} />
            </button>

            <Link href="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-accent btn-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-hero-badge">
            <i className="fa-solid fa-bolt" /> Multi-Tenant SaaS Gym Management
          </div>

          <h1 className="landing-hero-title">
            The Operating System for Modern Gyms, Trainers & Athletes
          </h1>

          <p className="landing-hero-subtitle">
            Manage gym operations, memberships, attendance, trainers, billing
            and member experiences from one unified platform.
          </p>

          <div className="landing-hero-actions">
            <Link href="/register" className="btn btn-accent btn-lg">
              <i className="fa-solid fa-rocket" /> Start Free Trial
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              <i className="fa-solid fa-play" /> Explore Demo
            </Link>
          </div>

          {/* Quick-Launch Demo Workspaces */}
          <div className="landing-demo-card">
            <div className="landing-demo-info">
              <span className="landing-demo-tag">
                <i className="fa-solid fa-circle-check" /> Live Demo Workspaces
              </span>
              <div className="landing-demo-heading">
                Explore role-scoped workspaces
              </div>
              <div className="landing-demo-subtext">
                Preloaded with authentic Indian gym data & least-privilege scoping.
              </div>
            </div>

            <div className="landing-demo-buttons">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleRoleQuickStart('superadmin', '/super-admin/dashboard')}
              >
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-purple)' }} />
                Super Admin
              </button>
              <button
                type="button"
                className="btn btn-electric btn-sm"
                onClick={() => handleRoleQuickStart('gymadmin', '/admin/dashboard')}
              >
                <i className="fa-solid fa-dumbbell" />
                Gym Admin
              </button>
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={() => handleRoleQuickStart('member', '/member/dashboard')}
              >
                <i className="fa-solid fa-user-check" />
                Member Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Section */}
      <section id="roles" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            One Platform, Three Portals
          </h2>
          <p className="landing-section-subtitle">
            Dedicated experiences for platform operators, gym teams and members.
          </p>
        </div>

        <div className="landing-roles-grid">
          {[
            {
              role: 'SaaS Super Admin',
              badgeIcon: 'fa-shield-halved',
              title: 'Platform Operations',
              description: 'Manage gym organizations, multi-tenant billing, platform SaaS plans, and global analytics.',
              features: ['Gym organization onboarding', 'SaaS subscription tiers & MRR', 'Indian GST billing & transactions', 'Role matrices & platform audit trail'],
              color: 'var(--color-purple)',
              key: 'superadmin',
              path: '/super-admin/dashboard',
            },
            {
              role: 'Club Admin / Owner',
              badgeIcon: 'fa-dumbbell',
              title: 'Club & Branch Management',
              description: 'Run front desk operations, athlete check-ins, trainers, group classes, invoices, and POS ledger.',
              features: ['Member enrollments & memberships', 'Live attendance desk & QR check-in', 'Trainer assignments & class bookings', 'Operational expenses & GST invoices'],
              color: 'var(--color-electric)',
              key: 'gymadmin',
              path: '/admin/dashboard',
            },
            {
              role: 'Member / Athlete',
              badgeIcon: 'fa-user-check',
              title: 'Athlete Self-Service Portal',
              description: 'Empower gym members with digital QR keycards, prescribed workout regimens, and instant payment history.',
              features: ['Digital keycard & facility access', 'Coach-prescribed training splits', 'Class schedules & spot reservation', 'Invoice downloads & payment receipts'],
              color: 'var(--color-accent)',
              key: 'member',
              path: '/member/dashboard',
            },
          ].map((portal) => (
            <div
              className="landing-role-card"
              key={portal.key}
              style={{ borderTop: `4px solid ${portal.color}` }}
            >
              <div className="landing-role-body">
                <div className="landing-role-badge-row">
                  <span className="landing-role-badge" style={{ color: portal.color }}>
                    <i className={`fa-solid ${portal.badgeIcon}`} />
                    {portal.role}
                  </span>
                </div>

                <h3 className="landing-role-title">
                  {portal.title}
                </h3>
                <p className="landing-role-desc">
                  {portal.description}
                </p>

                <ul className="landing-role-features">
                  {portal.features.map((feature) => (
                    <li key={feature}>
                      <i className="fa-solid fa-circle-check" style={{ color: portal.color, fontSize: '0.9rem' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="btn btn-secondary landing-role-btn"
                  onClick={() => handleRoleQuickStart(portal.key, portal.path)}
                >
                  <span>Launch {portal.role}</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Transparent Indian Rupee Pricing
          </h2>
          <p className="landing-section-subtitle">
            Compare gym memberships and GymFlow SaaS subscriptions with standard INR billing.
          </p>

          <div className="landing-pricing-toggle-wrap">
            <button
              type="button"
              className={`landing-pricing-tab-btn ${pricingTab === 'retail' ? 'active' : ''}`}
              onClick={() => setPricingTab('retail')}
              aria-pressed={pricingTab === 'retail'}
            >
              Club Memberships
            </button>
            <button
              type="button"
              className={`landing-pricing-tab-btn ${pricingTab === 'saas' ? 'active' : ''}`}
              onClick={() => setPricingTab('saas')}
              aria-pressed={pricingTab === 'saas'}
            >
              GymFlow SaaS
            </button>
          </div>

          {featuredPromo && (
            <div style={{ marginTop: '1.25rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--color-accent-subtle)',
                  border: '1px solid var(--color-accent-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <i className="fa-solid fa-tag" /> {featuredPromo.name}:{' '}
                {featuredPromo.discountType === 'percentage'
                  ? `${featuredPromo.discountValue}% OFF`
                  : `${currency(featuredPromo.discountValue)} OFF`}
              </span>
            </div>
          )}
        </div>

        {!dataReady ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading pricing…
          </p>
        ) : pricingTab === 'retail' ? (
          <div className="landing-pricing-grid">
            {gymPlans.map((plan) => {
              const price = Math.max(0, Number(plan.price) || 0);
              const eligible = Boolean(
                featuredPromo &&
                (featuredPromo.eligiblePlanIds.length === 0 ||
                  featuredPromo.eligiblePlanIds.includes(plan.id))
              );
              const pricing = calculatePromotion(price, featuredPromo, eligible);

              return (
                <div
                  className={`landing-pricing-card ${plan.isPopular ? 'featured' : ''}`}
                  key={plan.id}
                >
                  <div className="landing-pricing-body">
                    {/* Consistent Badge Slot so card content never staggers */}
                    <div className="landing-pricing-badge-row">
                      {plan.isPopular ? (
                        <span className="landing-pricing-badge popular">
                          <i className="fa-solid fa-star" /> Most Popular
                        </span>
                      ) : (
                        <span className="landing-pricing-badge standard">
                          {plan.accessLevel || 'Club Pass'}
                        </span>
                      )}
                    </div>

                    <h3 className="landing-pricing-title">
                      {plan.name}
                    </h3>
                    <p className="landing-pricing-subtitle">
                      {plan.billingCycle || 'Monthly'} Access &bull; {plan.accessLevel || 'All Branches'}
                    </p>

                    {/* Price Block */}
                    <div className="landing-pricing-price-wrap">
                      <div className="landing-pricing-original-price">
                        {pricing.discountAmount > 0 && currency(price)}
                      </div>
                      <div className={`landing-pricing-amount ${pricing.discountAmount > 0 ? 'discounted' : ''}`}>
                        {currency(pricing.finalPrice)}
                      </div>
                      <div className="landing-pricing-validity">
                        Joining fee: {plan.joiningFee ? currency(plan.joiningFee) : 'Nil'} &bull; Validity: {plan.durationMonths || 1} Month{plan.durationMonths > 1 ? 's' : ''}
                      </div>
                    </div>

                    <hr className="landing-pricing-divider" />

                    {/* Features List */}
                    <ul className="landing-pricing-features">
                      {(plan.benefits || []).map((benefit, index) => (
                        <li key={`${plan.id}-${index}`}>
                          <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.85rem' }} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className={`btn ${plan.isPopular ? 'btn-accent' : 'btn-secondary'} landing-pricing-btn`}
                      onClick={() => handleRoleQuickStart('member', '/member/dashboard')}
                    >
                      Join with {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}

            {gymPlans.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                No active membership plans are currently published.
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* Monthly / Yearly Toggle — SaaS Only */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '2rem',
              }}
            >
              {(['monthly', 'yearly'] as const).map((interval) => (
                <button
                  type="button"
                  key={interval}
                  onClick={() => setSaasBilling(interval)}
                  aria-pressed={saasBilling === interval}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${saasBilling === interval ? 'var(--color-accent)' : 'var(--border-color)'}`,
                    backgroundColor: saasBilling === interval ? 'var(--color-accent)' : 'var(--bg-surface)',
                    color: saasBilling === interval ? '#fff' : 'var(--text-main)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {interval === 'monthly' ? 'Monthly Billing' : 'Annual Billing (Save ~20%)'}
                </button>
              ))}
            </div>

            <div className="landing-pricing-grid">
              {saasPlans.map((rawPlan) => {
                const plan = rawPlan as SaasPlanWithYearlyPrice;
                const monthlyPrice = Math.max(0, Number(plan.monthlyPrice) || 0);
                const yearlyPrice = calculateYearlyPrice(plan);

                const basePrice =
                  saasBilling === 'yearly' ? yearlyPrice : monthlyPrice;

                const eligible = Boolean(
                  featuredPromo &&
                  (featuredPromo.eligiblePlanIds.length === 0 ||
                    featuredPromo.eligiblePlanIds.includes(plan.id))
                );

                const pricing = calculatePromotion(
                  basePrice,
                  featuredPromo,
                  eligible
                );

                const isGrowth = plan.id === 'saas_growth';

                const registrationUrl =
                  `/register?plan=${encodeURIComponent(plan.id)}` +
                  `&billing=${saasBilling}` +
                  (eligible && featuredPromo
                    ? `&coupon=${encodeURIComponent(featuredPromo.code)}`
                    : '');

                return (
                  <div
                    className={`landing-pricing-card ${isGrowth ? 'featured' : ''}`}
                    key={plan.id}
                  >
                    <div className="landing-pricing-body">
                      {/* Consistent Badge Slot */}
                      <div className="landing-pricing-badge-row">
                        {isGrowth ? (
                          <span className="landing-pricing-badge popular">
                            <i className="fa-solid fa-bolt" /> Recommended
                          </span>
                        ) : plan.badge ? (
                          <span className="landing-pricing-badge standard">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="landing-pricing-title">
                        {plan.name}
                      </h3>

                      <p className="landing-pricing-subtitle" style={{ minHeight: '44px' }}>
                        {plan.name === 'Starter'
                          ? 'Ideal for single-location studios and boutique fitness centers.'
                          : plan.name === 'Growth'
                            ? 'Designed for multi-branch gym networks with high monthly athlete flow.'
                            : 'Complete enterprise infrastructure for large gym franchises and networks.'}
                      </p>

                      <div className="landing-pricing-price-wrap">
                        <div className="landing-pricing-original-price">
                          {pricing.discountAmount > 0 && currency(basePrice)}
                        </div>

                        <div className={`landing-pricing-amount ${pricing.discountAmount > 0 ? 'discounted' : ''}`}>
                          {currency(pricing.finalPrice)}
                          <span className="landing-pricing-unit">
                            {saasBilling === 'yearly' ? '/year' : '/month'}
                          </span>
                        </div>

                        <div className="landing-pricing-validity">
                          {saasBilling === 'yearly' ? (
                            <span>
                              Equivalent to {currency(pricing.finalPrice / 12)}/month
                            </span>
                          ) : (
                            <span>
                              Flexible month-to-month billing
                            </span>
                          )}
                        </div>
                      </div>

                      <hr className="landing-pricing-divider" />

                      <ul className="landing-pricing-features">
                        {plan.features.map((feature, index) => (
                          <li key={`${plan.id}-feature-${index}`}>
                            <i className="fa-solid fa-circle-check text-accent" style={{ fontSize: '0.85rem' }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={registrationUrl}
                        className={`btn ${isGrowth ? 'btn-accent' : 'btn-outline'} landing-pricing-btn`}
                      >
                        Start {plan.trialDays}-Day Free Trial
                      </Link>
                    </div>
                  </div>
                );
              })}

              {saasPlans.length === 0 && (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                  No active SaaS plans are available right now.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-faq-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Frequently Asked Questions
          </h2>
          <p className="landing-section-subtitle">
            Have questions about GymFlow? Here are the answers to our most common queries.
          </p>
        </div>

        {faqs.map((faq, index) => (
          <div key={faq.q} className="faq-item">
            <button
              type="button"
              className="faq-question"
              aria-expanded={openFaq === index}
              onClick={() =>
                setOpenFaq(openFaq === index ? null : index)
              }
            >
              <span>{faq.q}</span>
              <i
                className={`fa-solid ${openFaq === index ? 'fa-minus' : 'fa-plus'}`}
                style={{ color: 'var(--color-accent)' }}
              />
            </button>

            {openFaq === index && (
              <div className="faq-answer">{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
            Gym<span style={{ color: 'var(--color-accent)' }}>Flow</span>
          </div>
          <p style={{ maxWidth: 550, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Gym and fitness club management platform for platform operators, gym owners,
            trainers and athletes.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
              fontWeight: 600,
            }}
          >
            <Link href="/login">Sign In</Link>
            <Link href="/register">Register Gym</Link>
            <Link href="/forgot-password">Forgot Password</Link>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} GymFlow. All rights reserved. Demo preview environment.
          </div>
        </div>
      </footer>
    </div>
  );
}
