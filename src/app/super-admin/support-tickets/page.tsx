'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { SupportTicket } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const refreshData = () => {
    setTickets(StorageService.getCollection<SupportTicket>('supportTickets'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (ticket: SupportTicket, newStatus: any) => {
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    StorageService.saveItem('supportTickets', ticket);
    refreshData();
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket({ ...ticket });
    }
    toast.success(`Ticket #${ticket.ticketNumber || ticket.id} updated to ${newStatus}`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    if (!selectedTicket.messages) selectedTicket.messages = [];
    selectedTicket.messages.push({
      id: `msg_${Date.now()}`,
      senderName: 'Alex Vance (Platform Support)',
      senderRole: 'Super Admin',
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
    });
    selectedTicket.status = 'In Progress';
    selectedTicket.updatedAt = new Date().toISOString();

    StorageService.saveItem('supportTickets', selectedTicket);
    setReplyText('');
    refreshData();
    toast.success('Reply submitted to ticket.');
  };

  const columns: Column<SupportTicket>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      sortable: true,
      render: (t) => <strong>{t.ticketNumber || t.id}</strong>,
    },
    {
      key: 'subject',
      header: 'Subject & Requester',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.subject}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            From: {t.userName} ({t.userRole}) &bull; {t.gymName || 'IronPulse'}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (t) => <span className="badge badge-secondary">{t.category}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (t) => (
        <span
          className={`badge ${
            t.priority === 'Critical' || t.priority === 'High' ? 'badge-danger' : 'badge-warning'
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
            t.status === 'Resolved' || t.status === 'Closed'
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
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          onClick={() => setSelectedTicket(t)}
        >
          Inspect & Reply
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Support Queue</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Helpdesk Queue
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Inquiries and technical tickets submitted by gym owners, staff, and athletes.
          </p>
        </div>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        searchPlaceholder="Search support tickets..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Open', value: 'Open' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Resolved', value: 'Resolved' },
        ]}
        exportFilename="gymflow-support-tickets"
      />

      {/* Ticket Details & Conversation Modal */}
      {selectedTicket && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="modal-title" style={{ margin: 0 }}>
                  Ticket #{selectedTicket.ticketNumber || selectedTicket.id}: {selectedTicket.subject}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Requester: {selectedTicket.userName} ({selectedTicket.userEmail})
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-secondary">{selectedTicket.category}</span>
                <span className={`badge ${selectedTicket.priority === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                  {selectedTicket.priority} Priority
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem', width: 'auto' }}
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Messages Thread */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem',
                }}
              >
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{m.senderName}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', lineHeight: 1.4 }}>{m.message}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    No messages logged yet.
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Post Response to Requester</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Type your response here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-accent">
                    <i className="fa-solid fa-paper-plane" /> Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
