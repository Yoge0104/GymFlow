'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function SuperAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'danger'>('info');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'GYM_ADMINS' | 'MEMBERS'>('ALL');

  const refreshData = () => {
    setAnnouncements(StorageService.getCollection<Announcement>('announcements'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setType('info');
    setTargetAudience('ALL');
    setModalOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setTargetAudience(a.targetAudience);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload: Announcement = {
      id: editingAnnouncement ? editingAnnouncement.id : `anc_${Date.now()}`,
      gymId: null,
      title: title.trim(),
      content: content.trim(),
      type,
      targetAudience,
      publishDate: editingAnnouncement?.publishDate || new Date().toISOString().split('T')[0],
      isActive: true,
    };

    StorageService.saveItem<Announcement>('announcements', payload);
    refreshData();
    setModalOpen(false);
    toast.success(editingAnnouncement ? 'Announcement updated.' : 'Announcement broadcast published to platform.');
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    StorageService.deleteItem('announcements', deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Announcement removed.');
  };

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement',
      sortable: true,
      render: (a) => (
        <div>
          <div style={{ fontWeight: 700 }}>{a.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.content}</div>
        </div>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Target Audience',
      sortable: true,
      render: (a) => <span className="badge badge-secondary">{a.targetAudience}</span>,
    },
    {
      key: 'type',
      header: 'Severity',
      sortable: true,
      render: (a) => (
        <span
          className={`badge ${
            a.type === 'danger'
              ? 'badge-danger'
              : a.type === 'warning'
              ? 'badge-warning'
              : 'badge-accent'
          }`}
        >
          {a.type}
        </span>
      ),
    },
    {
      key: 'publishDate',
      header: 'Published',
      sortable: true,
      render: (a) => <span>{formatDate(a.publishDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            title="Edit Announcement"
            onClick={() => openEditModal(a)}
          >
            <i className="fa-solid fa-pen-to-square" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline btn-danger"
            title="Delete Announcement"
            onClick={() => setDeleteId(a.id)}
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
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Announcements</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            SaaS Platform Announcements
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Broadcast maintenance alerts, system updates, and feature notices to all gym clubs.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={openCreateModal}>
            <i className="fa-solid fa-bullhorn" /> Publish Announcement
          </button>
        </div>
      </div>

      <DataTable
        data={announcements}
        columns={columns}
        searchPlaceholder="Search broadcasts..."
        exportFilename="gymflow-announcements"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingAnnouncement ? 'Edit Broadcast' : 'Publish New Broadcast'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Headline Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Broadcast Content *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Notice Type</label>
                    <select className="form-control" value={type} onChange={(e) => setType(e.target.value as any)}>
                      <option value="info">Information</option>
                      <option value="warning">Maintenance Warning</option>
                      <option value="success">Feature Release</option>
                      <option value="danger">Critical Alert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <select className="form-control" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)}>
                      <option value="ALL">All Users & Portals</option>
                      <option value="GYM_ADMINS">Gym Admins Only</option>
                      <option value="MEMBERS">Athletes Only</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingAnnouncement ? 'Save Changes' : 'Publish Broadcast'}
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
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Broadcast</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove this platform announcement?
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
