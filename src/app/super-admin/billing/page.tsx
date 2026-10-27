'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { formatINR, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

interface PlatformBillingRecord {
  id: string;
  invoiceNo: string;
  gymId: string;
  gymName: string;
  planName: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  refundStatus: string;
}

export default function SuperAdminBilling() {
  const [transactions, setTransactions] = useState<PlatformBillingRecord[]>([]);

  const refreshData = () => {
    setTransactions(StorageService.getCollection<PlatformBillingRecord>('platformBilling'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSimulateRefund = (tx: PlatformBillingRecord) => {
    tx.refundStatus = 'Refunded';
    tx.status = 'Refunded';
    StorageService.saveItem('platformBilling', tx);
    refreshData();
    toast.success(`Simulated refund processed for ${tx.invoiceNo} (${formatINR(tx.amount)}).`);
  };

  const totalCollected = transactions.reduce((acc, t) => acc + (t.status === 'Paid' ? t.amount : 0), 0);

  const columns: Column<PlatformBillingRecord>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice #',
      sortable: true,
      render: (tx) => <strong>{tx.invoiceNo}</strong>,
    },
    {
      key: 'gymName',
      header: 'Tenant Gym',
      sortable: true,
      render: (tx) => (
        <div>
          <div style={{ fontWeight: 600 }}>{tx.gymName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.planName} Plan</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (tx) => <strong>{formatINR(tx.amount)}</strong>,
    },
    {
      key: 'date',
      header: 'Billing Date',
      sortable: true,
      render: (tx) => <span>{formatDate(tx.date)}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      sortable: true,
      render: (tx) => <span className="badge badge-secondary">{tx.method}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (tx) => (
        <span className={`badge ${tx.status === 'Paid' ? 'badge-success' : tx.status === 'Refunded' ? 'badge-warning' : 'badge-danger'}`}>
          {tx.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (tx) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          {tx.status === 'Paid' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleSimulateRefund(tx)}
            >
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Tenant Billing</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform SaaS Billing Ledger
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Subscription settlements, platform fee collections, and tenant gym invoice records.
          </p>
        </div>
        <div>
          <div className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '0.5rem 0.9rem' }}>
            Total MRR Collections: {formatINR(totalCollected)}
          </div>
        </div>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="Search invoices or tenant gyms..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Paid', value: 'Paid' },
          { label: 'Refunded', value: 'Refunded' },
          { label: 'Pending', value: 'Pending' },
        ]}
        exportFilename="gymflow-saas-billing-ledger"
      />
    </DashboardLayout>
  );
}
