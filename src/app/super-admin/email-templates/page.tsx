'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { EmailTemplateService } from '@/services/EmailTemplateService';
import { EmailTemplate } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [category, setCategory] = useState<EmailTemplate['category']>('onboarding');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [plainTextBody, setPlainTextBody] = useState('');

  const refreshData = () => {
    setTemplates(EmailTemplateService.getAll());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setTemplateKey(t.templateKey);
    setCategory(t.category);
    setSubject(t.subject);
    setHtmlBody(t.htmlBody);
    setPlainTextBody(t.plainTextBody);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject) return;

    EmailTemplateService.save({
      id: editingTemplate?.id,
      name,
      templateKey,
      category,
      subject,
      htmlBody,
      plainTextBody,
      status: editingTemplate?.status || 'active',
    });

    refreshData();
    setEditingTemplate(null);
    toast.success(`Email template "${name}" saved in LocalStorage.`);
  };

  const handleToggleStatus = (t: EmailTemplate) => {
    const nextStatus = t.status === 'active' ? 'inactive' : 'active';
    t.status = nextStatus;
    EmailTemplateService.save(t);
    refreshData();
    toast.success(`Template ${t.name} is now ${nextStatus}`);
  };

  const handleDuplicate = (t: EmailTemplate) => {
    EmailTemplateService.save({
      ...t,
      id: undefined,
      name: `${t.name} (Copy)`,
      templateKey: `${t.templateKey}_copy_${Date.now().toString().slice(-4)}`,
    });
    refreshData();
    toast.success(`Duplicated ${t.name}`);
  };

  const columns: Column<EmailTemplate>[] = [
    {
      key: 'name',
      header: 'Template Name & Key',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 700 }}>{t.name}</div>
          <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.templateKey}</code>
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
      key: 'subject',
      header: 'Subject Line',
      sortable: true,
      render: (t) => <span style={{ fontSize: '0.85rem' }}>{t.subject}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <span className={`badge ${t.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => setPreviewTemplate(t)}
          >
            <i className="fa-solid fa-eye" /> Preview
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleOpenEdit(t)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => handleDuplicate(t)}
          >
            <i className="fa-solid fa-clone" />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${t.status === 'active' ? 'btn-outline' : 'btn-accent'}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
            onClick={() => handleToggleStatus(t)}
          >
            {t.status === 'active' ? 'Deactivate' : 'Activate'}
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
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Email Templates</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Email Template Engine
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Customize transactional, billing, and notification email layouts with live placeholder interpolation.
          </p>
        </div>
      </div>

      <DataTable
        data={templates}
        columns={columns}
        searchPlaceholder="Search email templates..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        exportFilename="gymflow-email-templates"
      />

      {/* Editor Modal */}
      {editingTemplate && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Edit Template: {editingTemplate.name}</h3>
              <button type="button" className="modal-close" onClick={() => setEditingTemplate(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Template Display Name *</label>
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
                      <option value="marketing">Marketing</option>
                      <option value="system">System</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Subject Line *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Available Placeholders Reference Strip */}
                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '0.35rem' }}>
                    Available Placeholders:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['{{memberName}}', '{{gymName}}', '{{membershipPlan}}', '{{membershipEndDate}}', '{{amount}}', '{{invoiceNumber}}', '{{className}}', '{{discountCode}}', '{{supportTicketId}}'].map((ph) => (
                      <code
                        key={ph}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setHtmlBody((prev) => prev + ph);
                          toast.info(`Inserted ${ph}`);
                        }}
                        title="Click to append into body"
                      >
                        {ph}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">HTML Email Content</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plain Text Fallback</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={plainTextBody}
                    onChange={(e) => setPlainTextBody(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="modal-title" style={{ margin: 0 }}>Simulated Preview: {previewTemplate.name}</h3>
                <span className="badge badge-accent" style={{ marginTop: '0.25rem' }}>Safe Escaped DOM Rendering</span>
              </div>
              <button type="button" className="modal-close" onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              {(() => {
                const rendered = EmailTemplateService.renderPreview(previewTemplate);
                return (
                  <div>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulated Subject:</div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '0.2rem' }}>{rendered.subject}</div>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', backgroundColor: '#ffffff', color: '#1a202c' }}>
                      <div dangerouslySetInnerHTML={{ __html: rendered.htmlBody }} />
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Plain Text View:
                      </div>
                      <pre style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                        {rendered.plainTextBody}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
