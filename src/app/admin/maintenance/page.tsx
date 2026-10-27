'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { MaintenanceTicket } from '@/types';
import { toast } from 'sonner';

export default function AdminMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);

  const refreshData = () => {
    setTickets(StorageService.getCollection<MaintenanceTicket>('maintenance'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleResolve = (ticket: MaintenanceTicket) => {
    ticket.status = 'Resolved';
    StorageService.saveItem('maintenance', ticket);
    refreshData();
    toast.success(`Service ticket for ${ticket.equipmentName} marked as Resolved.`);
  };

  const columns: Column<MaintenanceTicket>[] = [
    {
      key: 'equipmentName',
      header: 'Machine / Asset',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 700 }}>{t.equipmentName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {t.equipmentId}</div>
        </div>
      ),
    },
    {
      key: 'issueDescription',
      header: 'Reported Issue',
      render: (t) => <span>{t.issueDescription}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (t) => (
        <span
          className={`badge ${
            t.priority === 'Urgent' || t.priority === 'High' ? 'badge-danger' : 'badge-warning'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      key: 'technicianName',
      header: 'Technician',
      sortable: true,
      render: (t) => <span>{t.technicianName || 'Unassigned'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          {t.status !== 'Resolved' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleResolve(t)}
            >
              Mark Resolved
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Maintenance</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Equipment Maintenance & Repair Queue
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Work orders, technician assignments, safety inspections, and servicing logs.
          </p>
        </div>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        searchPlaceholder="Search maintenance tickets..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Open', value: 'Open' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Resolved', value: 'Resolved' },
        ]}
        exportFilename="ironpulse-maintenance-tickets"
      />
    </DashboardLayout>
  );
}
