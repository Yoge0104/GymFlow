'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { ProgressRecord } from '@/types';
import { formatDate } from '@/lib/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { toast } from 'sonner';

export default function MemberProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState(81.3);
  const [bodyFatPercent, setBodyFatPercent] = useState(14.6);
  const [chestCm, setChestCm] = useState(107);
  const [waistCm, setWaistCm] = useState(82);
  const [armsCm, setArmsCm] = useState(38);
  const [notes, setNotes] = useState('Morning weigh-in before breakfast.');

  const refreshData = () => {
    const all = StorageService.getCollection<ProgressRecord>('progressRecords');
    const myRecords = all.filter((r) => r.memberId === 'mem-001');
    if (myRecords.length > 0) {
      setRecords(myRecords);
    } else {
      const defaults: ProgressRecord[] = [
        { id: 'pr-1', memberId: 'mem-001', date: '2026-01-15', weightKg: 84.5, bodyFatPercent: 18.2, chestCm: 104, waistCm: 88, armsCm: 36, notes: 'Baseline scan' },
        { id: 'pr-2', memberId: 'mem-001', date: '2026-02-15', weightKg: 83.2, bodyFatPercent: 16.8, chestCm: 105, waistCm: 86, armsCm: 37, notes: 'Hypertrophy month 1' },
        { id: 'pr-3', memberId: 'mem-001', date: '2026-03-15', weightKg: 82.0, bodyFatPercent: 15.5, chestCm: 106, waistCm: 84, armsCm: 37.5, notes: 'Strength increasing' },
        { id: 'pr-4', memberId: 'mem-001', date: '2026-04-15', weightKg: 81.3, bodyFatPercent: 14.6, chestCm: 107, waistCm: 82, armsCm: 38, notes: 'Target body comp reached' },
      ];
      setRecords(defaults);
      defaults.forEach((d) => StorageService.saveItem('progressRecords', d));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ProgressRecord = {
      id: `pr_${Date.now()}`,
      memberId: 'mem-001',
      date,
      weightKg: Number(weightKg),
      bodyFatPercent: Number(bodyFatPercent),
      chestCm: Number(chestCm),
      waistCm: Number(waistCm),
      armsCm: Number(armsCm),
      notes,
    };

    StorageService.saveItem('progressRecords', newRecord);
    refreshData();
    setShowLogModal(false);
    toast.success('Biometric measurement logged successfully! Chart updated.');
  };

  const latest = records[records.length - 1] || {
    weightKg: 81.3,
    bodyFatPercent: 14.6,
    chestCm: 107,
    waistCm: 82,
  };

  const columns: Column<ProgressRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (r) => <strong>{formatDate(r.date)}</strong>,
    },
    {
      key: 'weightKg',
      header: 'Weight (kg)',
      sortable: true,
      render: (r) => <span>{r.weightKg} kg</span>,
    },
    {
      key: 'bodyFatPercent',
      header: 'Body Fat %',
      sortable: true,
      render: (r) => <span className="badge badge-success">{r.bodyFatPercent}%</span>,
    },
    {
      key: 'chestCm',
      header: 'Chest (cm)',
      render: (r) => <span>{r.chestCm || '—'} cm</span>,
    },
    {
      key: 'waistCm',
      header: 'Waist (cm)',
      render: (r) => <span>{r.waistCm || '—'} cm</span>,
    },
    {
      key: 'armsCm',
      header: 'Arms (cm)',
      render: (r) => <span>{r.armsCm || '—'} cm</span>,
    },
    {
      key: 'notes',
      header: 'Coach Notes',
      render: (r) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.notes || 'Routine check'}</span>,
    },
  ];

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Body Progress</span>
          </div>
          <h1 className="page-title">Fitness Progress & Biometrics</h1>
          <p className="page-subtitle">
            Track weight trends, body composition scans, tape measurements, and transformation milestones.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-accent" onClick={() => setShowLogModal(true)}>
            <i className="fa-solid fa-plus" style={{ marginRight: '0.4rem' }} /> Log Measurement
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}
      >
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa-solid fa-weight-scale" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Current Weight</span>
            <span className="stat-value">{latest.weightKg} kg</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-down" /> -3.2 kg overall
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa-solid fa-percent" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Body Fat %</span>
            <span className="stat-value">{latest.bodyFatPercent}%</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-down" /> -3.6% reduction
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-solid fa-ruler-combined" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Chest Width</span>
            <span className="stat-value">{latest.chestCm} cm</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-up" /> +3.0 cm gain
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fa-solid fa-ruler" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Waist Size</span>
            <span className="stat-value">{latest.waistCm} cm</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-down" /> -6.0 cm trim
            </span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">
            <i className="fa-solid fa-chart-line text-accent" style={{ marginRight: '0.4rem' }} />
            Weight &amp; Body Composition Trend
          </h3>
          <span className="text-xs text-muted">Monthly InBody & Scale Progress</span>
        </div>
        <div className="card-body">
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={[10, 25]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weightKg" stroke="#2563eb" strokeWidth={3} name="Weight (kg)" activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="bodyFatPercent" stroke="#10b981" strokeWidth={3} name="Body Fat %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Measurement History Table */}
      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search biometric logs by date or notes..."
      />

      {/* Log Measurement Modal */}
      {showLogModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '520px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-plus text-accent" style={{ marginRight: '0.4rem' }} />
                Log Biometric Measurement
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowLogModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddMeasurement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={bodyFatPercent}
                      onChange={(e) => setBodyFatPercent(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chest (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={chestCm}
                      onChange={(e) => setChestCm(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Waist (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={waistCm}
                      onChange={(e) => setWaistCm(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arms (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={armsCm}
                      onChange={(e) => setArmsCm(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Condition & Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
