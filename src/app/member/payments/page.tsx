'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { PrintInvoiceModal } from '@/components/common/PrintInvoiceModal';
import { StorageService } from '@/services/StorageService';
import { Invoice } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function MemberPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardHolder, setCardHolder] = useState('Alex Morgan');

  const refreshData = () => {
    const all = StorageService.getCollection<Invoice>('invoices');
    const memberInvoices = all.filter((inv) => inv.memberId === 'mem-001' || inv.memberName?.includes('Alex'));
    setInvoices(memberInvoices.length > 0 ? memberInvoices : all.slice(0, 5));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalSpent = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const outstandingBalance = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Primary card on file updated successfully!');
    setShowCardModal(false);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => <strong style={{ color: 'var(--primary-color)' }}>{inv.invoiceNumber}</strong>,
    },
    {
      key: 'issueDate',
      header: 'Date',
      sortable: true,
      render: (inv) => <span style={{ fontSize: '0.85rem' }}>{formatDate(inv.issueDate)}</span>,
    },
    {
      key: 'notes',
      header: 'Description',
      render: (inv) => (
        <div>
          <div style={{ fontWeight: 600 }}>{inv.items?.[0]?.description || inv.planName || 'Gym Membership & Facility Access'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Due: {formatDate(inv.dueDate)}
          </div>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: () => (
        <span style={{ fontSize: '0.85rem' }}>
          <i className="fa-brands fa-cc-visa text-primary" style={{ marginRight: '0.3rem' }} /> Visa •••• 4242
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Amount',
      sortable: true,
      render: (inv) => <strong>{formatINR(inv.total)}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (inv) => (
        <span
          className={`badge ${
            inv.status === 'Paid'
              ? 'badge-success'
              : inv.status === 'Partially Paid'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {inv.status}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Receipt',
      render: (inv) => (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setSelectedInvoice(inv)}
          title="View and print official receipt"
        >
          <i className="fa-solid fa-receipt" style={{ marginRight: '0.3rem' }} /> View Receipt
        </button>
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
            <span className="breadcrumb-current">Billing History</span>
          </div>
          <h1 className="page-title">Billing History & Payment Invoices</h1>
          <p className="page-subtitle">
            View and download statements, official payment receipts, and manage your card on file.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-outline" onClick={() => setShowCardModal(true)}>
            <i className="fa-solid fa-credit-card" style={{ marginRight: '0.4rem' }} /> Update Payment Method
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
            <i className="fa-solid fa-wallet" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Invested</span>
            <span className="stat-value">{formatINR(totalSpent)}</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-circle-check" /> Account in good standing
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Next Renewal Date</span>
            <span className="stat-value">May 1, 2026</span>
            <span className="stat-change text-muted">Annual VIP Billing Cycle</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-brands fa-cc-visa" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Card</span>
            <span className="stat-value">Visa •••• 4242</span>
            <span className="stat-change text-success">Expires 08/28</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa-solid fa-scale-balanced" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Outstanding Balance</span>
            <span className="stat-value">{formatINR(outstandingBalance)}</span>
            <span className="stat-change text-success">Zero Overdue</span>
          </div>
        </div>
      </div>

      {/* Invoices DataTable */}
      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices by number or description..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'All Statuses', value: '' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Unpaid / Overdue', value: 'Unpaid' },
        ]}
      />

      {/* Update Card Modal */}
      {showCardModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-credit-card text-accent" style={{ marginRight: '0.4rem' }} />
                Update Payment Method
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowCardModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateCard}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC / Security Code</label>
                    <input type="password" className="form-control" placeholder="•••" required />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Card Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Receipt Modal */}
      {selectedInvoice && (
        <PrintInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </DashboardLayout>
  );
}
