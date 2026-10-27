'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { Trainer, Branch } from '@/types';
import { toast } from 'sonner';

export default function AdminTrainers() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 11223');
  const [specialtiesText, setSpecialtiesText] = useState('Powerlifting, Strength');
  const [branchId, setBranchId] = useState('br_1');
  const [rating, setRating] = useState(4.9);
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');

  const refreshData = () => {
    setTrainers(DataScopeService.getTrainers(user));
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
    setEditingTrainer(null);
    setName('');
    setEmail('');
    setPhone('+91 98765 11223');
    setSpecialtiesText('Powerlifting, Strength Conditioning');
    setBranchId(branches[0]?.id || 'br_1');
    setRating(4.9);
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Trainer) => {
    setEditingTrainer(t);
    setName(t.name);
    setEmail(t.email);
    setPhone(t.phone || '');
    setSpecialtiesText((t.specialties || []).join(', '));
    setBranchId(t.branchId || branches[0]?.id || 'br_1');
    setRating(t.rating || 4.9);
    setStatus(t.status as any);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Trainer name and email are required.');
      return;
    }

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const selectedBranch = branches.find((b) => b.id === branchId);

    const trainerToSave: Trainer = {
      id: editingTrainer ? editingTrainer.id : `trn_${Date.now()}`,
      gymId: editingTrainer ? editingTrainer.gymId : (user?.gymId || 'gym_1'),
      branchId: branchId || 'br_1',
      branchName: selectedBranch?.name || 'Downtown Flagship',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 11223',
      specialties: specialties.length > 0 ? specialties : ['Fitness Coaching'],
      experienceYears: editingTrainer?.experienceYears || 3,
      rating: Number(rating),
      clientCount: editingTrainer ? editingTrainer.clientCount : 0,
      avatar: editingTrainer?.avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
      bio: editingTrainer?.bio || 'Certified Fitness & Strength Coach',
      status: status,
    };

    StorageService.saveItem<Trainer>('trainers', trainerToSave);
    refreshData();
    setModalOpen(false);
    toast.success(editingTrainer ? `Trainer "${name}" profile updated.` : `Trainer "${name}" added.`);
  };

  const handleDelete = (t: Trainer) => {
    if (confirm(`Remove trainer profile for "${t.name}"?`)) {
      StorageService.deleteItem('trainers', t.id);
      refreshData();
      toast.success(`Trainer "${t.name}" removed.`);
    }
  };

  const columns: Column<Trainer>[] = [
    {
      key: 'name',
      header: 'Trainer Coach',
      sortable: true,
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="avatar avatar-sm">
            <img src={t.avatar} alt={t.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialties',
      header: 'Specialties',
      render: (t) => (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(t.specialties || []).map((s, idx) => (
            <span key={idx} className="badge badge-secondary">{s}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Athlete Rating',
      sortable: true,
      render: (t) => (
        <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>
          <i className="fa-solid fa-star" /> {t.rating} / 5.0
        </span>
      ),
    },
    {
      key: 'clientCount',
      header: 'Active Athletes',
      sortable: true,
      render: (t) => <span>{t.clientCount || 0} Clients</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <span className={`badge ${t.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="trainers.manage">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleOpenEdit(t)}
            >
              <i className="fa-solid fa-pen" /> Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDelete(t)}
              title="Delete trainer profile"
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Trainers</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Certified Personal Trainers Staff
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Coaching profiles, client capacities, specializations, and booking schedules.
          </p>
        </div>
        <div>
          <PermissionGate permission="trainers.manage">
            <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
              <i className="fa-solid fa-user-ninja" /> Add New Trainer
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={trainers}
        columns={columns}
        searchPlaceholder="Search trainers by name, specialty..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'On Leave', value: 'On Leave' },
          { label: 'Inactive', value: 'Inactive' },
        ]}
        exportFilename="ironpulse-trainers"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingTrainer ? `Edit Trainer: ${editingTrainer.name}` : 'Add Trainer Profile'}
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
                    placeholder="e.g. Coach David Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Specialties (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. HIIT, Powerlifting, Olympic Lifting"
                    value={specialtiesText}
                    onChange={(e) => setSpecialtiesText(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Branch Assignment</label>
                    <select className="form-control" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingTrainer ? 'Save Changes' : 'Add Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
