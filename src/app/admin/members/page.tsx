'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDate } from '@/lib/formatters';
import { Member, GymMembershipPlan, Branch } from '@/types';
import { toast } from 'sonner';

export default function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('gplan_2');
  const [branchId, setBranchId] = useState('br_1');
  const [balanceDue, setBalanceDue] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Expired' | 'Pending' | 'Frozen' | 'Cancelled'>('Active');

  const refreshData = () => {
    setMembers(DataScopeService.getMembers(user));
    setPlans(StorageService.getCollection<GymMembershipPlan>('gymPlans'));
    setBranches(DataScopeService.getBranches(user));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, [user]);

  const handleOpenEnroll = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setPhone('');
    setPlanId(plans[0]?.id || 'gplan_2');
    setBranchId(branches[0]?.id || 'br_1');
    setBalanceDue(0);
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setPhone(m.phone || '');
    setPlanId(m.planId || plans[0]?.id || 'gplan_2');
    setBranchId(m.branchId || branches[0]?.id || 'br_1');
    setBalanceDue(m.balanceDue || 0);
    setStatus(m.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter athlete name and email.');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];

    const memberToSave: Member = {
      id: editingMember ? editingMember.id : `mem_${Date.now()}`,
      gymId: editingMember ? editingMember.gymId : (user?.gymId || 'gym_1'),
      branchId: branchId || 'br_1',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 10101',
      gender: editingMember ? editingMember.gender : 'Other',
      dob: editingMember ? editingMember.dob : '1995-01-01',
      address: editingMember?.address || 'Plot 12, Link Road, Mumbai',
      emergencyContact: editingMember?.emergencyContact || '+91 98765 99999',
      planId,
      planName: selectedPlan?.name || 'Annual VIP All-Access',
      startDate: editingMember ? editingMember.startDate : new Date().toISOString().split('T')[0],
      endDate: editingMember ? editingMember.endDate : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status,
      balanceDue: Number(balanceDue),
      avatar: editingMember?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      totalVisits: editingMember ? editingMember.totalVisits : 0,
      streakDays: editingMember ? editingMember.streakDays : 0,
      weight: editingMember?.weight || 75,
      targetWeight: editingMember?.targetWeight || 72,
    };

    StorageService.saveItem<Member>('members', memberToSave);
    refreshData();
    setModalOpen(false);
    toast.success(editingMember ? `Athlete ${name} record updated!` : `Athlete ${name} enrolled successfully!`);
  };

  const handleToggleFreeze = (m: Member) => {
    const nextStatus = m.status === 'Active' ? 'Frozen' : 'Active';
    m.status = nextStatus as any;
    StorageService.saveItem('members', m);
    refreshData();
    toast.success(`Member status set to ${nextStatus}.`);
  };

  const handleDelete = (id: string, memberName: string) => {
    if (confirm(`Permanently cancel and remove athlete record for "${memberName}"?\nThis action will update member rosters.`)) {
      StorageService.deleteItem('members', id);
      refreshData();
      toast.success(`Member "${memberName}" removed.`);
    }
  };

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Athlete Name',
      sortable: true,
      render: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="avatar avatar-sm">
            <img src={m.avatar} alt={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{m.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Membership Plan',
      sortable: true,
      render: (m) => <span className="badge badge-secondary">{m.planName}</span>,
    },
    {
      key: 'endDate',
      header: 'Expiry Date',
      sortable: true,
      render: (m) => <span>{formatDate(m.endDate)}</span>,
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      sortable: true,
      render: (m) => (
        <span style={{ fontWeight: 700, color: m.balanceDue > 0 ? 'var(--color-danger)' : 'var(--color-success-text)' }}>
          {formatINR(m.balanceDue || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => (
        <span
          className={`badge ${
            m.status === 'Active'
              ? 'badge-success'
              : m.status === 'Frozen'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {m.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Link
            href="/admin/member-details"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            360 File
          </Link>
          <PermissionGate permission="members.update">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleOpenEdit(m)}
              title="Edit athlete record"
            >
              <i className="fa-solid fa-pen" /> Edit
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleToggleFreeze(m)}
            >
              {m.status === 'Active' ? 'Freeze' : 'Unfreeze'}
            </button>
          </PermissionGate>
          <PermissionGate permission="members.delete">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDelete(m.id, m.name)}
              title="Delete athlete record"
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Members</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Athletes & Member Roster
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Directory of enrolled members, membership statuses, outstanding fees, and biometric profiles.
          </p>
        </div>
        <div>
          <PermissionGate permission="members.create">
            <button type="button" className="btn btn-accent" onClick={handleOpenEnroll}>
              <i className="fa-solid fa-user-plus" /> Enroll New Athlete
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={members}
        columns={columns}
        searchPlaceholder="Search members by name, email..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'Frozen', value: 'Frozen' },
          { label: 'Expired', value: 'Expired' },
          { label: 'Pending', value: 'Pending' },
        ]}
        exportFilename="ironpulse-members"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingMember ? `Edit Athlete: ${editingMember.name}` : 'Enroll New Athlete'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
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
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 10101"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Membership Plan</label>
                    <select className="form-control" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.price, { showDecimals: false })})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Home Branch</label>
                    <select className="form-control" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Balance Due (INR ₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={balanceDue}
                      min="0"
                      onChange={(e) => setBalanceDue(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                      <option value="Active">Active</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Expired">Expired</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingMember ? 'Save Changes' : 'Enroll Athlete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
