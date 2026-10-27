'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { NotificationService } from '@/services/NotificationService';
import { StorageService } from '@/services/StorageService';
import { useAuth } from '@/context/AuthContext';
import { AppNotification } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshData = () => {
    setNotifications(NotificationService.getByRecipient(null, user.id, 'SUPER_ADMIN'));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, [user]);

  const handleMarkRead = (id: string) => {
    NotificationService.markAsRead(id);
    refreshData();
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead(null, user.id, 'SUPER_ADMIN');
    refreshData();
    toast.success('All notifications marked as read.');
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications in queue?')) {
      NotificationService.clearAll(null, user.id, 'SUPER_ADMIN');
      refreshData();
      toast.success('Cleared all notifications.');
    }
  };

  const columns: Column<AppNotification>[] = [
    {
      key: 'title',
      header: 'Notification & Event',
      sortable: true,
      render: (n) => (
        <div style={{ opacity: n.isRead ? 0.75 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {!n.isRead && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
            )}
            <strong style={{ fontSize: '0.9rem' }}>{n.title}</strong>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.message}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (n) => <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{n.category}</span>,
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (n) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date(n.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (n) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          {!n.isRead && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleMarkRead(n.id)}
            >
              Mark Read
            </button>
          )}
          {n.linkUrl && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => {
                handleMarkRead(n.id);
                router.push(n.linkUrl!);
              }}
            >
              Inspect <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.65rem' }} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Notifications</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform In-App Notifications
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Event-driven alerts for new tenant registrations, subscription renewals, support escalations, and transactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleMarkAllRead}>
            <i className="fa-solid fa-check-double" /> Mark All Read
          </button>
          <button type="button" className="btn btn-outline" onClick={handleClearAll}>
            <i className="fa-solid fa-trash" /> Clear All
          </button>
        </div>
      </div>

      <DataTable
        data={notifications}
        columns={columns}
        searchPlaceholder="Search notifications..."
        exportFilename="gymflow-platform-notifications"
      />
    </DashboardLayout>
  );
}
