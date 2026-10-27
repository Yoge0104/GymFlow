// ===================================================================
// GymFlow — Simulated Payment Processing & Invoice Management
// ===================================================================

import { Invoice, PaymentRecord, Member } from '@/types';
import { StorageService } from './StorageService';
import { NotificationService } from './NotificationService';
import { formatINR } from '@/lib/formatters';

export const PaymentService = {
  getAll(): PaymentRecord[] {
    return StorageService.getCollection<PaymentRecord>('payments');
  },

  getByMember(memberId: string): PaymentRecord[] {
    return this.getAll().filter((p) => p.memberId === memberId);
  },

  getByGym(gymId: string): PaymentRecord[] {
    return this.getAll().filter((p) => p.gymId === gymId);
  },

  simulatePayment(params: {
    gymId: string;
    memberId: string;
    memberName: string;
    memberEmail?: string;
    planName: string;
    amount: number;
    subtotal?: number;
    discountAmount?: number;
    taxAmount?: number;
    couponCode?: string;
    method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    invoiceId?: string;
    simulateFailure?: boolean;
    notes?: string;
  }): { success: boolean; payment: PaymentRecord; message: string } {
    const isSuccess = !params.simulateFailure;
    const dateStr = new Date().toISOString().split('T')[0];
    const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      transactionId: txnId,
      invoiceId: params.invoiceId,
      gymId: params.gymId,
      memberId: params.memberId,
      memberName: params.memberName,
      memberEmail: params.memberEmail,
      planName: params.planName,
      amount: params.amount,
      subtotal: params.subtotal,
      discountAmount: params.discountAmount,
      taxAmount: params.taxAmount,
      couponCode: params.couponCode,
      date: dateStr,
      method: params.method,
      status: isSuccess ? 'Successful' : 'Failed',
      receiptNumber: receiptNo,
      notes: params.notes || 'Simulated transaction in demo mode',
    };

    StorageService.saveItem<PaymentRecord>('payments', payment);

    if (isSuccess) {
      // If payment is linked to an invoice, update invoice
      if (params.invoiceId) {
        InvoiceService.recordPaymentOnInvoice(params.invoiceId, payment);
      }

      // Update member payment record & balance
      const member = StorageService.getItemById<Member>('members', params.memberId);
      if (member) {
        member.balanceDue = Math.max(0, (member.balanceDue || 0) - params.amount);
        StorageService.saveItem('members', member);
      }

      // Trigger notification
      NotificationService.notify({
        gymId: params.gymId,
        targetUserId: params.memberId,
        targetRole: 'MEMBER',
        category: 'payments',
        title: 'Payment Successful',
        message: `Your payment of ${formatINR(params.amount)} (${params.method}) was processed successfully. Receipt #${receiptNo}.`,
        linkUrl: '/member/payments',
        dedupKey: `pay_${txnId}`,
      });

      NotificationService.notify({
        gymId: params.gymId,
        targetRole: 'GYM_ADMIN',
        category: 'payments',
        title: 'Payment Recorded',
        message: `Payment of ${formatINR(params.amount)} received from ${params.memberName} via ${params.method}.`,
        linkUrl: '/admin/invoices',
        dedupKey: `adm_pay_${txnId}`,
      });

      return {
        success: true,
        payment,
        message: `Simulated payment of ${formatINR(params.amount)} via ${params.method} succeeded!`,
      };
    } else {
      NotificationService.notify({
        gymId: params.gymId,
        targetUserId: params.memberId,
        targetRole: 'MEMBER',
        category: 'payments',
        title: 'Payment Failed',
        message: `Simulated payment of ${formatINR(params.amount)} failed. Please try again.`,
        linkUrl: '/member/payments',
      });

      return {
        success: false,
        payment,
        message: 'Simulated payment failure (simulation mode). No funds deducted.',
      };
    }
  },

  simulateRefund(paymentId: string): boolean {
    const payment = StorageService.getItemById<PaymentRecord>('payments', paymentId);
    if (!payment || payment.status === 'Refunded') return false;

    payment.status = 'Refunded';
    StorageService.saveItem('payments', payment);

    NotificationService.notify({
      gymId: payment.gymId,
      targetUserId: payment.memberId,
      targetRole: 'MEMBER',
      category: 'payments',
      title: 'Refund Processed',
      message: `A simulated refund of ${formatINR(payment.amount)} has been recorded for Transaction #${payment.transactionId}.`,
      linkUrl: '/member/payments',
    });

    return true;
  },
};

export const InvoiceService = {
  getAll(): Invoice[] {
    return StorageService.getCollection<Invoice>('invoices');
  },

  getById(id: string): Invoice | null {
    return StorageService.getItemById<Invoice>('invoices', id);
  },

  getByGym(gymId: string): Invoice[] {
    return this.getAll().filter((i) => i.gymId === gymId);
  },

  getByMember(memberId: string): Invoice[] {
    return this.getAll().filter((i) => i.memberId === memberId);
  },

  save(invoice: Partial<Invoice>): Invoice {
    const existing = invoice.id ? this.getById(invoice.id) : null;
    const subtotal = invoice.subtotal ?? (invoice.items ? invoice.items.reduce((s, it) => s + it.total, 0) : 0);
    const discountAmount = invoice.discountAmount ?? 0;
    const taxRate = invoice.taxRate ?? 8;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = invoice.taxAmount ?? Math.round(taxable * (taxRate / 100) * 100) / 100;
    const total = invoice.total ?? Math.round((taxable + taxAmount) * 100) / 100;
    const paidAmount = invoice.paidAmount ?? (existing?.paidAmount || 0);
    const balanceDue = Math.max(0, Math.round((total - paidAmount) * 100) / 100);

    let status = invoice.status;
    if (!status) {
      if (balanceDue === 0 && total > 0) status = 'Paid';
      else if (paidAmount > 0 && balanceDue > 0) status = 'Partially Paid';
      else status = 'Unpaid';
    }

    const full: Invoice = {
      id: invoice.id || `inv_${Date.now()}`,
      invoiceNumber: invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      gymId: invoice.gymId || 'gym_1',
      gymName: invoice.gymName || 'IronPulse Fitness Club',
      gymAddress: invoice.gymAddress || '742 Evergreen Terrace, Austin, TX',
      gymPhone: invoice.gymPhone || '+1 (555) 234-5678',
      gymEmail: invoice.gymEmail || 'billing@ironpulse.com',
      memberId: invoice.memberId || 'mem_101',
      memberName: invoice.memberName || 'Alex Morgan',
      memberEmail: invoice.memberEmail || 'alex.morgan@example.com',
      memberPhone: invoice.memberPhone,
      memberAddress: invoice.memberAddress,
      planId: invoice.planId,
      planName: invoice.planName,
      issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: invoice.items || [
        {
          id: 'item_1',
          description: invoice.planName ? `${invoice.planName} Membership` : 'Membership Assessment',
          quantity: 1,
          unitPrice: subtotal,
          total: subtotal,
        },
      ],
      subtotal,
      discountAmount,
      couponCode: invoice.couponCode,
      taxRate,
      taxAmount,
      total,
      paidAmount,
      balanceDue,
      status,
      paymentMethod: invoice.paymentMethod,
      paymentTransactionIds: invoice.paymentTransactionIds || [],
      notes: invoice.notes || 'Demo invoice generated for preview purposes.',
      terms: invoice.terms || 'Payment due upon receipt. No cash refunds.',
      createdAt: invoice.createdAt || new Date().toISOString(),
    };

    const saved = StorageService.saveItem<Invoice>('invoices', full);

    NotificationService.notify({
      gymId: full.gymId,
      targetUserId: full.memberId,
      targetRole: 'MEMBER',
      category: 'billing',
      title: 'New Invoice Issued',
      message: `Invoice #${full.invoiceNumber} for ${formatINR(full.total)} has been generated.`,
      linkUrl: '/member/payments',
      dedupKey: `inv_${full.id}`,
    });

    return saved;
  },

  recordPaymentOnInvoice(invoiceId: string, payment: PaymentRecord): Invoice | null {
    const invoice = this.getById(invoiceId);
    if (!invoice) return null;
    if (invoice.status === 'Cancelled') {
      console.warn('Cannot apply payment to a cancelled invoice.');
      return invoice;
    }

    invoice.paidAmount = Math.round(((invoice.paidAmount || 0) + payment.amount) * 100) / 100;
    invoice.balanceDue = Math.max(0, Math.round((invoice.total - invoice.paidAmount) * 100) / 100);

    if (invoice.balanceDue === 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }

    invoice.paymentMethod = payment.method;
    if (!invoice.paymentTransactionIds) invoice.paymentTransactionIds = [];
    invoice.paymentTransactionIds.push(payment.transactionId || `TXN-${payment.id}`);

    return StorageService.saveItem<Invoice>('invoices', invoice);
  },

  cancelInvoice(invoiceId: string): boolean {
    const invoice = this.getById(invoiceId);
    if (!invoice) return false;
    invoice.status = 'Cancelled';
    StorageService.saveItem('invoices', invoice);
    return true;
  },

  duplicate(invoiceId: string): Invoice | null {
    const existing = this.getById(invoiceId);
    if (!existing) return null;
    const duplicated: Partial<Invoice> = {
      ...existing,
      id: undefined,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      status: 'Draft',
      paidAmount: 0,
      balanceDue: existing.total,
      paymentTransactionIds: [],
      createdAt: new Date().toISOString(),
    };
    return this.save(duplicated);
  },
};
