'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { InvoiceService } from '@/services/PaymentService';
import { PaymentService } from '@/services/PaymentService';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { PrintInvoiceModal } from '@/components/common/PrintInvoiceModal';
import { Invoice, Member } from '@/types';
import { formatINR, formatDate, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [isPartialPaymentOpen, setPartialPaymentOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);
  const [cancelTargetInvoice, setCancelTargetInvoice] = useState<Invoice | null>(null);

  // Partial Payment State
  const [payAmount, setPayAmount] = useState(2500);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Card');

  // Create Invoice State
  const [memberId, setMemberId] = useState('mem_101');
  const [description, setDescription] = useState('Quarterly VIP All-Access Membership');
  const [unitPrice, setUnitPrice] = useState(6499);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

  const refreshData = () => {
    setInvoices(DataScopeService.getInvoices(user));
    setMembers(DataScopeService.getMembers(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === memberId) || members[0];
    if (!targetMember) return;

    const subtotal = Number(unitPrice);
    const discount = Number(discountAmount);
    const taxable = Math.max(0, subtotal - discount);
    const taxRate = 18; // 18% GST standard
    const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
    const total = Math.round((taxable + taxAmount) * 100) / 100;

    const newInvoice: Partial<Invoice> = {
      gymId: 'gym_1',
      gymName: 'IronPulse Fitness Club',
      gymAddress: 'MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      gymPhone: '+91 80 4123 4567',
      gymEmail: 'billing@ironpulse.in',
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberEmail: targetMember.email,
      planName: targetMember.planName,
      items: [
        {
          id: `item_${Date.now()}`,
          description,
          quantity: 1,
          unitPrice: subtotal,
          discountAmount: discount,
          taxRate,
          total: taxable,
        },
      ],
      subtotal,
      discountAmount: discount,
      taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      balanceDue: total,
      status: 'Unpaid',
      dueDate,
    };

    InvoiceService.save(newInvoice);
    refreshData();
    setCreateModalOpen(false);
    toast.success('Invoice created and issued to athlete.');
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetInvoice) return;

    if (paymentTargetInvoice.status === 'Cancelled') {
      toast.error('Cancelled invoices cannot receive new payments.');
      return;
    }

    const payVal = Number(payAmount);
    if (payVal <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    const res = PaymentService.simulatePayment({
      gymId: paymentTargetInvoice.gymId,
      memberId: paymentTargetInvoice.memberId,
      memberName: paymentTargetInvoice.memberName,
      memberEmail: paymentTargetInvoice.memberEmail,
      planName: paymentTargetInvoice.planName || 'Membership Charge',
      amount: payVal,
      method: payMethod,
      invoiceId: paymentTargetInvoice.id,
      notes: `Simulated installment against Invoice #${paymentTargetInvoice.invoiceNumber}`,
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }

    refreshData();
    setPartialPaymentOpen(false);
    setPaymentTargetInvoice(null);
  };

  const handleDuplicate = (inv: Invoice) => {
    InvoiceService.duplicate(inv.id);
    refreshData();
    toast.success(`Invoice duplicated as draft.`);
  };

  const confirmCancelInvoice = () => {
    if (!cancelTargetInvoice) return;
    InvoiceService.cancelInvoice(cancelTargetInvoice.id);
    refreshData();
    toast.info(`Invoice ${cancelTargetInvoice.invoiceNumber} cancelled.`);
    setCancelTargetInvoice(null);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => (
        <div>
          <strong style={{ fontSize: '0.9rem' }}>{inv.invoiceNumber}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {formatDate(inv.dueDate)}</div>
        </div>
      ),
    },
    {
      key: 'memberName',
      header: 'Billed Athlete',
      sortable: true,
      render: (inv) => (
        <div>
          <div style={{ fontWeight: 600 }}>{inv.memberName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.memberEmail}</div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total / Balance',
      sortable: true,
      render: (inv) => (
        <div>
          <div><strong>{formatINR(inv.total)}</strong></div>
          <div style={{ fontSize: '0.75rem', color: inv.balanceDue > 0 ? 'var(--color-danger)' : 'var(--color-success-text)' }}>
            Due: {formatINR(inv.balanceDue)} (Paid: {formatINR(inv.paidAmount)})
          </div>
        </div>
      ),
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
              : inv.status === 'Overdue'
              ? 'badge-danger'
              : inv.status === 'Cancelled'
              ? 'badge-secondary'
              : 'badge-primary'
          }`}
        >
          {inv.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => setActivePrintInvoice(inv)}
            title="View & Print Invoice or Receipt"
          >
            <i className="fa-solid fa-print" /> Print / View
          </button>

          {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
            <PermissionGate permission="payments.record">
              <button
                type="button"
                className="btn btn-accent btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => {
                  setPaymentTargetInvoice(inv);
                  setPayAmount(inv.balanceDue);
                  setPartialPaymentOpen(true);
                }}
              >
                Pay Dues
              </button>
            </PermissionGate>
          )}

          <PermissionGate permission="invoices.create">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDuplicate(inv)}
              title="Duplicate as draft"
            >
              <i className="fa-solid fa-clone" />
            </button>
          </PermissionGate>

          {inv.status !== 'Cancelled' && (
            <PermissionGate permission="invoices.manage">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                onClick={() => setCancelTargetInvoice(inv)}
                title="Cancel Invoice"
              >
                <i className="fa-solid fa-ban" />
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Invoices</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Formal Invoice Management & Printing
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Itemized dues, partial payments, simulated settlements, and print-ready invoices & receipts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <PermissionGate permission="invoices.create">
            <button type="button" className="btn btn-accent" onClick={() => setCreateModalOpen(true)}>
              <i className="fa-solid fa-plus" /> Generate Invoice
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
        <i className="fa-solid fa-print text-accent" style={{ marginRight: '0.35rem' }} />
        <strong>Print & PDF Engine:</strong> Click &quot;Print / View&quot; on any invoice to open the clean A4 print preview. Use browser print (`Ctrl+P` / `Cmd+P`) to print without navbars or save as clean PDF.
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices by invoice #, athlete..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Paid', value: 'Paid' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Unpaid', value: 'Unpaid' },
          { label: 'Overdue', value: 'Overdue' },
          { label: 'Draft', value: 'Draft' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        exportFilename="ironpulse-invoices"
      />

      {/* Print / View Modal */}
      {activePrintInvoice && (
        <PrintInvoiceModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '540px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Generate Member Invoice</h3>
              <button type="button" className="modal-close" onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Athlete *</label>
                  <select className="form-control" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Item Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Unit Price (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      className="form-control"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Applied (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-control"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial / Full Settlement Modal */}
      {isPartialPaymentOpen && paymentTargetInvoice && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                Record Payment for #{paymentTargetInvoice.invoiceNumber}
              </h3>
              <button type="button" className="modal-close" onClick={() => setPartialPaymentOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSimulatePayment}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Athlete:</span>
                    <strong>{paymentTargetInvoice.memberName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Invoice:</span>
                    <span>{formatINR(paymentTargetInvoice.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-danger)' }}>Remaining Balance:</span>
                    <span style={{ color: 'var(--color-danger)' }}>{formatINR(paymentTargetInvoice.balanceDue)}</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    className="form-control"
                    max={paymentTargetInvoice.balanceDue}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Enter any amount up to {formatINR(paymentTargetInvoice.balanceDue)} for partial payments.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-control" value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)}>
                    <option value="Card">Credit / Debit Card (Simulated)</option>
                    <option value="UPI">UPI / QR (Simulated)</option>
                    <option value="Cash">Cash at Reception</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPartialPaymentOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  <i className="fa-solid fa-check" /> Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Invoice Confirmation Modal */}
      {cancelTargetInvoice && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Cancel Invoice</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Cancel invoice <strong>{cancelTargetInvoice.invoiceNumber}</strong>? Cancelled invoices cannot receive payments, but remain in the ledger for financial audit trails.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCancelTargetInvoice(null)}>
                Keep Invoice
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmCancelInvoice}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
