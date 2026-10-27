'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationService } from '@/services/NotificationService';
import { AppNotification } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Broadcast modal form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<AppNotification['category']>('promotions');
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'MEMBERS' | 'STAFF'>('ALL');

  const refreshData = () => {
    const all = NotificationService.getAll();
    setNotifications(all);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleMarkAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    refreshData();
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead('gym-001', null, 'GYM_ADMIN');
    refreshData();
    toast.success('All operational notifications marked as read.');
  };

  const handleDelete = (id: string) => {
    NotificationService.delete(id);
    refreshData();
    toast.success('Notification removed.');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error('Please enter a title and message.');
      return;
    }

    NotificationService.notify({
      gymId: 'gym-001',
      category: broadcastCategory,
      title: broadcastTitle,
      message: broadcastMessage,
      linkUrl: broadcastTarget === 'MEMBERS' ? '/member/notifications' : '/admin/dashboard',
      targetRole: broadcastTarget === 'MEMBERS' ? 'MEMBER' : broadcastTarget === 'STAFF' ? 'GYM_ADMIN' : 'ALL',
    });

    toast.success(`Broadcast dispatched to ${broadcastTarget === 'ALL' ? 'all club members & staff' : broadcastTarget}!`);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setShowBroadcastModal(false);
    refreshData();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('newest');
  };

  // Filter and sort
  const filteredNotifications = notifications
    .filter((n) => {
      const matchesSearch =
        search === '' ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === '' || (n.category && n.category.toLowerCase() === category.toLowerCase());
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const getCategoryBadgeClass = (cat: AppNotification['category']) => {
    switch (cat) {
      case 'membership':
      case 'payments':
      case 'billing':
        return 'badge-warning';
      case 'promotions':
        return 'badge-success';
      case 'support':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <DashboardLayout portal="admin">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/dashboard">Gym Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Alert Center</span>
          </div>
          <h1 className="page-title">Gym Notifications & Operational Alerts</h1>
          <p className="page-subtitle">
            Automated triggers for renewals, maintenance dispatches, booking caps, and broadcast announcements.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={handleMarkAllRead}>
            <i className="fa-solid fa-check-double" /> Mark All Read
          </button>
          <button type="button" className="btn btn-accent" onClick={() => setShowBroadcastModal(true)}>
            <i className="fa-solid fa-bullhorn" /> Broadcast Member Notice
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', maxWidth: '960px' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search alerts or notices..."
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="payments">Payments & Billing</option>
              <option value="membership">Membership</option>
              <option value="attendance">Attendance</option>
              <option value="classes">Classes</option>
              <option value="promotions">Promotions</option>
              <option value="support">Support</option>
            </select>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
              title="Reset all filters"
            >
              <i className="fa-solid fa-arrow-rotate-left" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '960px' }}>
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-regular fa-bell-slash text-muted" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No notifications found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              All gym operational notices have been cleared or match no filters.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1.25rem',
                borderLeft: !n.isRead ? '4px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: !n.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ paddingTop: '0.2rem' }}>
                <i className="fa-solid fa-bell text-primary" style={{ fontSize: '1.25rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: !n.isRead ? 700 : 600 }}>{n.title}</h4>
                    {!n.isRead && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>NEW</span>}
                    {n.category && (
                      <span className={`badge ${getCategoryBadgeClass(n.category)}`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                        {n.category}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(n.timestamp)}</span>
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      View Details &rarr;
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <i className="fa-solid fa-check" /> Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--danger-color)' }}
                    onClick={() => handleDelete(n.id)}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '580px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-bullhorn text-accent" style={{ marginRight: '0.5rem' }} />
                Broadcast Member Notice
              </h3>
              <button type="button" className="modal-close" onClick={() => setShowBroadcastModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleBroadcast}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  >
                    <option value="ALL">All Club Members & Staff</option>
                    <option value="MEMBERS">Members Only</option>
                    <option value="STAFF">Club Staff & Trainers</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as any)}
                  >
                    <option value="promotions">Promotions & Specials</option>
                    <option value="membership">Membership Alert</option>
                    <option value="classes">Class & Schedule Update</option>
                    <option value="attendance">Facility Access</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Headline *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Holiday Hours & Maintenance Schedule"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Body *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Provide full details of the announcement for your members..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }} /> Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
