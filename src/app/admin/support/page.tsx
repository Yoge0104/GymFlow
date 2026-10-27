'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { SupportTicket } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Technical');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [message, setMessage] = useState('');

  const refreshData = () => {
    const all = StorageService.getCollection<SupportTicket>('supportTickets');
    setTickets(all);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please enter subject and message.');
      return;
    }

    const newTicket: SupportTicket = {
      id: `tick_${Date.now()}`,
      ticketNumber: `TICK-${Date.now().toString().slice(-4)}`,
      gymId: 'gym-001',
      gymName: 'IronPulse Fitness Club',
      userId: 'usr-admin-01',
      userName: 'Marcus Vance',
      userEmail: 'marcus@ironpulse.com',
      userRole: 'GYM_ADMIN',
      subject,
      category,
      priority,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'Marcus Vance',
          senderRole: 'GYM_ADMIN',
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    StorageService.saveItem<SupportTicket>('supportTickets', newTicket);

    toast.success(`Support ticket ${newTicket.ticketNumber} submitted to GymFlow SaaS support!`);
    setSubject('');
    setMessage('');
    setShowNewModal(false);
    refreshData();
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    const updatedMessages = [
      ...(activeTicket.messages || []),
      {
        id: `msg-${Date.now()}`,
        senderName: 'Marcus Vance',
        senderRole: 'GYM_ADMIN',
        message: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    const updated: SupportTicket = {
      ...activeTicket,
      messages: updatedMessages,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    StorageService.saveItem<SupportTicket>('supportTickets', updated);

    setActiveTicket(updated);
    setReplyText('');
    refreshData();
    toast.success('Reply submitted to support ticket.');
  };

  const columns: Column<SupportTicket>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket ID',
      sortable: true,
      render: (t) => <strong style={{ color: 'var(--primary-color)' }}>{t.ticketNumber || t.id}</strong>,
    },
    {
      key: 'subject',
      header: 'Subject & Category',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.subject}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: <span style={{ textTransform: 'capitalize' }}>{t.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (t) => (
        <span
          className={`badge ${
            t.priority === 'Critical'
              ? 'badge-danger'
              : t.priority === 'High'
              ? 'badge-danger'
              : t.priority === 'Medium'
              ? 'badge-warning'
              : 'badge-secondary'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <span
          className={`badge ${
            t.status === 'Resolved'
              ? 'badge-success'
              : t.status === 'In Progress'
              ? 'badge-warning'
              : 'badge-primary'
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (t) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(t.createdAt)}</span>,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (t) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTicket(t)}
        >
          <i className="fa-solid fa-comments" /> View Thread
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/dashboard">Gym Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">GymFlow SaaS Support</span>
          </div>
          <h1 className="page-title">SaaS Platform Helpdesk</h1>
          <p className="page-subtitle">
            Submit support requests directly to GymFlow SaaS engineering and billing specialists.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-accent" onClick={() => setShowNewModal(true)}>
            <i className="fa-solid fa-plus" /> Open Support Ticket
          </button>
        </div>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        searchPlaceholder="Search ticket ID or subject..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'All Statuses', value: '' },
          { label: 'Open', value: 'Open' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Resolved', value: 'Resolved' },
          { label: 'Closed', value: 'Closed' },
        ]}
      />

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-ticket text-accent" style={{ marginRight: '0.5rem' }} />
                Open SaaS Support Ticket
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowNewModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief description of the issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing & Subscriptions</option>
                      <option value="Equipment">Access Gate / Hardware</option>
                      <option value="Membership">Membership Management</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Details & Steps to Reproduce *</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Explain what happened, expected behavior, and error messages observed..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }} /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details & Thread Modal */}
      {activeTicket && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{activeTicket.ticketNumber || activeTicket.id}:</span> {activeTicket.subject}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                    {activeTicket.category}
                  </span>
                  <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                    {activeTicket.priority} Priority
                  </span>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                    {activeTicket.status}
                  </span>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setActiveTicket(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                Conversation History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {activeTicket.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        msg.senderRole === 'SUPER_ADMIN'
                          ? 'rgba(37, 99, 235, 0.08)'
                          : 'var(--bg-surface-secondary)',
                      borderLeft:
                        msg.senderRole === 'SUPER_ADMIN'
                          ? '3px solid var(--primary-color)'
                          : '3px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>
                        {msg.senderName} ({msg.senderRole === 'SUPER_ADMIN' ? 'GymFlow Support' : msg.senderRole})
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'Resolved' && activeTicket.status !== 'Closed' && (
                <form onSubmit={handleSendReply}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Add a Reply</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Type your response to the support team..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.35rem' }} /> Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
