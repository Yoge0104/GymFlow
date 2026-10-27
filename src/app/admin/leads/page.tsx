'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { Lead } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<Lead['source']>('Website');
  const [interestedPlan, setInterestedPlan] = useState('Annual VIP Pass');
  const [stage, setStage] = useState<Lead['stage']>('New Inquiry');
  const [notes, setNotes] = useState('');

  const refreshData = () => {
    setLeads(DataScopeService.getLeads(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const openCreateModal = () => {
    setEditingLead(null);
    setName('');
    setEmail('');
    setPhone('');
    setSource('Website');
    setInterestedPlan('Annual VIP Pass');
    setStage('New Inquiry');
    setNotes('Initial inquiry via web portal');
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setEmail(lead.email);
    setPhone(lead.phone);
    setSource(lead.source);
    setInterestedPlan(lead.interestedPlan);
    setStage(lead.stage);
    setNotes(lead.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter name and email.');
      return;
    }

    const payload: Lead = {
      id: editingLead ? editingLead.id : `lead_${Date.now()}`,
      gymId: editingLead?.gymId || user?.gymId || 'gym_1',
      branchId: editingLead?.branchId || user?.branchId || 'br_1',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 43210',
      source,
      interestedPlan: interestedPlan.trim() || 'Annual VIP Pass',
      stage,
      notes: notes.trim(),
      assignedStaff: editingLead?.assignedStaff || 'Senior Fitness Consultant',
      createdAt: editingLead?.createdAt || new Date().toISOString().split('T')[0],
    };

    StorageService.saveItem<Lead>('leads', payload);
    refreshData();
    setModalOpen(false);
    toast.success(editingLead ? `Lead "${payload.name}" updated successfully.` : `Lead "${payload.name}" added to sales pipeline.`);
  };

  const handleStageChange = (lead: Lead, nextStage: any) => {
    lead.stage = nextStage;
    StorageService.saveItem('leads', lead);
    refreshData();
    toast.success(`Lead ${lead.name} stage updated to ${nextStage}.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    StorageService.deleteItem('leads', deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Lead removed from CRM.');
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Prospect Name',
      sortable: true,
      render: (l) => (
        <div>
          <div style={{ fontWeight: 700 }}>{l.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.email} &bull; {l.phone}</div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source Channel',
      sortable: true,
      render: (l) => <span className="badge badge-secondary">{l.source}</span>,
    },
    {
      key: 'interestedPlan',
      header: 'Interested Package',
      sortable: true,
      render: (l) => <span>{l.interestedPlan}</span>,
    },
    {
      key: 'createdAt',
      header: 'Inquiry Date',
      sortable: true,
      render: (l) => <span>{formatDate(l.createdAt)}</span>,
    },
    {
      key: 'stage',
      header: 'Pipeline Stage',
      sortable: true,
      render: (l) => (
        <span
          className={`badge ${
            l.stage === 'Converted'
              ? 'badge-success'
              : l.stage === 'Trial Scheduled'
              ? 'badge-accent'
              : l.stage === 'Contacted'
              ? 'badge-secondary'
              : 'badge-primary'
          }`}
        >
          {l.stage}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (l) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ height: '30px', fontSize: '0.75rem', padding: '0.1rem 0.4rem', width: 'auto' }}
            value={l.stage}
            onChange={(e) => handleStageChange(l, e.target.value)}
          >
            <option value="New Inquiry">New Inquiry</option>
            <option value="Contacted">Contacted</option>
            <option value="Trial Scheduled">Trial Scheduled</option>
            <option value="Induction">Induction</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            title="Edit Lead"
            onClick={() => openEditModal(l)}
          >
            <i className="fa-solid fa-pen-to-square" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline btn-danger"
            title="Delete Lead"
            onClick={() => setDeleteId(l.id)}
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Leads CRM</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Sales CRM & Prospect Pipeline
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Track inquiries, free trial bookings, inductions, and converted memberships.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={openCreateModal}>
            <i className="fa-solid fa-user-plus" /> Add Lead
          </button>
        </div>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        searchPlaceholder="Search leads..."
        statusFilterKey="stage"
        statusOptions={[
          { label: 'New Inquiry', value: 'New Inquiry' },
          { label: 'Contacted', value: 'Contacted' },
          { label: 'Trial Scheduled', value: 'Trial Scheduled' },
          { label: 'Converted', value: 'Converted' },
          { label: 'Lost', value: 'Lost' },
        ]}
        exportFilename="ironpulse-leads-crm"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingLead ? 'Edit Prospect Lead' : 'Log New Inbound Lead'}
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
                    placeholder="e.g. Rahul Sharma"
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
                      placeholder="e.g. rahul@example.com"
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
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Inbound Channel</label>
                    <select className="form-control" value={source} onChange={(e) => setSource(e.target.value as any)}>
                      <option value="Website">Website</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                      <option value="Google">Google Search</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Tier</label>
                    <input
                      type="text"
                      className="form-control"
                      value={interestedPlan}
                      onChange={(e) => setInterestedPlan(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Pipeline Stage</label>
                  <select className="form-control" value={stage} onChange={(e) => setStage(e.target.value as any)}>
                    <option value="New Inquiry">New Inquiry</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Trial Scheduled">Trial Scheduled</option>
                    <option value="Induction">Induction</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingLead ? 'Save Changes' : 'Create Lead'}
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
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Lead</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove this lead from the sales CRM?
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
