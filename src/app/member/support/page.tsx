'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { SupportTicket } from '@/types';
import { toast } from 'sonner';

export default function MemberSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Membership');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [message, setMessage] = useState('');

  const refreshData = () => {
    const all = StorageService.getCollection<SupportTicket>('supportTickets');
    const myTickets = all.filter((t) => t.userId === 'usr-member-01' || t.userEmail?.includes('alex'));
    if (myTickets.length > 0) {
      setTickets(myTickets);
      if (!activeTicket) setActiveTicket(myTickets[0]);
    } else {
      // Default demo ticket for member
      const defTicket: SupportTicket = {
        id: 'tick_m1',
        ticketNumber: 'TICK-4821',
        gymId: 'gym-001',
        gymName: 'IronPulse Fitness Club',
        userId: 'usr-member-01',
        userName: 'Alex Morgan',
        userEmail: 'alex.morgan@example.com',
        userRole: 'MEMBER',
        subject: 'Locker Rental Renewal Inquiry',
        category: 'Membership',
        priority: 'Medium',
        status: 'Open',
        createdAt: '2026-04-18',
        updatedAt: '2026-04-18',
        messages: [
          {
            id: 'm1',
            senderName: 'Alex Morgan',
            senderRole: 'MEMBER',
            message: 'Hi Front Desk team, I would like to renew my executive locker assignment for the rest of the year. Can this be billed to my card on file?',
            timestamp: '09:30 AM',
          },
          {
            id: 'm2',
            senderName: 'Marcus Vance',
            senderRole: 'GYM_ADMIN',
            message: 'Hello Alex, yes absolutely! We can append the locker renewal fee ($15/mo) directly to your annual VIP account. Reply here to confirm and we will bill it.',
            timestamp: '10:15 AM',
          },
        ],
      };
      setTickets([defTicket]);
      setActiveTicket(defTicket);
      StorageService.saveItem('supportTickets', defTicket);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please enter subject and inquiry details.');
      return;
    }

    const newTicket: SupportTicket = {
      id: `tick_${Date.now()}`,
      ticketNumber: `TICK-${Date.now().toString().slice(-4)}`,
      gymId: 'gym-001',
      gymName: 'IronPulse Fitness Club',
      userId: 'usr-member-01',
      userName: 'Alex Morgan',
      userEmail: 'alex.morgan@example.com',
      userRole: 'MEMBER',
      subject,
      category,
      priority,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'Alex Morgan',
          senderRole: 'MEMBER',
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    StorageService.saveItem<SupportTicket>('supportTickets', newTicket);

    toast.success(`Question #${newTicket.ticketNumber} submitted to front desk!`);
    setSubject('');
    setMessage('');
    setShowNewModal(false);
    refreshData();
    setActiveTicket(newTicket);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    const updatedMessages = [
      ...(activeTicket.messages || []),
      {
        id: `msg-${Date.now()}`,
        senderName: 'Alex Morgan',
        senderRole: 'MEMBER',
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
    toast.success('Reply submitted to front desk staff.');
  };

  const filteredTickets = tickets
    .filter((t) => {
      const matchSearch =
        search === '' ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Support Helpdesk</span>
          </div>
          <h1 className="page-title">Gym Helpdesk & Inquiries</h1>
          <p className="page-subtitle">
            Communicate with IronPulse managers, trainers, and front desk concierges.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-accent" onClick={() => setShowNewModal(true)}>
            <i className="fa-solid fa-plus" style={{ marginRight: '0.4rem' }} /> Ask a Question
          </button>
        </div>
      </div>

      {/* Two-Column Support Grid */}
      <div className="grid-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', minHeight: '600px' }}>
        {/* Left: Ticket List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 1.25rem' }}>
            <h3 className="card-title">My Inquiries</h3>
          </div>

          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search inquiries..."
                style={{ paddingLeft: '2.25rem', width: '100%' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div style={{ padding: 0, overflowY: 'auto', flex: 1 }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No inquiries found.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    backgroundColor:
                      activeTicket?.id === t.id
                        ? 'var(--bg-hover)'
                        : 'transparent',
                    borderLeft: activeTicket?.id === t.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{t.subject}</strong>
                    <span
                      className={`badge ${
                        t.status === 'Resolved'
                          ? 'badge-success'
                          : t.status === 'In Progress'
                          ? 'badge-warning'
                          : 'badge-primary'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t.ticketNumber} &bull; {t.category}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Threaded Conversation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          {activeTicket ? (
            <>
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    {activeTicket.ticketNumber}: {activeTicket.subject}
                  </h3>
                  <span className="text-xs text-muted">
                    Category: {activeTicket.category} &bull; Priority: {activeTicket.priority}
                  </span>
                </div>
                <span
                  className={`badge ${
                    activeTicket.status === 'Resolved'
                      ? 'badge-success'
                      : activeTicket.status === 'In Progress'
                      ? 'badge-warning'
                      : 'badge-primary'
                  }`}
                >
                  {activeTicket.status}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeTicket.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        msg.senderRole === 'MEMBER'
                          ? 'var(--bg-surface-secondary)'
                          : 'rgba(37, 99, 235, 0.08)',
                      borderLeft:
                        msg.senderRole === 'MEMBER'
                          ? '3px solid var(--border-color)'
                          : '3px solid var(--primary-color)',
                      maxWidth: '92%',
                      alignSelf: msg.senderRole === 'MEMBER' ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', gap: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>
                        {msg.senderName} ({msg.senderRole === 'MEMBER' ? 'You' : 'Gym Staff'})
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'Resolved' && activeTicket.status !== 'Closed' && (
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                  <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your response to the club staff..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.3rem' }} /> Send
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select an inquiry from the left to view messages
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '560px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-question-circle text-accent" style={{ marginRight: '0.4rem' }} />
                Ask a Question to Front Desk
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
                    placeholder="e.g. Locker rental, personal training, lost item..."
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
                      <option value="Membership">Membership & Passes</option>
                      <option value="Billing">Billing & Statements</option>
                      <option value="Equipment">Locker / Facility</option>
                      <option value="General">General Question</option>
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
                      <option value="High">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Question Details *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Explain what you need assistance with..."
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
                  <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }} /> Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
