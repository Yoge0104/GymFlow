'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { ClassBooking } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminClassBookings() {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);

  const refreshData = () => {
    setBookings(StorageService.getCollection<ClassBooking>('classBookings'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleMarkAttended = (b: ClassBooking) => {
    b.status = 'Attended';
    StorageService.saveItem('classBookings', b);
    refreshData();
    toast.success(`Marked ${b.memberName} as attended for ${b.className}.`);
  };

  const handleCancelBooking = (b: ClassBooking) => {
    b.status = 'Cancelled';
    StorageService.saveItem('classBookings', b);
    refreshData();
    toast.info(`Cancelled reservation for ${b.memberName}.`);
  };

  const columns: Column<ClassBooking>[] = [
    {
      key: 'memberName',
      header: 'Athlete',
      sortable: true,
      render: (b) => (
        <div>
          <div style={{ fontWeight: 700 }}>{b.memberName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {b.memberId}</div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class Session',
      sortable: true,
      render: (b) => (
        <div>
          <div style={{ fontWeight: 600 }}>{b.className}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coach: {b.trainerName}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Session Date & Time',
      sortable: true,
      render: (b) => <span>{formatDate(b.date)} at {b.time}</span>,
    },
    {
      key: 'status',
      header: 'Roster Status',
      sortable: true,
      render: (b) => (
        <span
          className={`badge ${
            b.status === 'Attended'
              ? 'badge-success'
              : b.status === 'Booked'
              ? 'badge-accent'
              : 'badge-danger'
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          {b.status === 'Booked' && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => handleMarkAttended(b)}
              >
                Mark Attended
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => handleCancelBooking(b)}
              >
                Cancel
              </button>
            </>
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <Link href="/admin/classes">Classes</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Bookings</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Class Roster & Reservations
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Inspect enrolled attendees, check off roster attendance, and process cancellations.
          </p>
        </div>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        searchPlaceholder="Search attendee or class..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Booked', value: 'Booked' },
          { label: 'Attended', value: 'Attended' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        exportFilename="ironpulse-class-roster"
      />
    </DashboardLayout>
  );
}
