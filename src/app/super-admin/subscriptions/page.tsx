'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { Gym } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function SuperAdminSubscriptions() {
  const [gyms, setGyms] = useState<Gym[]>([]);

  const refreshData = () => {
    setGyms(StorageService.getCollection<Gym>('gyms'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSimulateRenewal = (gym: Gym) => {
    toast.success(`Simulated monthly subscription renewal processed for ${gym.name} (${formatINR(gym.monthlyRevenue || 6999)}).`);
  };

  const columns: Column<Gym>[] = [
    {
      key: 'name',
      header: 'Organization',
      sortable: true,
      render: (gym) => (
        <div>
          <div style={{ fontWeight: 700 }}>{gym.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gym.city}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Subscribed Tier',
      sortable: true,
      render: (gym) => (
        <span className="badge badge-accent" style={{ fontWeight: 700 }}>
          {gym.planName || 'Growth'}
        </span>
      ),
    },
    {
      key: 'monthlyRevenue',
      header: 'Monthly SaaS Fee',
      sortable: true,
      render: (gym) => <strong>{formatINR(gym.monthlyRevenue || 6999)}</strong>,
    },
    {
      key: 'joinedDate',
      header: 'Subscription Start',
      sortable: true,
      render: (gym) => <span>{formatDate(gym.joinedDate || '2025-01-15')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (gym) => (
        <span className={`badge ${gym.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {gym.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (gym) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleSimulateRenewal(gym)}
          >
            Simulate Renewal
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">SaaS Subscriptions</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Tenant Gym Subscriptions & Recurrences
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Active SaaS tier licenses, billing frequencies, and recurring automated invoices.
          </p>
        </div>
      </div>

      <DataTable
        data={gyms}
        columns={columns}
        searchPlaceholder="Search gyms..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
        ]}
        exportFilename="gymflow-tenant-subscriptions"
      />
    </DashboardLayout>
  );
}
