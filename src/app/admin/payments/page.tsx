'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { PaymentService, InvoiceService } from '@/services/PaymentService';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { PrintInvoiceModal } from '@/components/common/PrintInvoiceModal';
import { PaymentRecord, Member, Invoice } from '@/types';
import { formatINR, formatDate, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [refundTargetPayment, setRefundTargetPayment] = useState<PaymentRecord | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<{ invoice: Invoice; payment: PaymentRecord } | null>(null);

  // Simulated Payment Form State
  const [memberId, setMemberId] = useState('mem_101');
  const [amount, setAmount] = useState<number>(2499);
  const [method, setMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Card');
  const [planName, setPlanName] = useState('Monthly All-Access');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [notes, setNotes] = useState('Monthly membership dues');

  const refreshData = () => {
    setPayments(DataScopeService.getPayments(user));
    setMembers(DataScopeService.getMembers(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === memberId) || members[0];
    if (!targetMember) return;

    const res = PaymentService.simulatePayment({
      gymId: 'gym_1',
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberEmail: targetMember.email,
      planName,
      amount: Number(amount),
      method,
      simulateFailure,
      notes,
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }

    refreshData();
    setModalOpen(false);
  };

  const confirmRefund = () => {
    if (!refundTargetPayment) return;
    PaymentService.simulateRefund(refundTargetPayment.id);
    refreshData();
    toast.success(`Simulated refund of ${formatINR(refundTargetPayment.amount)} recorded.`);
    setRefundTargetPayment(null);
  };

  const handleViewReceipt = (p: PaymentRecord) => {
    const rawReceipt = p.receiptNumber || `RCP-${p.id || Date.now()}`;
    const invoiceNum = p.receiptNumber
      ? p.receiptNumber.replace('RCP', 'INV')
      : (p.invoiceNo || p.invoiceId || `INV-${p.id || Date.now()}`);
    const planTitle = p.planName || p.description || 'Club Membership';

    const inv = (p.invoiceId ? InvoiceService.getById(p.invoiceId) : null) || ({
      id: p.invoiceId || `inv_${Date.now()}`,
      gymId: p.gymId || 'gym_1',
      gymName: 'IronPulse Fitness Club',
      gymAddress: 'MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      gymPhone: '+91 80 4123 4567',
      gymEmail: 'billing@ironpulse.in',
      invoiceNumber: invoiceNum,
      memberId: p.memberId,
      memberName: p.memberName,
      memberEmail: p.memberEmail || 'member@ironpulse.in',
      planName: planTitle,
      items: [
        {
          id: 'item_1',
          description: `${planTitle} Payment`,
          quantity: 1,
          unitPrice: p.amount,
          discountAmount: 0,
          taxRate: 18,
          total: p.amount,
        },
      ],
      subtotal: p.amount,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: Math.round(p.amount * 0.18 * 100) / 100,
      total: p.amount,
      paidAmount: p.amount,
      balanceDue: 0,
      status: 'Paid',
      issueDate: p.date,
      dueDate: p.date,
      paymentMethod: p.method,
      paidAt: p.date,
      notes: p.notes || 'Simulated transaction in demo mode',
    } as unknown as Invoice);

    setActiveReceiptModal({
      invoice: inv,
      payment: {
        ...p,
        receiptNumber: rawReceipt,
        transactionId: p.transactionId || `TXN-${p.id || Date.now()}`,
        planName: planTitle,
      },
    });
  };

  const totalCollected = payments.reduce(
    (sum, p) => sum + (p.status === 'Successful' || p.status === 'Paid' ? p.amount : 0),
    0
  );

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID & Receipt',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700 }}>
            <code>{p.transactionId || `TXN-${p.id}`}</code>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.receiptNumber || `RCP-${p.id}`}</div>
        </div>
      ),
    },
    {
      key: 'memberName',
      header: 'Athlete',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600 }}>{p.memberName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.planName || p.description || 'Club Membership'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (p) => <strong style={{ fontSize: '0.95rem' }}>{formatINR(p.amount)}</strong>,
    },
    {
      key: 'method',
      header: 'Simulated Mode',
      sortable: true,
      render: (p) => (
        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <i
            className={
              p.method === 'Card'
                ? 'fa-solid fa-credit-card'
                : p.method === 'UPI'
                ? 'fa-solid fa-mobile-screen-button'
                : p.method === 'Cash'
                ? 'fa-solid fa-money-bill-wave'
                : 'fa-solid fa-building-columns'
            }
          />
          {p.method}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Payment Date',
      sortable: true,
      render: (p) => <span>{formatDate(p.date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <span
          className={`badge ${
            p.status === 'Successful' || p.status === 'Paid'
              ? 'badge-success'
              : p.status === 'Refunded'
              ? 'badge-warning'
              : p.status === 'Pending'
              ? 'badge-secondary'
              : 'badge-danger'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleViewReceipt(p)}
            title="View Receipt"
          >
            <i className="fa-solid fa-receipt" /> Receipt
          </button>
          {p.status === 'Successful' && (
            <PermissionGate permission="payments.refund">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setRefundTargetPayment(p)}
              >
                Refund
              </button>
            </PermissionGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Payments</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Member Payment Processing & Ledger
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Point-of-sale terminal, simulated gateways (Cash, UPI, Card, Transfer), and transaction receipts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}>
            Collected: {formatINR(totalCollected)}
          </div>
          <PermissionGate permission="payments.record">
            <button type="button" className="btn btn-accent" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-credit-card" /> Process Simulated Payment
            </button>
          </PermissionGate>
        </div>
      </div>

      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
        }}
      >
        <i className="fa-solid fa-info-circle text-electric" style={{ marginRight: '0.35rem' }} />
        <strong>Demonstration Notice:</strong> All payment methods (Card, UPI, Cash, Bank Transfer) run in safe client-side simulation. No real credit card or bank credentials are ever captured or processed.
      </div>

      <DataTable
        data={payments}
        columns={columns}
        searchPlaceholder="Search transactions, athletes..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Successful', value: 'Successful' },
          { label: 'Refunded', value: 'Refunded' },
          { label: 'Failed', value: 'Failed' },
        ]}
        exportFilename="ironpulse-payments-ledger"
      />

      {/* Process Simulated Payment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Simulate Member Payment</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleProcessPayment}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Select Athlete *</label>
                  <select className="form-control" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.planName}) &bull; Dues: {formatINR(m.balanceDue || 0)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-control" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                      <option value="Card">Credit / Debit Card (Simulated)</option>
                      <option value="UPI">UPI / Instant QR (Simulated)</option>
                      <option value="Cash">Cash at Reception</option>
                      <option value="Bank Transfer">Bank Wire Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Membership Item / Service</label>
                  <input
                    type="text"
                    className="form-control"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Transaction Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                    />
                    <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Simulate Gateway Failure (Testing)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  <i className="fa-solid fa-check" /> Confirm Simulated Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundTargetPayment && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Issue Refund</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Process simulated refund of <strong>{formatINR(refundTargetPayment.amount)}</strong> for receipt #{refundTargetPayment.receiptNumber || `RCP-${refundTargetPayment.id}`}?
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRefundTargetPayment(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmRefund}>
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {activeReceiptModal && (
        <PrintInvoiceModal
          invoice={activeReceiptModal.invoice}
          payment={activeReceiptModal.payment}
          onClose={() => setActiveReceiptModal(null)}
          initialMode="receipt"
        />
      )}
    </DashboardLayout>
  );
}
