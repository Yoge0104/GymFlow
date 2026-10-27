'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { formatINR, formatNumber, formatDate } from '@/lib/formatters';
import { Gym, SaasPlan } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminGyms() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [planId, setPlanId] = useState('saas_growth');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended' | 'trial'>('active');

  const refreshData = () => {
    setGyms(StorageService.getCollection<Gym>('gyms'));
    setPlans(StorageService.getCollection<SaasPlan>('saasPlans'));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, []);

  const handleOpenCreate = () => {
    setEditingGym(null);
    setName('');
    setOwnerName('');
    setEmail('');
    setPhone('');
    setCity('');
    setPlanId('saas_growth');
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEdit = (gym: Gym) => {
    setEditingGym(gym);
    setName(gym.name);
    setOwnerName(gym.ownerName || (gym as any).owner || '');
    setEmail(gym.ownerEmail || (gym as any).email || '');
    setPhone(gym.ownerPhone || '');
    setCity(gym.city || '');
    setPlanId(gym.planId || 'saas_growth');
    setStatus(gym.status);
    setModalOpen(true);
  };

  const handleToggleStatus = (gym: Gym) => {
    const nextStatus = gym.status === 'active' ? 'suspended' : 'active';
    gym.status = nextStatus;
    StorageService.saveItem('gyms', gym);
    refreshData();
    toast.success(`Gym organization "${gym.name}" is now ${nextStatus}.`);
  };

  const handleDeleteGym = (gym: Gym) => {
    if (confirm(`Are you sure you want to delete or deactivate gym organization "${gym.name}"?\nThis action will update tenant records.`)) {
      StorageService.deleteItem('gyms', gym.id);
      refreshData();
      toast.success(`Gym organization "${gym.name}" removed.`);
    }
  };

  const handleSaveGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !email.trim()) {
      toast.error('Please enter Organization Name, Owner Name, and Email.');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];

    const gymToSave: Gym = {
      id: editingGym ? editingGym.id : `gym_${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerName: ownerName.trim(),
      ownerEmail: email.trim(),
      ownerPhone: phone || '+91 98765 43210',
      planId,
      planName: selectedPlan?.name || 'Growth',
      status,
      branchesCount: editingGym ? editingGym.branchesCount : 1,
      membersCount: editingGym ? editingGym.membersCount : 0,
      monthlyRevenue: selectedPlan?.monthlyPrice || 6999,
      joinedDate: editingGym ? editingGym.joinedDate : new Date().toISOString().split('T')[0],
      address: editingGym?.address || 'Plot 100, Commercial Boulevard',
      city: city || 'Mumbai, Maharashtra',
      country: 'India',
    };

    StorageService.saveItem<Gym>('gyms', gymToSave);
    refreshData();
    setModalOpen(false);
    toast.success(
      editingGym
        ? `Gym organization "${name}" updated successfully!`
        : `Gym organization "${name}" onboarded successfully!`
    );
  };

  const columns: Column<Gym>[] = [
    {
      key: 'name',
      header: 'Gym Organization',
      sortable: true,
      render: (gym) => (
        <div>
          <div style={{ fontWeight: 700 }}>{gym.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {gym.city} • Joined {formatDate(gym.joinedDate)}
          </div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner / Contact',
      sortable: true,
      render: (gym) => (
        <div>
          <div>{gym.ownerName || (gym as any).owner}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gym.ownerEmail || (gym as any).email}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'SaaS Plan',
      sortable: true,
      render: (gym) => <span className="badge badge-secondary">{gym.planName || 'Growth'}</span>,
    },
    {
      key: 'membersCount',
      header: 'Athletes Enrolled',
      sortable: true,
      render: (gym) => <span>{formatNumber(gym.membersCount || 0)}</span>,
    },
    {
      key: 'monthlyRevenue',
      header: 'MRR',
      sortable: true,
      render: (gym) => <strong>{formatINR(gym.monthlyRevenue || 0, { showDecimals: false })}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (gym) => (
        <span
          className={`badge ${
            gym.status === 'active'
              ? 'badge-success'
              : gym.status === 'trial'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {gym.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (gym) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleOpenEdit(gym)}
            title="Edit gym organization"
          >
            <i className="fa-solid fa-pen" /> Edit
          </button>
          <button
            type="button"
            className={`btn btn-sm ${gym.status === 'active' ? 'btn-outline' : 'btn-accent'}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleToggleStatus(gym)}
          >
            {gym.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
            onClick={() => handleDeleteGym(gym)}
            title="Delete gym organization"
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
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Gym Organizations</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Registered Tenant Gyms Directory
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Onboard new clubs, provision subscription plans, suspend non-paying accounts, and manage tenants.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-accent"
            onClick={handleOpenCreate}
          >
            <i className="fa-solid fa-plus" /> Onboard New Gym
          </button>
        </div>
      </div>

      <DataTable
        data={gyms}
        columns={columns}
        searchPlaceholder="Search gyms by name, owner, city..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Trial', value: 'trial' },
          { label: 'Suspended', value: 'suspended' },
        ]}
        exportFilename="gymflow-tenants-directory"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '540px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingGym ? `Edit Gym Organization: ${editingGym.name}` : 'Onboard New Gym Organization'}
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
            <form onSubmit={handleSaveGym}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Organization Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apex Performance Center"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Owner Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rajesh Sharma"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. rajesh@apex.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City, State</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mumbai, MH"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">SaaS Subscription Tier</label>
                    <select
                      className="form-control"
                      value={planId}
                      onChange={(e) => setPlanId(e.target.value)}
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.monthlyPrice, { showDecimals: false })}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  <i className="fa-solid fa-check" /> {editingGym ? 'Save Changes' : 'Provision Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
