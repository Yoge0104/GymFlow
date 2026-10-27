'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { Member, PaymentRecord, AttendanceRecord, WorkoutPlan } from '@/types';
import { toast } from 'sonner';

export default function AdminMemberDetails() {
  const [member, setMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'membership' | 'attendance' | 'payments' | 'workout'>('overview');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    const members = StorageService.getCollection<Member>('members');
    const target = members.find((m) => m.id === 'mem_101') || members[0];
    setMember(target);

    const p = StorageService.getCollection<PaymentRecord>('payments');
    setPayments(p.filter((x) => x.memberId === target?.id));

    const a = StorageService.getCollection<AttendanceRecord>('attendance');
    setAttendance(a.filter((x) => x.memberId === target?.id));

    const w = StorageService.getCollection<WorkoutPlan>('workoutPlans');
    setWorkout(w[0] || null);
  }, []);

  const handleSimulateCheckIn = () => {
    if (!member) return;
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      gymId: member.gymId,
      branchId: member.branchId,
      memberId: member.id,
      memberName: member.name,
      planName: member.planName,
      checkInTime: new Date().toISOString(),
      status: 'Active',
      verifiedVia: 'Manual Reception',
    };
    StorageService.saveItem<AttendanceRecord>('attendance', newRecord);
    setAttendance((prev) => [newRecord, ...prev]);
    toast.success(`Checked in ${member.name} for today's session.`);
  };

  const handleRenew = () => {
    if (!member) return;
    member.endDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    member.status = 'Active';
    StorageService.saveItem('members', member);
    setMember({ ...member });
    toast.success(`Membership renewed for 1 year until ${member.endDate}!`);
  };

  if (!member) return null;

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <Link href="/admin/members">Members</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">{member.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              {member.name}
            </h1>
            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
              {member.status.toUpperCase()}
            </span>
          </div>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            ID: {member.id} &bull; Downtown Branch Flagship &bull; {member.planName}
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-outline-accent" onClick={handleSimulateCheckIn}>
            <i className="fa-solid fa-qrcode" /> Quick Check-In Today
          </button>
          <button type="button" className="btn btn-accent" onClick={handleRenew}>
            <i className="fa-solid fa-arrows-rotate" /> Renew Membership
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview', icon: 'fa-solid fa-user' },
          { key: 'membership', label: 'Membership Plan', icon: 'fa-solid fa-id-card' },
          { key: 'attendance', label: 'Attendance Log', icon: 'fa-solid fa-calendar-check' },
          { key: 'payments', label: 'Billing & Receipts', icon: 'fa-solid fa-receipt' },
          { key: 'workout', label: 'Assigned Routine', icon: 'fa-solid fa-dumbbell' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <i className={tab.icon} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700 }}>Personal File</h3>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="avatar avatar-xl">
                <img src={member.avatar} alt={member.name} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem' }}>{member.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div><strong>Assigned Coach:</strong> <span style={{ color: 'var(--text-muted)' }}>David Miller</span></div>
              <div><strong>Emergency Contact:</strong> <span style={{ color: 'var(--text-muted)' }}>{member.emergencyContact}</span></div>
              <div><strong>Address:</strong> <span style={{ color: 'var(--text-muted)' }}>{member.address}</span></div>
              <div><strong>Date of Birth:</strong> <span style={{ color: 'var(--text-muted)' }}>{member.dob}</span></div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700 }}>Fitness Metrics & Streak</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current Weight
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{member.weight || 81.3} kg</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>Target: {member.targetWeight || 75} kg</span>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Monthly Visits
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>14 visits</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>Streak: 4 days</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Alex is enrolled in the 12-week hypertrophy regimen with coach David Miller. Active VIP gym privileges enabled.
            </div>
          </div>
        </div>
      )}

      {/* Tab: Membership */}
      {activeTab === 'membership' && (
        <div className="card" style={{ padding: '1.5rem', maxWidth: '650px' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 700 }}>Active Membership Pass</h3>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.85rem' }}>{member.planName}</span>
              <strong style={{ fontSize: '1.25rem' }}>$699.00 / yr</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Duration: 12 Months &bull; Access: All IronPulse Branches &bull; Locker Included
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Start Date:</span>
              <div><strong>{member.startDate}</strong></div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Expiry Date:</span>
              <div><strong>{member.endDate}</strong></div>
            </div>
          </div>

          <button type="button" className="btn btn-accent" onClick={handleRenew}>
            <i className="fa-solid fa-arrows-rotate" /> Renew Plan for 1 Year
          </button>
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Check-In Attendance History</h3>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Check-In Date & Time</th>
                  <th>Branch Location</th>
                  <th>Verification Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No check-in history logged yet.</td></tr>
                ) : (
                  attendance.map((rec) => (
                    <tr key={rec.id}>
                      <td>{new Date(rec.checkInTime).toLocaleString()}</td>
                      <td>Downtown Flagship</td>
                      <td>{rec.verifiedVia}</td>
                      <td><span className="badge badge-success">{rec.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Payment & Invoice History</h3>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Receipt #</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No payment records found.</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.transactionId}</code></td>
                      <td><strong>${p.amount.toFixed(2)}</strong></td>
                      <td>{p.date}</td>
                      <td><span className="badge badge-secondary">{p.method}</span></td>
                      <td><span className="badge badge-success">{p.status}</span></td>
                      <td>{p.receiptNumber}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Workout */}
      {activeTab === 'workout' && workout && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>{workout.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Goal: {workout.goal} &bull; Coach: {workout.trainerName} &bull; Duration: {workout.durationWeeks} Weeks
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {((workout.schedule && workout.schedule.length > 0)
              ? workout.schedule
              : (workout.weeklySchedule
                  ? workout.weeklySchedule.map((d: any, idx: number) => ({
                      dayName: d.dayName || d.day || `Day ${idx + 1}`,
                      exercises: d.exercises || [],
                    }))
                  : [])
            ).map((day, dIdx) => (
              <div key={dIdx} style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--color-accent)' }}>{day.dayName}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(day.exercises || []).map((ex: any, eIdx: number) => (
                    <div key={ex.id || eIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color-subtle)' }}>
                      <span><strong>{ex.name}</strong> {ex.targetMuscle ? `(${ex.targetMuscle})` : ''}</span>
                      <span>{ex.sets} sets &times; {ex.reps} reps {ex.restSeconds ? `(${ex.restSeconds}s rest)` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
