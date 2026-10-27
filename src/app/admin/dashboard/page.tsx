'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { useAuth } from '@/context/AuthContext';
import { Member, AttendanceRecord, FitnessClass, PaymentRecord } from '@/types';
import { formatINR, formatNumber, formatDate } from '@/lib/formatters';
import {
  RevenueExpensesChart,
  PlanDistributionChart,
  PaymentMethodsChart,
  WeeklyAttendanceChart,
  BranchComparisonChart,
} from '@/components/dashboard/DashboardCharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '12m'>('12m');

  const refreshData = () => {
    setMembers(DataScopeService.getMembers(user));
    setAttendance(DataScopeService.getAttendance(user));
    setClasses(DataScopeService.getClasses(user));
    setPayments(DataScopeService.getPayments(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const activeMembers = members.filter((m) => m.status === 'Active');
  const todayAttendance = attendance.slice(0, 8);
  const totalDues = members.reduce((sum, m) => sum + (m.balanceDue || 0), 0);
  const monthlyRevenue = payments.reduce((sum, p) => sum + (p.status === 'Successful' ? p.amount : 0), 0);

  // Aggregated analytics
  const revenueTrendData = AnalyticsService.getRevenueExpensesTrend(user, timeRange);
  const planDistribution = AnalyticsService.getPlanDistribution(user);
  const paymentMethods = AnalyticsService.getPaymentMethodsBreakdown(user);
  const attendanceTrend = AnalyticsService.getWeeklyAttendanceTrend(user);
  const branchComparison = AnalyticsService.getBranchComparison(user);

  return (
    <DashboardLayout portal="admin">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>Gym Admin</span> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Operations Dashboard</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Gym Operations Command Center
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Live occupancy, member counts, check-in flows, and financial intelligence for IronPulse.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/attendance" className="btn btn-primary">
            <i className="fa-solid fa-id-card-clip" /> Open Check-In Desk
          </Link>
          <Link href="/admin/members" className="btn btn-accent">
            <i className="fa-solid fa-user-plus" /> New Member
          </Link>
        </div>
      </div>

      {/* Operational Metric KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-card card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Members
              </span>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {formatNumber(activeMembers.length || 420)}
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="fa-solid fa-arrow-up" /> +18 this month
              </span>
            </div>
            <div className="stat-icon green" style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
              <i className="fa-solid fa-users" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Today&apos;s Check-Ins
              </span>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {formatNumber(attendance.length || 84)}
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check" /> Peak: 6:00 - 8:30 PM
              </span>
            </div>
            <div className="stat-icon purple" style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-purple-subtle)', color: 'var(--color-purple)' }}>
              <i className="fa-solid fa-id-card-clip" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Monthly Cashflow
              </span>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {formatINR(monthlyRevenue || 289500)}
              </div>
              <span className="stat-change text-success" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="fa-solid fa-arrow-trend-up" /> +8.4% vs Mar
              </span>
            </div>
            <div className="stat-icon blue" style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-electric-subtle)', color: 'var(--color-electric)' }}>
              <i className="fa-solid fa-sack-dollar" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Outstanding Dues
              </span>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0', color: totalDues > 0 ? 'var(--color-danger)' : 'var(--text-main)' }}>
                {formatINR(totalDues || 14200)}
              </div>
              <span className="stat-change text-warning" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                <i className="fa-solid fa-clock" /> Pending payments
              </span>
            </div>
            <div className="stat-icon red" style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <i className="fa-solid fa-file-invoice-dollar" />
            </div>
          </div>
        </div>

        <div className="stat-card card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Floor Occupancy
              </span>
              <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--color-accent)' }}>
                68%
              </div>
              <span className="stat-change text-muted" style={{ fontSize: '0.75rem' }}>
                136 / 200 max cap
              </span>
            </div>
            <div className="stat-icon green" style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
              <i className="fa-solid fa-gauge" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations: Financial Trend & Plan Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Revenue vs Expenditure Trend</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Financial collections vs operational outlays (INR)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['30d', '90d', '12m'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm ${timeRange === r ? 'btn-accent' : 'btn-outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => setTimeRange(r)}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <RevenueExpensesChart data={revenueTrendData} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Membership Tier Share</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Active roster distribution by plan
          </span>
          <PlanDistributionChart data={planDistribution} />
        </div>
      </div>

      {/* Analytics Visualizations: Payment Gateway Methods & Weekly Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Payment Method Distribution</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Collections volume by simulated gateway (INR)
          </span>
          <PaymentMethodsChart data={paymentMethods} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Weekly Floor Attendance Flow</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Peak check-ins vs capacity limit across days
          </span>
          <WeeklyAttendanceChart data={attendanceTrend} />
        </div>
      </div>

      {/* Multi-Branch Performance Comparison */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Multi-Branch Revenue Comparison</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Financial performance across club locations</span>
          </div>
          <Link href="/admin/branches" className="btn btn-secondary btn-sm">
            Manage Branches &rarr;
          </Link>
        </div>
        <BranchComparisonChart data={branchComparison} />
      </div>

      {/* Live Floor Activity & Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Realtime Check-in Log */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Live Reception Check-In Activity</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated scanner and manual desk entries</span>
            </div>
            <Link href="/admin/attendance" className="btn btn-secondary btn-sm">
              Full Kiosk &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                  <th>Athlete</th>
                  <th>Plan</th>
                  <th>Check-In Time</th>
                  <th>Verified Via</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map((rec, idx) => (
                  <tr key={rec.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <strong>{rec.memberName}</strong>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{rec.planName}</span>
                    </td>
                    <td>{new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.verifiedVia}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{rec.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Classes Scheduled Today */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Today&apos;s Group Classes</h3>
              <Link href="/admin/classes" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                Timetable
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {classes.slice(0, 4).map((c) => (
                <div
                  key={c.id}
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
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.startTime} • {c.trainerName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                      {c.enrolledCount} / {c.capacity} Booked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.1rem', fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/admin/invoices" className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-file-invoice-dollar" /> View & Issue Invoices
              </Link>
              <Link href="/admin/payments" className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-credit-card" /> Process Simulated Payment
              </Link>
              <Link href="/admin/discounts" className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-percent" /> Manage Club Discounts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
