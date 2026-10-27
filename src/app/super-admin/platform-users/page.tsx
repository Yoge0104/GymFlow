'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { toast } from 'sonner';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export default function SuperAdminPlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Support Specialist');
  const [status, setStatus] = useState('active');

  const refreshData = () => {
    setUsers(StorageService.getCollection<PlatformUser>('platformUsers'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Support Specialist');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (u: PlatformUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const payload: PlatformUser = {
      id: editingUser ? editingUser.id : `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      lastLogin: editingUser?.lastLogin || 'Never',
    };

    StorageService.saveItem<PlatformUser>('platformUsers', payload);
    refreshData();
    setModalOpen(false);
    toast.success(editingUser ? `Platform user ${name} updated.` : `Platform user ${name} created.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    StorageService.deleteItem('platformUsers', deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Platform user removed.');
  };

  const columns: Column<PlatformUser>[] = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: (u) => (
        <div>
          <div style={{ fontWeight: 700 }}>{u.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Platform Role',
      sortable: true,
      render: (u) => <span className="badge badge-secondary">{u.role}</span>,
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      sortable: true,
      render: (u) => <span>{u.lastLogin}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {u.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            title="Edit User"
            onClick={() => openEditModal(u)}
          >
            <i className="fa-solid fa-pen-to-square" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline btn-danger"
            title="Delete User"
            onClick={() => setDeleteId(u.id)}
          >
            <i className="fa-solid fa-trash" />
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
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Platform Users</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Internal Staff & DevOps
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            System operators, billing specialists, and helpdesk support personnel.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={openCreateModal}>
            <i className="fa-solid fa-user-plus" /> Add Team Member
          </button>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search staff by name or email..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
        ]}
        exportFilename="gymflow-platform-users"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingUser ? 'Edit Platform Staff' : 'Add Platform Staff'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Internal Role</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="DevOps & Reliability">DevOps & Reliability</option>
                      <option value="Billing Specialist">Billing Specialist</option>
                      <option value="Support Lead">Support Lead</option>
                      <option value="Security Officer">Security Officer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingUser ? 'Save Changes' : 'Create User'}
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
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Remove User</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove this platform user? They will lose administrative access.
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
