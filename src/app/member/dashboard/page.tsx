'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { NotificationService } from '@/services/NotificationService';
import { Member, FitnessClass, ClassBooking, Announcement, AttendanceRecord } from '@/types';
import { formatDate } from '@/lib/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';

export default function MemberDashboardPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exercisesDone, setExercisesDone] = useState<Record<string, boolean>>({
    ex1: true,
    ex2: true,
    ex3: true,
    ex4: false,
  });

  const refreshData = () => {
    // Current demo member: Alex Morgan (mem-001)
    const allMembers = StorageService.getCollection<Member>('members');
    const curMember = allMembers.find((m) => m.id === 'mem-001') || allMembers[0];
    setMember(curMember);

    const allBookings = StorageService.getCollection<ClassBooking>('classBookings');
    const myBookings = allBookings.filter((b) => b.memberId === 'mem-001' && b.status === 'Booked');
    setBookings(myBookings);

    const allAnnouncements = StorageService.getCollection<Announcement>('announcements');
    setAnnouncements(allAnnouncements.filter((a) => a.isActive));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleQuickCheckIn = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      gymId: 'gym-001',
      branchId: 'branch-001',
      memberId: 'mem-001',
      memberName: member?.name || 'Alex Morgan',
      planName: member?.planName || 'Annual VIP All-Access',
      checkInTime: timeNow,
      checkOutTime: 'In Progress',
      status: 'Active',
      verifiedVia: 'QR Kiosk',
    };

    StorageService.saveItem('attendanceRecords', newRecord);

    NotificationService.notify({
      gymId: 'gym-001',
      targetUserId: 'usr-member-01',
      category: 'attendance',
      title: 'Facility Check-In Confirmed',
      message: `Welcome to IronPulse Downtown! Check-in recorded at ${timeNow}. Have a great workout!`,
    });

    toast.success('Access Gate Opened! Checked into Downtown Branch.');
  };

  const toggleExercise = (id: string) => {
    setExercisesDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.info(next[id] ? 'Exercise marked complete!' : 'Exercise marked pending');
      return next;
    });
  };

  const completedCount = Object.values(exercisesDone).filter(Boolean).length;
  const totalExercises = Object.keys(exercisesDone).length;

  return (
    <DashboardLayout portal="member">
      {/* Member Welcome Hero Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&fit=crop') center/cover",
          color: '#ffffff',
          marginBottom: '1.5rem',
          border: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="card-body" style={{ padding: '2.25rem 2rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--color-accent)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '0.75rem',
                }}
              >
                VIP ACTIVE ATHLETE
              </span>
              <h1 style={{ color: '#ffffff', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.25 }}>
                Welcome back, {member?.name?.split(' ')[0] || 'Alex'}! 💪
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: '580px', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                IronPulse Fitness Club — Downtown Branch. You have an active workout streak of{' '}
                <strong style={{ color: 'var(--color-accent)' }}>14 days</strong>! Keep crushing your goals.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-accent" onClick={handleQuickCheckIn} style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-qrcode" style={{ marginRight: '0.45rem' }} /> Quick Check-In
              </button>
              <Link
                href="/member/classes"
                className="btn btn-outline"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
              >
                <i className="fa-solid fa-calendar-plus" style={{ marginRight: '0.45rem' }} /> Book Class
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Member KPI Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa-solid fa-id-card" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Membership Validity</span>
            <span className="stat-value">192 Days Left</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-circle-check" /> {member?.planName || 'Annual VIP Pass'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa-solid fa-fire" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Attendance</span>
            <span className="stat-value">14 Visits</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-trend-up" /> Top 5% at club
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa-solid fa-dumbbell" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Current Weight</span>
            <span className="stat-value">81.3 kg</span>
            <span className="stat-change text-success">
              <i className="fa-solid fa-arrow-down" /> -3.2 kg (Goal: 75kg)
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming Classes</span>
            <span className="stat-value">{bookings.length} Booked</span>
            <span className="stat-change text-muted">Next: Tomorrow 07:00 AM</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">
                  <i className="fa-solid fa-dumbbell text-accent" style={{ marginRight: '0.5rem' }} />
                  Today&apos;s Workout Focus
                </h3>
                <span className="text-xs text-muted">Assigned by Coach David Miller &bull; 4-Day Hypertrophy Split</span>
              </div>
              <Link href="/member/workout-plan" className="btn btn-sm btn-outline">
                Full Plan <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem' }} />
              </Link>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-hover)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', margin: '0 0 0.2rem' }}>Push Day (Chest, Shoulders & Triceps)</h4>
                  <span className="text-xs text-muted">Target: 4 Exercises &bull; Approx. 55 mins</span>
                </div>
                <span className="badge badge-success">
                  {completedCount} / {totalExercises} Done
                </span>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                      <th style={{ width: '90px' }}>Status</th>
                      <th>Exercise</th>
                      <th>Sets & Reps</th>
                      <th>Target Load</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>1</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${exercisesDone.ex1 ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => toggleExercise('ex1')}
                        >
                          <i className={`fa-solid ${exercisesDone.ex1 ? 'fa-check' : 'fa-hourglass'}`} />{' '}
                          {exercisesDone.ex1 ? 'Done' : 'Pending'}
                        </button>
                      </td>
                      <td><strong>Barbell Bench Press</strong></td>
                      <td>4 sets &times; 8 reps</td>
                      <td>85 kg</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>2</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${exercisesDone.ex2 ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => toggleExercise('ex2')}
                        >
                          <i className={`fa-solid ${exercisesDone.ex2 ? 'fa-check' : 'fa-hourglass'}`} />{' '}
                          {exercisesDone.ex2 ? 'Done' : 'Pending'}
                        </button>
                      </td>
                      <td><strong>Incline Dumbbell Press</strong></td>
                      <td>3 sets &times; 10-12 reps</td>
                      <td>30 kg</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>3</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${exercisesDone.ex3 ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => toggleExercise('ex3')}
                        >
                          <i className={`fa-solid ${exercisesDone.ex3 ? 'fa-check' : 'fa-hourglass'}`} />{' '}
                          {exercisesDone.ex3 ? 'Done' : 'Pending'}
                        </button>
                      </td>
                      <td><strong>Military Overhead Press</strong></td>
                      <td>3 sets &times; 8-10 reps</td>
                      <td>52 kg</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>4</td>
                      <td>
                        <button
                          type="button"
                          className={`badge ${exercisesDone.ex4 ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => toggleExercise('ex4')}
                        >
                          <i className={`fa-solid ${exercisesDone.ex4 ? 'fa-check' : 'fa-hourglass'}`} />{' '}
                          {exercisesDone.ex4 ? 'Done' : 'Pending'}
                        </button>
                      </td>
                      <td><strong>Tricep Rope Pushdowns</strong></td>
                      <td>4 sets &times; 12-15 reps</td>
                      <td>25 kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Booked Classes */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <i className="fa-solid fa-calendar-days text-accent" style={{ marginRight: '0.5rem' }} />
                My Booked Classes
              </h3>
              <Link href="/member/my-bookings" className="btn btn-sm btn-outline">
                Manage All <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem' }} />
              </Link>
            </div>
            <div className="card-body">
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 0.75rem' }}>You have no upcoming fitness classes booked.</p>
                  <Link href="/member/classes" className="btn btn-primary btn-sm">
                    Browse Class Timetable
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.className}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }} />
                          {b.bookingDate} • Studio A • Coach {b.trainerName || 'Sarah Connor'}
                        </div>
                      </div>
                      <span className="badge badge-success">Booked</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Training Activity Recharts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fa-solid fa-chart-simple text-accent" style={{ marginRight: '0.5rem' }} />
                Weekly Workout Minutes & Consistency
              </h3>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', mins: 75 },
                      { day: 'Tue', mins: 60 },
                      { day: 'Wed', mins: 0 },
                      { day: 'Thu', mins: 80 },
                      { day: 'Fri', mins: 65 },
                      { day: 'Sat', mins: 90 },
                      { day: 'Sun', mins: 0 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} mins`, 'Workout Duration']}
                    />
                    <Bar dataKey="mins" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="card"
            style={{
              border: '1.5px solid var(--color-accent)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.12)',
            }}
          >
            <div
              className="card-header"
              style={{
                borderBottom: '1px dashed var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--color-accent)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <i className="fa-solid fa-id-card" /> Digital Gym Pass
              </span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
                ID: #{member?.id || 'MEM-101'}
              </span>
            </div>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
              <div
                className="avatar avatar-lg"
                style={{
                  margin: '0 auto 0.85rem',
                  width: '76px',
                  height: '76px',
                  border: '3px solid var(--color-accent)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt="Member Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800 }}>{member?.name || 'Alex Morgan'}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
                IronPulse Fitness Club &bull; Downtown Branch
              </p>

              <div
                style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-block',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <i className="fa-solid fa-qrcode" style={{ fontSize: '4.5rem', color: '#0f172a' }} />
                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginTop: '0.35rem', letterSpacing: '2px' }}>
                  IP-101-8492
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface-secondary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Membership Plan:</span>
                  <strong style={{ fontWeight: 700 }}>{member?.planName || 'Annual VIP All-Access'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Valid Through:</span>
                  <strong style={{ color: 'var(--color-success)', fontWeight: 700 }}>{member?.endDate || 'May 1, 2026'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Access Privileges:</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fa-solid fa-circle-check" /> 24/7 Keycard Active
                  </span>
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <Link href="/member/my-membership" className="btn btn-sm btn-outline" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <i className="fa-solid fa-id-badge" /> View Plan
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-accent"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 700 }}
                onClick={handleQuickCheckIn}
              >
                <i className="fa-solid fa-door-open" /> Check In
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fa-solid fa-bullhorn text-accent" style={{ marginRight: '0.5rem' }} />
                Club Announcements
              </h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {announcements.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No active announcements today.
                </div>
              ) : (
                announcements.slice(0, 2).map((a, idx) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '1rem',
                      borderBottom: idx === 0 ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{a.title}</strong>
                      <span className="text-xs text-muted">{formatDate(a.publishDate)}</span>
                    </div>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>
                      {a.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
