'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { AttendanceRecord } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function MemberAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const refreshData = () => {
    const all = StorageService.getCollection<AttendanceRecord>('attendanceRecords');
    const memberRecords = all.filter((r) => r.memberId === 'mem-001' || r.memberName?.includes('Alex'));
    setRecords(memberRecords.length > 0 ? memberRecords : all.slice(0, 10));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleScanQR = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      gymId: 'gym-001',
      branchId: 'branch-001',
      memberId: 'mem-001',
      memberName: 'Alex Morgan',
      planName: 'Annual VIP All-Access',
      checkInTime: timeNow,
      checkOutTime: 'In Progress',
      status: 'Active',
      verifiedVia: 'QR Kiosk',
    };

    StorageService.saveItem('attendanceRecords', newRecord);
    refreshData();
    toast.success('QR Code verified! Facility gate unlocked at Downtown Branch.');
  };

  const chartData = [
    { day: 'Mon', visits: 1, duration: 65 },
    { day: 'Tue', visits: 1, duration: 72 },
    { day: 'Wed', visits: 0, duration: 0 },
    { day: 'Thu', visits: 1, duration: 60 },
    { day: 'Fri', visits: 1, duration: 75 },
    { day: 'Sat', visits: 1, duration: 80 },
    { day: 'Sun', visits: 0, duration: 0 },
  ];

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'checkInTime',
      header: 'Check-In Time',
      sortable: true,
      render: (rec) => (
        <span>
          <i className="fa-regular fa-clock text-success" style={{ marginRight: '0.3rem' }} />
          {rec.checkInTime}
        </span>
      ),
    },
    {
      key: 'checkOutTime',
      header: 'Check-Out',
      render: (rec) => <span>{rec.checkOutTime || '08:15 AM'}</span>,
    },
    {
      key: 'planName',
      header: 'Membership Tier',
      render: (rec) => (
        <span>
          <i className="fa-solid fa-id-card text-muted" style={{ marginRight: '0.3rem' }} />
          {rec.planName || 'Annual VIP Pass'}
        </span>
      ),
    },
    {
      key: 'verifiedVia',
      header: 'Verification Method',
      render: (rec) => (
        <span className="badge badge-secondary">
          <i className="fa-solid fa-qrcode" style={{ marginRight: '0.3rem' }} />
          {rec.verifiedVia || 'QR Kiosk'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (rec) => (
        <span className={`badge ${rec.status === 'Active' ? 'badge-success' : 'badge-primary'}`}>
          {rec.status}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Attendance</span>
          </div>
          <h1 className="page-title">Attendance & Workout Consistency</h1>
          <p className="page-subtitle">Track your gym check-ins, consistency streaks, and peak training hours.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-accent" onClick={handleScanQR}>
            <i className="fa-solid fa-qrcode" style={{ marginRight: '0.4rem' }} /> Scan Gym QR Code
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}
      >
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa-solid fa-fire" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Streak</span>
            <span className="stat-value">14 Days</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-trend-up" /> Personal Record!
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Visits This Month</span>
            <span className="stat-value">18 Visits</span>
            <span className="stat-change text-success">Target: 16 visits</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-solid fa-clock" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Peak Workout Window</span>
            <span className="stat-value">06:30 – 08:00 AM</span>
            <span className="stat-change text-muted">Early Bird Lifter</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fa-solid fa-stopwatch" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg. Workout Length</span>
            <span className="stat-value">68 Minutes</span>
            <span className="stat-change text-muted">Optimal duration</span>
          </div>
        </div>
      </div>

      {/* Consistency Chart Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fa-solid fa-chart-column text-accent" style={{ marginRight: '0.4rem' }} /> Weekly Check-In Distribution
          </h3>
        </div>
        <div className="card-body">
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="duration" fill="var(--primary-color)" radius={[4, 4, 0, 0]} name="Session Duration (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search attendance by check-in time or plan..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'All Statuses', value: '' },
          { label: 'Active', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
        ]}
      />
    </DashboardLayout>
  );
}
