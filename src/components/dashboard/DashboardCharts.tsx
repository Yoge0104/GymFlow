'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatINR, formatNumber } from '@/lib/formatters';

interface RevenuePoint {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export function RevenueExpensesChart({ data }: { data: RevenuePoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Financial Chart...</div>;
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => [formatINR(Number(value)), name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Operating Profit']}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(val) => (val === 'revenue' ? 'Revenue (INR)' : val === 'expenses' ? 'Expenses (INR)' : 'Net Profit (INR)')}
          />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" name="revenue" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" name="expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlanDistributionChart({ data }: { data: { name: string; value: number; fill?: string }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Plan Distribution...</div>;
  }

  const defaultColors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#ec4899'];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${formatNumber(Number(value))} athletes`, 'Enrollments']}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentMethodsChart({ data }: { data: { name: string; value: number; fill?: string }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Payment Methods...</div>;
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={110} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any) => [formatINR(Number(value)), 'Processed Volume']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, idx) => (
              <Cell key={`bar-${idx}`} fill={entry.fill || '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyAttendanceChart({ data }: { data: { day: string; visits: number; capacity: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Attendance Trend...</div>;
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => [
              `${formatNumber(Number(value))} check-ins`,
              name === 'visits' ? 'Daily Attendance' : 'Max Target Cap',
            ]}
          />
          <Bar dataKey="visits" fill="#38bdf8" radius={[4, 4, 0, 0]} name="visits" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BranchComparisonChart({ data }: { data: { branchName: string; members: number; revenue: number; visits: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Branch Performance...</div>;
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="branchName" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => [
              name === 'revenue' ? formatINR(Number(value)) : formatNumber(Number(value)),
              name === 'revenue' ? 'Monthly Revenue' : 'Enrolled Members',
            ]}
          />
          <Legend verticalAlign="top" height={32} />
          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Monthly Revenue (INR)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
