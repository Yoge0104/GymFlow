'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { EmailTemplateService } from '@/services/EmailTemplateService';
import { EmailTemplate } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [category, setCategory] = useState<EmailTemplate['category']>('onboarding');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [plainTextBody, setPlainTextBody] = useState('');

  const refreshData = () => {
    // Show templates relevant to gym operations
    const all = EmailTemplateService.getAll();
    setTemplates(all.filter((t) => ['onboarding', 'billing', 'attendance', 'notification', 'marketing'].includes(t.category)));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setTemplateKey(`tpl_${Date.now()}`);
    setCategory('onboarding');
    setSubject('Welcome to GymFlow!');
    setHtmlBody('<h2>Welcome {{memberName}}</h2><p>Thank you for joining {{gymName}} with the {{membershipPlan}} plan.</p>');
    setPlainTextBody('Welcome {{memberName}}, thank you for joining {{gymName}} with the {{membershipPlan}} plan.');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setTemplateKey(t.templateKey);
    setCategory(t.category);
    setSubject(t.subject);
    setHtmlBody(t.htmlBody);
    setPlainTextBody(t.plainTextBody);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) {
      toast.error('Please enter template name and subject.');
      return;
    }

    EmailTemplateService.save({
      id: editingTemplate?.id,
      name: name.trim(),
      templateKey: templateKey.trim() || `tpl_${Date.now()}`,
      category,
      subject: subject.trim(),
      htmlBody,
      plainTextBody,
      status: editingTemplate?.status || 'active',
    });

    refreshData();
    setModalOpen(false);
    toast.success(editingTemplate ? `Email template "${name}" updated.` : `Email template "${name}" created.`);
  };

  const handleToggleStatus = (t: EmailTemplate) => {
    const nextStatus: 'active' | 'inactive' = t.status === 'active' ? 'inactive' : 'active';
    EmailTemplateService.save({ ...t, status: nextStatus });
    refreshData();
    toast.info(`Template ${t.name} status updated to ${nextStatus}.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    EmailTemplateService.delete(deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Email template deleted.');
  };

  const insertVariable = (varTag: string) => {
    setHtmlBody((prev) => prev + ` ${varTag} `);
  };

  const columns: Column<EmailTemplate>[] = [
    {
      key: 'name',
      header: 'Template Name & Subject',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 700 }}>{t.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Subject:</strong> {t.subject}
          </div>
          <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.templateKey}</code>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (t) => (
        <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
          {t.category}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <span className={`badge ${t.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      sortable: true,
      render: (t) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t.lastModified ? formatDate(t.lastModified) : 'Recent'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (t) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setPreviewTemplate(t)}
            title="Preview rendered email"
          >
            <i className="fa-solid fa-eye" /> Preview
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEdit(t)}
            title="Customize template copy"
          >
            <i className="fa-solid fa-pen" /> Edit
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleToggleStatus(t)}
            title="Toggle Status"
          >
            {t.status === 'active' ? (
              <i className="fa-solid fa-pause text-warning" />
            ) : (
              <i className="fa-solid fa-play text-success" />
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm btn-danger"
            onClick={() => setDeleteId(t.id)}
            title="Delete template"
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  const renderedPreview = previewTemplate
    ? EmailTemplateService.renderPreview(previewTemplate, {
        memberName: 'Rahul Sharma',
        gymName: 'IronPulse Fitness Club',
        membershipPlan: 'Elite Annual All-Access',
        amount: '₹21,999.00',
        invoiceNumber: 'INV-IP-2026-0042',
        membershipEndDate: '2026-12-31',
        className: 'HIIT Boot Camp',
        bookingDate: '08:00 AM Tomorrow',
      })
    : null;

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb">
            <Link href="/admin/dashboard">Gym Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Email Templates</span>
          </div>
          <h1 className="page-title">Gym Email & Automated Messaging</h1>
          <p className="page-subtitle">
            Configure member welcome emails, booking confirmations, payment receipts, and expiration alerts.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
            <i className="fa-solid fa-plus" /> New Template
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-envelope-open-text text-accent" style={{ fontSize: '1.25rem' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Personalized Member Communications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              All emails sent from IronPulse Fitness Club automatically substitute member details, dates, and club contact info.
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={templates}
        columns={columns}
        searchPlaceholder="Search email templates by name, key or subject..."
        statusFilterKey="category"
        statusOptions={[
          { label: 'All Categories', value: '' },
          { label: 'Onboarding', value: 'onboarding' },
          { label: 'Billing & Invoices', value: 'billing' },
          { label: 'Attendance & Classes', value: 'attendance' },
          { label: 'Notifications', value: 'notification' },
          { label: 'Marketing', value: 'marketing' },
        ]}
      />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ maxWidth: '780px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-envelope-pen text-accent" style={{ marginRight: '0.5rem' }} />
                {editingTemplate ? `Customize Template: ${editingTemplate.name}` : 'Create New Email Template'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Template Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="onboarding">Onboarding</option>
                      <option value="billing">Billing</option>
                      <option value="attendance">Attendance</option>
                      <option value="notification">Notification</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Line *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Insert Dynamic Tags</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {[
                      '{{memberName}}',
                      '{{gymName}}',
                      '{{membershipPlan}}',
                      '{{amount}}',
                      '{{invoiceNumber}}',
                      '{{membershipEndDate}}',
                      '{{className}}',
                      '{{bookingDate}}',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                        onClick={() => insertVariable(tag)}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">HTML Message Template</label>
                  <textarea
                    className="form-control"
                    rows={8}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fallback Plain Text Template</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={plainTextBody}
                    onChange={(e) => setPlainTextBody(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-save" style={{ marginRight: '0.4rem' }} /> Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && renderedPreview && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ maxWidth: '640px', width: '90%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-paper-plane text-accent" style={{ marginRight: '0.5rem' }} />
                Rendered Email Preview
              </h3>
              <button type="button" className="modal-close" onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div><strong>To:</strong> rahul.sharma@example.com</div>
                <div><strong>From:</strong> IronPulse Fitness Club &lt;noreply@ironpulse.com&gt;</div>
                <div><strong>Subject:</strong> {renderedPreview.subject}</div>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  minHeight: '200px',
                }}
                dangerouslySetInnerHTML={{
                  __html: renderedPreview.htmlBody,
                }}
              />
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Template</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to delete this email template? Automated notifications using this key will revert to system defaults.
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
