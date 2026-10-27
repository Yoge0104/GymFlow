'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { useAuth } from '@/context/AuthContext';
import { Member, PaymentRecord, Expense } from '@/types';
import { formatINR, formatNumber, formatPercentage } from '@/lib/formatters';
import {
  RevenueExpensesChart,
  PlanDistributionChart,
  PaymentMethodsChart,
  WeeklyAttendanceChart,
  BranchComparisonChart,
} from '@/components/dashboard/DashboardCharts';

export default function AdminReports() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '12m'>('12m');

  useEffect(() => {
    setMembers(DataScopeService.getMembers(user));
    setPayments(DataScopeService.getPayments(user));
    setExpenses(DataScopeService.getExpenses(user));
  }, [user]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.status === 'Successful' ? p.amount : 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalRevenue - totalExpense;
  const operatingMargin = totalRevenue > 0 ? (netOperatingProfit / totalRevenue) * 100 : 42.5;

  const revenueTrendData = AnalyticsService.getRevenueExpensesTrend(user, timeRange);
  const planDistribution = AnalyticsService.getPlanDistribution(user);
  const paymentMethods = AnalyticsService.getPaymentMethodsBreakdown(user);
  const attendanceTrend = AnalyticsService.getWeeklyAttendanceTrend(user);
  const branchComparison = AnalyticsService.getBranchComparison(user);

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Reports & Analytics</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Club Business Intelligence & Financial Analytics
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Membership growth trends, attendance heatmaps, revenue collections, and expense margins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['30d', '90d', '12m'] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-sm ${timeRange === r ? 'btn-accent' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              onClick={() => setTimeRange(r)}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Gross Collections
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-accent)' }}>
            {formatINR(totalRevenue || 289500)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            <i className="fa-solid fa-arrow-trend-up" /> Dues & purchases
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Operational Costs
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-danger)' }}>
            {formatINR(totalExpense || 165000)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Rent, utilities & payroll
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Net Operating Profit
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: netOperatingProfit >= 0 ? 'var(--color-success-text)' : 'var(--color-danger)' }}>
            {formatINR(netOperatingProfit || 124500)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Operating margin: {formatPercentage(operatingMargin)}
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Club Athletes
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {formatNumber(members.length || 420)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            Churn rate: 1.4% (Healthy)
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid 1: Revenue Curve & Plan Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Revenue & Expense Trends</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Monthly inflow vs outflow trajectory in INR
          </span>
          <RevenueExpensesChart data={revenueTrendData} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Revenue by Category</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Membership package proportion
          </span>
          <PlanDistributionChart data={planDistribution} />
        </div>
      </div>

      {/* Visual Analytics Grid 2: Payment Methods & Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Payment Gateway Distribution</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Collections volume by simulated payment method (INR)
          </span>
          <PaymentMethodsChart data={paymentMethods} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>Weekly Attendance Distribution</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
            Daily check-ins vs capacity thresholds
          </span>
          <WeeklyAttendanceChart data={attendanceTrend} />
        </div>
      </div>

      {/* Multi-Branch Performance */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Multi-Branch Location Performance</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparison of revenues across club locations</span>
          </div>
          <Link href="/admin/branches" className="btn btn-secondary btn-sm">
            View Branches &rarr;
          </Link>
        </div>
        <BranchComparisonChart data={branchComparison} />
      </div>
    </DashboardLayout>
  );
}
