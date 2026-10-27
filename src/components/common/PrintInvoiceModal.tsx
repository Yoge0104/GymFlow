'use client';

import React, { useState } from 'react';
import { Invoice, PaymentRecord } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';

interface PrintInvoiceModalProps {
  invoice: Invoice;
  payment?: PaymentRecord | null;
  onClose: () => void;
  initialMode?: 'invoice' | 'receipt';
}

export function PrintInvoiceModal({
  invoice,
  payment,
  onClose,
  initialMode = 'invoice',
}: PrintInvoiceModalProps) {
  const [mode, setMode] = useState<'invoice' | 'receipt'>(initialMode);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNumber = () => {
    const textToCopy = mode === 'invoice' ? invoice.invoiceNumber : payment?.receiptNumber || invoice.invoiceNumber;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div
        className="modal modal-lg active"
        style={{
          width: '90%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header (Hidden during print) */}
        <div className="modal-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <h3 className="modal-title" style={{ margin: 0 }}>
              {mode === 'invoice' ? `Official Invoice — ${invoice.invoiceNumber}` : `Payment Receipt — ${payment?.receiptNumber || 'RCP-DEMO'}`}
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'invoice' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={() => setMode('invoice')}
              >
                Invoice View
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'receipt' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={() => setMode('receipt')}
              >
                Receipt View
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyNumber}
              title="Copy identifier"
            >
              <i className="fa-solid fa-copy" /> {copied ? 'Copied!' : 'Copy #'}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <i className="fa-solid fa-print" /> Print / Save PDF
            </button>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Body / Print Container */}
        <div
          className="modal-body print-document-container"
          style={{
            overflowY: 'auto',
            padding: '2rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
          }}
        >
          {/* Watermark Label */}
          <div
            style={{
              padding: '0.45rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px dashed var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              color: 'var(--color-danger)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem',
            }}
          >
            DEMO {mode === 'invoice' ? 'INVOICE' : 'PAYMENT RECEIPT'} — NOT A REAL FINANCIAL DOCUMENT • SIMULATED INVOICING ENGINE
          </div>

          {/* Document Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #059669 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2rem',
                  }}
                >
                  <i className="fa-solid fa-dumbbell" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                    {invoice.gymName}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Multi-Branch Fitness Club
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {invoice.gymAddress}<br />
                Phone: {invoice.gymPhone} | Email: {invoice.gymEmail}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: mode === 'invoice' ? 'var(--color-primary)' : 'var(--color-accent)',
                  letterSpacing: '0.05em',
                }}
              >
                {mode === 'invoice' ? 'INVOICE' : 'RECEIPT'}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}>
                #{mode === 'invoice' ? invoice.invoiceNumber : payment?.receiptNumber || 'RCP-SIMULATED'}
              </div>
              <div style={{ marginTop: '0.45rem' }}>
                <span
                  className={`badge ${
                    invoice.status === 'Paid'
                      ? 'badge-success'
                      : invoice.status === 'Overdue'
                      ? 'badge-danger'
                      : invoice.status === 'Partially Paid'
                      ? 'badge-warning'
                      : 'badge-secondary'
                  }`}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '1.75rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
                Billed To:
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                {invoice.memberName}
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Email: {invoice.memberEmail}<br />
                {invoice.memberPhone && <>Phone: {invoice.memberPhone}<br /></>}
                {invoice.memberAddress && <>Address: {invoice.memberAddress}</>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
                <strong>{formatDate(invoice.issueDate)}</strong>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
                <strong>{formatDate(invoice.dueDate)}</strong>
              </div>
              {invoice.paymentMethod && (
                <div style={{ marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode: </span>
                  <strong>{invoice.paymentMethod} (Simulated)</strong>
                </div>
              )}
              {payment && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction Ref: </span>
                  <code style={{ fontSize: '0.8rem' }}>{payment.transactionId}</code>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table with Sr. No. */}
          <table
            className="table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                <th style={{ padding: '0.75rem', width: '60px', textAlign: 'center' }}>Sr. No.</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item & Description</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Qty</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', width: '130px' }}>Unit Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', width: '130px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color-subtle)' }}>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatINR(item.unitPrice)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatINR(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '300px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <strong>{formatINR(invoice.subtotal)}</strong>
              </div>

              {invoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: 'var(--color-accent)' }}>
                  <span>
                    Discount {invoice.couponCode && `(${invoice.couponCode})`}:
                  </span>
                  <strong>-{formatINR(invoice.discountAmount)}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST ({invoice.taxRate}%):</span>
                <span>{formatINR(invoice.taxAmount)}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderTop: '2px solid var(--border-color)',
                  borderBottom: '2px solid var(--border-color)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginTop: '0.4rem',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--color-accent)' }}>{formatINR(invoice.total)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', marginTop: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <strong style={{ color: 'var(--color-success-text)' }}>{formatINR(invoice.paidAmount)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Balance Due:</span>
                <strong style={{ color: invoice.balanceDue > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                  {formatINR(invoice.balanceDue)}
                </strong>
              </div>
            </div>
          </div>

          {/* Notes & Terms Footer */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {invoice.notes && (
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong>Notes:</strong> {invoice.notes}
              </p>
            )}
            {invoice.terms && (
              <p style={{ margin: 0 }}>
                <strong>Terms:</strong> {invoice.terms}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
