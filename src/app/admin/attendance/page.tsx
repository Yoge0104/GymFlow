'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { AttendanceRecord, Member } from '@/types';
import { formatDateTime } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchMember, setSearchMember] = useState('');

  const refreshData = () => {
    setAttendance(DataScopeService.getAttendance(user));
    setMembers(DataScopeService.getMembers(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleCheckInMember = (m: Member, method: 'QR Kiosk' | 'Manual Reception' = 'Manual Reception') => {
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      gymId: 'gym_1',
      branchId: m.branchId || 'br_1',
      memberId: m.id,
      memberName: m.name,
      planName: m.planName,
      checkInTime: new Date().toISOString(),
      status: 'Active',
      verifiedVia: method,
    };

    StorageService.saveItem<AttendanceRecord>('attendance', newRecord);
    m.totalVisits = (m.totalVisits || 0) + 1;
    StorageService.saveItem('members', m);

    refreshData();
    toast.success(`Check-In Approved: ${m.name} (${m.planName})!`);
  };

  const handleCheckOut = (rec: AttendanceRecord) => {
    rec.status = 'Completed';
    rec.checkOutTime = new Date().toISOString();
    StorageService.saveItem('attendance', rec);
    refreshData();
    toast.info(`Checked out ${rec.memberName}`);
  };

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return false;
    const q = searchMember.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'memberName',
      header: 'Athlete Name',
      sortable: true,
      render: (rec) => (
        <div>
          <div style={{ fontWeight: 700 }}>{rec.memberName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {rec.memberId}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Membership Tier',
      sortable: true,
      render: (rec) => <span className="badge badge-secondary">{rec.planName}</span>,
    },
    {
      key: 'checkInTime',
      header: 'Check-In Timestamp',
      sortable: true,
      render: (rec) => <span>{formatDateTime(rec.checkInTime)}</span>,
    },
    {
      key: 'verifiedVia',
      header: 'Verified Via',
      sortable: true,
      render: (rec) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.verifiedVia}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (rec) => (
        <span className={`badge ${rec.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
          {rec.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rec) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          {rec.status === 'Active' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleCheckOut(rec)}
            >
              Check Out
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm btn-danger"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
            title="Remove record"
            onClick={() => {
              StorageService.deleteItem('attendance', rec.id);
              refreshData();
              toast.success('Attendance record removed.');
            }}
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Attendance</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Reception Desk Check-In Kiosk
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Real-time athlete barcode/QR validation, walk-in check-in, and daily floor log.
          </p>
        </div>
      </div>

      {/* Kiosk Scanner & Quick Verification Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Quick Search & Check In */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.15rem', fontWeight: 700 }}>
            <i className="fa-solid fa-magnifying-glass text-accent" style={{ marginRight: '0.4rem' }} /> Manual Athlete Check-In
          </h3>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search athlete by name, email, or member ID (e.g. Alex Morgan, mem_101)..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
            />
          </div>

          {filteredMembers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{m.name}</strong> &bull; <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.planName}</span>
                  </div>
                  <PermissionGate permission="attendance.check_in">
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={() => {
                        handleCheckInMember(m, 'Manual Reception');
                        setSearchMember('');
                      }}
                    >
                      Check In Now
                    </button>
                  </PermissionGate>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simulated QR Self-Service Kiosk */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}
          >
            <i className="fa-solid fa-qrcode" />
          </div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700 }}>QR Self-Service Kiosk</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Simulate member scanning their digital key card at the front turnstile.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              const alex = members.find((m) => m.id === 'mem_101') || members[0];
              if (alex) handleCheckInMember(alex, 'QR Kiosk');
            }}
          >
            <i className="fa-solid fa-barcode" /> Simulate Alex Morgan Scan
          </button>
        </div>
      </div>

      {/* Attendance History Table */}
      <DataTable
        data={attendance}
        columns={columns}
        searchPlaceholder="Filter today's attendance logs..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Active on Floor', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
        ]}
        exportFilename="ironpulse-attendance-log"
      />
    </DashboardLayout>
  );
}
