'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/formatters';

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(StorageService.getCollection<AuditLog>('auditLogs'));
  }, []);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {formatDateTime(log.timestamp)}
        </span>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor & Role',
      sortable: true,
      render: (log) => (
        <div>
          <div style={{ fontWeight: 700 }}>{log.actorName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Event',
      sortable: true,
      render: (log) => <span className="badge badge-secondary">{log.action}</span>,
    },
    {
      key: 'resource',
      header: 'Target Resource',
      sortable: true,
      render: (log) => <code>{log.resource}</code>,
    },
    {
      key: 'details',
      header: 'Audit Event Details',
      render: (log) => <span style={{ fontSize: '0.85rem' }}>{log.details}</span>,
    },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Security Audit Logs</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Platform Immutable Audit Log
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Comprehensive trace ledger recording administrative actions, permission mutations, and tenant events.
          </p>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search audit events, actors, resources..."
        exportFilename="gymflow-audit-logs"
      />
    </DashboardLayout>
  );
}
