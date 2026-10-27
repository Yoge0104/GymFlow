'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { Expense } from '@/types';
import { formatINR, formatDate, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [category, setCategory] = useState<Expense['category']>('Facility Rent');
  const [vendorName, setVendorName] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Scheduled'>('Paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const refreshData = () => {
    setExpenses(DataScopeService.getExpenses(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const openCreateModal = () => {
    setEditingExpense(null);
    setDescription('');
    setAmount(1500);
    setCategory('Facility Rent');
    setVendorName('');
    setStatus('Paid');
    setDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);
    setVendorName(exp.vendorName || '');
    setStatus(exp.status);
    setDate(exp.date);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) {
      toast.error('Please provide a valid description and amount greater than 0.');
      return;
    }

    const payload: Expense = {
      id: editingExpense ? editingExpense.id : `exp_${Date.now()}`,
      gymId: editingExpense?.gymId || user?.gymId || 'gym_1',
      category,
      description: description.trim(),
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: editingExpense?.paymentMethod || 'Bank Wire',
      vendorName: vendorName.trim() || 'Club Supplier',
      status,
    };

    StorageService.saveItem<Expense>('expenses', payload);
    refreshData();
    setModalOpen(false);
    toast.success(editingExpense ? 'Expense updated successfully.' : 'Expense recorded in ledger.');
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    StorageService.deleteItem('expenses', deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Expense record removed.');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const columns: Column<Expense>[] = [
    {
      key: 'description',
      header: 'Expense Item',
      sortable: true,
      render: (e) => (
        <div>
          <div style={{ fontWeight: 700 }}>{e.description}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor: {e.vendorName}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (e) => <span className="badge badge-secondary">{e.category}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (e) => <strong>{formatINR(e.amount)}</strong>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (e) => <span>{formatDate(e.date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => {
        const cls = e.status === 'Paid' ? 'badge-success' : e.status === 'Pending' ? 'badge-warning' : 'badge-info';
        return <span className={`badge ${cls}`}>{e.status}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (e) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="expenses.manage">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              title="Edit Expense"
              onClick={() => openEditModal(e)}
            >
              <i className="fa-solid fa-pen-to-square" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-danger"
              title="Delete Expense"
              onClick={() => setDeleteId(e.id)}
            >
              <i className="fa-solid fa-trash" />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Expenses</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Operational Expenditure Ledger
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Facility rent, staff payroll, utilities, vendor leases, and floor maintenance costs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}>
            Total Expenses: {formatINR(totalExpenses)}
          </div>
          <PermissionGate permission="expenses.manage">
            <button type="button" className="btn btn-accent" onClick={openCreateModal}>
              <i className="fa-solid fa-plus" /> Record Expense
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        searchPlaceholder="Search expenses..."
        statusFilterKey="category"
        statusOptions={[
          { label: 'Facility Rent', value: 'Facility Rent' },
          { label: 'Equipment Leasing', value: 'Equipment Leasing' },
          { label: 'Utilities', value: 'Utilities' },
          { label: 'Staff Payroll', value: 'Staff Payroll' },
          { label: 'Maintenance', value: 'Maintenance' },
          { label: 'Marketing', value: 'Marketing' },
        ]}
        exportFilename="ironpulse-expenses"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingExpense ? 'Edit Operational Expense' : 'Record Operational Expense'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Expense Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Monthly Commercial Utilities"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
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
                    <label className="form-label">Category</label>
                    <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                      <option value="Facility Rent">Facility Rent</option>
                      <option value="Equipment Leasing">Equipment Leasing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Staff Payroll">Staff Payroll</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Vendor / Payee</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Tata Power Co."
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Transaction Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Expense Record</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove this operational expense from the ledger? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
