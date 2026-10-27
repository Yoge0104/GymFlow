'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { formatNumber } from '@/lib/formatters';
import { Branch } from '@/types';
import { toast } from 'sonner';

export default function AdminBranches() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai, MH');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [managerName, setManagerName] = useState('');
  const [capacity, setCapacity] = useState(250);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const refreshData = () => {
    setBranches(DataScopeService.getBranches(user));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setName('');
    setCode(`BR-${Math.floor(Math.random() * 900 + 100)}`);
    setAddress('');
    setCity('Mumbai, Maharashtra');
    setPhone('+91 98765 43210');
    setManagerName('');
    setCapacity(250);
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name || '');
    setCode(branch.code || branch.id.toUpperCase());
    setAddress(branch.address || '');
    setCity(branch.city || '');
    setPhone(branch.phone || '');
    setManagerName(branch.managerName || (branch as any).manager || '');
    setCapacity(branch.capacity || 250);
    setStatus(branch.status || 'active');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const n = (name || '').trim();
    const c = (code || '').trim().toUpperCase();
    if (!n || !c) {
      toast.error('Branch Name and Code are required.');
      return;
    }

    const branchToSave: Branch = {
      id: editingBranch ? editingBranch.id : `br_${Date.now()}`,
      gymId: editingBranch ? editingBranch.gymId : (user?.gymId || 'gym_1'),
      name: n,
      code: c,
      address: (address || '').trim() || 'Plot 10, MG Road',
      city: (city || '').trim() || 'Mumbai, Maharashtra',
      phone: (phone || '').trim() || '+91 98765 43210',
      managerName: (managerName || '').trim() || 'Front Desk Team',
      capacity: Number(capacity) || 100,
      activeMembers: editingBranch ? (editingBranch.activeMembers || 0) : 0,
      status: status || 'active',
      openingHours: editingBranch?.openingHours || 'Mon - Sun: 5:00 AM - 11:00 PM',
    };

    StorageService.saveItem<Branch>('branches', branchToSave);
    refreshData();
    setModalOpen(false);
    toast.success(editingBranch ? `Branch "${name}" updated.` : `Branch "${name}" created.`);
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(`Are you sure you want to delete branch "${branch.name}"?`)) {
      StorageService.deleteItem('branches', branch.id);
      refreshData();
      toast.success(`Branch "${branch.name}" removed.`);
    }
  };

  const columns: Column<Branch>[] = [
    {
      key: 'name',
      header: 'Branch Location',
      sortable: true,
      render: (b) => (
        <div>
          <div style={{ fontWeight: 700 }}>{b.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.address}, {b.city}</div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Branch Code',
      sortable: true,
      render: (b) => <code>{b.code || b.id.toUpperCase()}</code>,
    },
    {
      key: 'managerName',
      header: 'Manager',
      sortable: true,
      render: (b) => <span>{b.managerName || (b as any).manager || 'Front Desk Team'}</span>,
    },
    {
      key: 'phone',
      header: 'Contact',
      sortable: true,
      render: (b) => <span>{b.phone}</span>,
    },
    {
      key: 'activeMembers',
      header: 'Athletes / Capacity',
      sortable: true,
      render: (b) => (
        <span>
          {formatNumber(b.activeMembers ?? (b as any).memberCount ?? 0)} / {formatNumber(b.capacity || 250)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (b) => (
        <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
          {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="branches.manage">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleOpenEdit(b)}
            >
              <i className="fa-solid fa-pen" /> Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDelete(b)}
              title="Delete branch"
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Branches</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Club Network Branches
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Manage locations, capacity allocations, opening hours, and branch managers.
          </p>
        </div>
        <div>
          <PermissionGate permission="branches.manage">
            <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
              <i className="fa-solid fa-plus" /> Add Branch
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={branches}
        columns={columns}
        searchPlaceholder="Search branches..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        exportFilename="gymflow-branches"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add Club Branch'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Branch Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bandra West Club"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BR-BW"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 104 Linking Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City, State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Branch Manager Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Jordan Miller"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Operational Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
