'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationService } from '@/services/NotificationService';
import { AppNotification } from '@/types';
import { toast } from 'sonner';

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'classes' | 'billing' | 'promotions'>('All');

  const refreshData = () => {
    // Current demo member: Alex Morgan (mem-001 / usr-member-01)
    const list = NotificationService.getByRecipient('gym-001', 'usr-member-01', 'MEMBER');
    setNotifications(list);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleMarkAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    refreshData();
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead('gym-001', 'usr-member-01', 'MEMBER');
    refreshData();
    toast.success('All notifications marked as read.');
  };

  const handleDelete = (id: string) => {
    NotificationService.delete(id);
    refreshData();
    toast.success('Notification removed.');
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'classes') return n.category === 'classes' || n.category === 'attendance';
    if (activeTab === 'billing') return n.category === 'billing' || n.category === 'payments' || n.category === 'membership';
    if (activeTab === 'promotions') return n.category === 'promotions';
    return true;
  });

  const getIconForCategory = (cat: AppNotification['category']) => {
    switch (cat) {
      case 'classes':
      case 'attendance':
        return <i className="fa-solid fa-calendar-check text-primary" style={{ fontSize: '1.25rem' }} />;
      case 'billing':
      case 'payments':
      case 'membership':
        return <i className="fa-solid fa-credit-card text-warning" style={{ fontSize: '1.25rem' }} />;
      case 'promotions':
        return <i className="fa-solid fa-bullhorn text-success" style={{ fontSize: '1.25rem' }} />;
      default:
        return <i className="fa-solid fa-bell text-secondary" style={{ fontSize: '1.25rem' }} />;
    }
  };

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Notifications</span>
          </div>
          <h1 className="page-title">Personal Alerts & Announcements</h1>
          <p className="page-subtitle">
            Stay informed about scheduled classes, billing renewals, club notices, and workout updates.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-outline" onClick={handleMarkAllRead}>
            <i className="fa-solid fa-check-double" style={{ marginRight: '0.4rem' }} /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          <i className="fa-solid fa-list" style={{ marginRight: '0.4rem' }} /> All Alerts
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <i className="fa-solid fa-calendar-check" style={{ marginRight: '0.4rem' }} /> Classes & Schedule
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <i className="fa-solid fa-credit-card" style={{ marginRight: '0.4rem' }} /> Billing & Renewals
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'promotions' ? 'active' : ''}`}
          onClick={() => setActiveTab('promotions')}
        >
          <i className="fa-solid fa-bullhorn" style={{ marginRight: '0.4rem' }} /> Club Notices
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-regular fa-bell-slash text-muted" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} />
            <h3>No Alerts in this Category</h3>
            <p className="text-muted text-sm">You are all caught up! No active notices found.</p>
          </div>
        ) : (
          filtered.map((n) => (
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
              }}
            >
              <div style={{ paddingTop: '0.2rem' }}>{getIconForCategory(n.category)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: !n.isRead ? 700 : 600 }}>{n.title}</h4>
                    {!n.isRead && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>NEW</span>}
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {n.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {n.timestamp.split('T')[0] || n.timestamp}
                  </span>
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
                    className="btn btn-outline btn-sm text-danger"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
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
    </DashboardLayout>
  );
}
