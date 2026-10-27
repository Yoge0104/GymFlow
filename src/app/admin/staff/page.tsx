'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  branch: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Front Desk Receptionist');
  const [phone, setPhone] = useState('+91 98765 22334');
  const [branch, setBranch] = useState('Downtown Flagship');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const refreshData = () => {
    setStaff(StorageService.getCollection<StaffMember>('staff'));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setRole('Front Desk Receptionist');
    setPhone('+91 98765 22334');
    setBranch('Downtown Flagship');
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);
    setPhone(s.phone);
    setBranch(s.branch);
    setStatus(s.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    const memberToSave: StaffMember = {
      id: editingStaff ? editingStaff.id : `stf_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      phone: phone.trim() || '+91 98765 22334',
      branch,
      status,
      joinedDate: editingStaff ? editingStaff.joinedDate : new Date().toISOString().split('T')[0],
    };

    StorageService.saveItem<StaffMember>('staff', memberToSave);
    refreshData();
    setModalOpen(false);
    toast.success(editingStaff ? `Staff account "${name}" updated.` : `Staff account "${name}" created.`);
  };

  const handleDelete = (s: StaffMember) => {
    if (confirm(`Remove staff member "${s.name}"?`)) {
      StorageService.deleteItem('staff', s.id);
      refreshData();
      toast.success(`Staff "${s.name}" removed.`);
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      render: (s) => (
        <div>
          <div style={{ fontWeight: 700 }}>{s.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Club Position',
      sortable: true,
      render: (s) => <span className="badge badge-secondary">{s.role}</span>,
    },
    {
      key: 'branch',
      header: 'Branch Assignment',
      sortable: true,
      render: (s) => <span>{s.branch}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (s) => <span>{s.phone}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => (
        <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
          {s.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="staff.manage">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleOpenEdit(s)}
            >
              <i className="fa-solid fa-pen" /> Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDelete(s)}
              title="Delete staff account"
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Staff Accounts</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Club Staff & Operational Crew
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Front desk receptionists, technicians, club managers, and accountants.
          </p>
        </div>
        <div>
          <PermissionGate permission="staff.manage">
            <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
              <i className="fa-solid fa-user-plus" /> Invite Staff Member
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search staff by name, role..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        exportFilename="ironpulse-staff-roster"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add Staff Account'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Club Position</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="Front Desk Receptionist">Front Desk Receptionist</option>
                      <option value="Club Accountant">Club Accountant</option>
                      <option value="Operations Assistant">Operations Assistant</option>
                      <option value="Branch Manager">Branch Manager</option>
                      <option value="Maintenance Lead">Maintenance Lead</option>
                    </select>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Branch Assignment</label>
                    <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                      <option value="Downtown Flagship">Downtown Flagship</option>
                      <option value="Northside Club">Northside Club</option>
                      <option value="All Locations">All Locations</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingStaff ? 'Save Changes' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
