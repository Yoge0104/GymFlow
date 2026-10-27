'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { Gym, SaasPlan } from '@/types';
import { formatINR, formatNumber } from '@/lib/formatters';
import {
  RevenueExpensesChart,
  PlanDistributionChart,
} from '@/components/dashboard/DashboardCharts';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [plans, setPlans] = useState<SaasPlan[]>([]);

  useEffect(() => {
    setGyms(StorageService.getCollection<Gym>('gyms'));
    setPlans(StorageService.getCollection<SaasPlan>('saasPlans'));
  }, []);

  const totalRevenue = gyms.reduce((acc, g) => acc + (g.monthlyRevenue || 6999), 0);
  const activeGymsCount = gyms.filter((g) => g.status === 'active').length;
  const trialGymsCount = gyms.filter((g) => g.status === 'trial').length;
  const totalMembers = gyms.reduce((acc, g) => acc + (g.membersCount || 0), 0);

  const { mrrHistory, planDistribution } = AnalyticsService.getSuperAdminPlatformMetrics();

  const handleSimulateRenewal = (gymName: string) => {
    toast.success(`Simulated SaaS renewal confirmation sent to ${gymName}.`);
  };

  const mrrChartData = mrrHistory.map((pt) => ({
    period: pt.period,
    revenue: pt.mrr,
    expenses: Math.round(pt.mrr * 0.28),
    profit: Math.round(pt.mrr * 0.72),
  }));

  return (
    <DashboardLayout portal="super-admin">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>Super Admin</span> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">SaaS Dashboard</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Executive Command Center
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Live platform metrics, active tenant organizations, subscription growth, and infrastructure telemetry.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/super-admin/gyms" className="btn btn-accent">
            <i className="fa-solid fa-plus" /> Onboard Gym
          </Link>
          <Link href="/super-admin/discounts" className="btn btn-secondary">
            <i className="fa-solid fa-percent" /> Manage Promotions
          </Link>
        </div>
      </div>

      {/* 4 Platform KPI Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="stat-card card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Monthly Recurring Revenue
              </span>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {formatINR(totalRevenue || 104985)}
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                <i className="fa-solid fa-arrow-trend-up" /> +14.2% vs last month
              </span>
            </div>
            <div className="stat-icon green" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)', fontSize: '1.25rem' }}>
              <i className="fa-solid fa-sack-dollar" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Tenant Gyms
              </span>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {formatNumber(activeGymsCount || gyms.length || 14)}
              </div>
              <span className="stat-change text-info" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                <i className="fa-solid fa-building" /> {formatNumber(trialGymsCount || 2)} in 14-day trial
              </span>
            </div>
            <div className="stat-icon blue" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-electric-subtle)', color: 'var(--color-electric)', fontSize: '1.25rem' }}>
              <i className="fa-solid fa-building" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Athletes Enrolled
              </span>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {formatNumber(totalMembers || 8420)}
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                <i className="fa-solid fa-users" /> Across all client gyms
              </span>
            </div>
            <div className="stat-icon purple" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-purple-subtle)', color: 'var(--color-purple)', fontSize: '1.25rem' }}>
              <i className="fa-solid fa-users" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Platform Health & Uptime
              </span>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-accent)' }}>
                99.98%
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" /> All microservices healthy
              </span>
            </div>
            <div className="stat-icon green" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)', fontSize: '1.25rem' }}>
              <i className="fa-solid fa-heart-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: MRR Growth Trend & Tier Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Platform MRR Growth Velocity</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly recurring subscription revenue curve (INR)</span>
            </div>
            <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
              +14.2% MoM
            </span>
          </div>
          <RevenueExpensesChart data={mrrChartData} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Tenant Subscription Tiers</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Gym distribution across SaaS tiers
          </span>
          <PlanDistributionChart data={planDistribution} />
        </div>
      </div>

      {/* Main Grid: Directory Preview & Subscriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Registered Gyms */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Registered Gym Organizations</h3>
            <Link href="/super-admin/gyms" className="btn btn-secondary btn-sm">
              View All Directory &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                  <th>Organization</th>
                  <th>SaaS Plan</th>
                  <th>Athletes</th>
                  <th>Monthly SaaS</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gyms.slice(0, 5).map((gym, idx) => (
                  <tr key={gym.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{gym.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gym.city} • Owner: {gym.ownerName}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{gym.planName || 'Growth'}</span>
                    </td>
                    <td>{formatNumber(gym.membersCount || 420)}</td>
                    <td><strong>{formatINR(gym.monthlyRevenue || 6999)}</strong></td>
                    <td>
                      <span className={`badge ${gym.status === 'active' ? 'badge-success' : gym.status === 'trial' ? 'badge-warning' : 'badge-danger'}`}>
                        {gym.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href="/super-admin/gym-details" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: SaaS Renewals & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              <i className="fa-solid fa-clock-rotate-left text-warning" style={{ marginRight: '0.4rem' }} /> Upcoming Renewals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {gyms.slice(0, 3).map((gym, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{gym.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Renews on 1{idx + 2} Nov 2026 ({formatINR(gym.monthlyRevenue || 6999)}/mo)
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                    onClick={() => handleSimulateRenewal(gym.name)}
                  >
                    Simulate
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              <i className="fa-solid fa-server text-accent" style={{ marginRight: '0.4rem' }} /> Infrastructure Telemetry
            </h3>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>API Latency:</span>
                <strong>42ms (p99: 88ms)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>DB Connection Pool:</span>
                <strong>34 / 200 (Active)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Error Rate:</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>0.01%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Worker Queues:</span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Running</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
