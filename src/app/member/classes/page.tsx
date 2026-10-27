'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { NotificationService } from '@/services/NotificationService';
import { FitnessClass, ClassBooking } from '@/types';
import { toast } from 'sonner';

export default function MemberClassesPage() {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [bookedClassIds, setBookedClassIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time_asc');

  // Booking confirmation modal
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);

  const refreshData = () => {
    const list = StorageService.getCollection<FitnessClass>('classes');
    setClasses(list.filter((c) => c.status === 'active'));

    const bookings = StorageService.getCollection<ClassBooking>('classBookings');
    const myConfirmed = bookings
      .filter((b) => b.memberId === 'mem-001' && b.status === 'Booked')
      .map((b) => b.classId);
    setBookedClassIds(new Set(myConfirmed));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleBookSpot = () => {
    if (!selectedClass) return;

    const newBooking: ClassBooking = {
      id: `cb_${Date.now()}`,
      gymId: 'gym-001',
      classId: selectedClass.id,
      className: selectedClass.name,
      memberId: 'mem-001',
      memberName: 'Alex Morgan',
      trainerName: selectedClass.trainerName,
      date: 'Tomorrow',
      time: selectedClass.startTime,
      bookingDate: `${selectedClass.dayOfWeek || 'Tomorrow'} at ${selectedClass.startTime}`,
      status: 'Booked',
    };

    StorageService.saveItem('classBookings', newBooking);

    // Increment enrolled count
    const updatedClass: FitnessClass = {
      ...selectedClass,
      enrolledCount: (selectedClass.enrolledCount || 0) + 1,
    };
    StorageService.saveItem('classes', updatedClass);

    NotificationService.notify({
      gymId: 'gym-001',
      targetUserId: 'usr-member-01',
      category: 'classes',
      title: 'Class Booking Confirmed!',
      message: `You are booked for ${selectedClass.name} with Coach ${selectedClass.trainerName}. See you there!`,
      linkUrl: '/member/my-bookings',
    });

    toast.success(`Spot reserved for ${selectedClass.name}!`);
    setSelectedClass(null);
    refreshData();
  };

  const resetFilters = () => {
    setSearch('');
    setActiveCategory('All');
    setDayFilter('All');
    setAvailFilter('all');
    setSortBy('time_asc');
  };

  const filteredClasses = classes
    .filter((c) => {
      const matchSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.trainerName.toLowerCase().includes(search.toLowerCase()) ||
        c.room.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        activeCategory === 'All' ||
        (c.category && c.category.toLowerCase().includes(activeCategory.toLowerCase()));

      const matchDay = dayFilter === 'All' || c.dayOfWeek === dayFilter;

      const spotsLeft = Math.max(0, (c.capacity || 20) - (c.enrolledCount || 0));
      let matchAvail = true;
      if (availFilter === 'open') matchAvail = spotsLeft > 0;
      else if (availFilter === 'fast') matchAvail = spotsLeft > 0 && spotsLeft <= 3;

      return matchSearch && matchCat && matchDay && matchAvail;
    })
    .sort((a, b) => {
      if (sortBy === 'time_asc') return (a.startTime || '').localeCompare(b.startTime || '');
      if (sortBy === 'time_desc') return (b.startTime || '').localeCompare(a.startTime || '');
      if (sortBy === 'spots_desc') {
        const spotsA = Math.max(0, (a.capacity || 20) - (a.enrolledCount || 0));
        const spotsB = Math.max(0, (b.capacity || 20) - (b.enrolledCount || 0));
        return spotsB - spotsA;
      }
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Classes & Timetable</span>
          </div>
          <h1 className="page-title">Group Fitness Classes</h1>
          <p className="page-subtitle">
            Reserve spots in instructor-led HIIT, strength, spin, and mobility sessions.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/member/my-bookings" className="btn btn-outline">
            <i className="fa-solid fa-bookmark" style={{ marginRight: '0.4rem' }} /> View My Bookings
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '320px' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search class or coach..."
                style={{ paddingLeft: '34px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select form-select-sm"
                style={{ width: '130px' }}
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <option value="All">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: '140px' }}
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
              >
                <option value="all">All Seats</option>
                <option value="open">Seats Open</option>
                <option value="fast">Filling Fast (≤3)</option>
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: '160px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="time_asc">Time (Earliest)</option>
                <option value="time_desc">Time (Latest)</option>
                <option value="spots_desc">Spots (Most Open)</option>
                <option value="name_asc">Name (A-Z)</option>
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

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'HIIT', 'Strength', 'Yoga', 'Spin', 'Boxing'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? 'All Classes' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="fa-solid fa-calendar-xmark text-muted" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} />
          <h3>No Classes Found</h3>
          <p className="text-muted text-sm">No group sessions match the selected day or category filters.</p>
        </div>
      ) : (
        <div
          className="classes-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}
        >
          {filteredClasses.map((c) => {
            const isBooked = bookedClassIds.has(c.id);
            const spotsLeft = Math.max(0, (c.capacity || 20) - (c.enrolledCount || 0));
            const isFull = spotsLeft === 0;

            return (
              <div
                key={c.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderTop: '4px solid var(--color-accent)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', minHeight: '26px' }}>
                    <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>
                      {c.category || 'Fitness'}
                    </span>
                    <span className={`badge ${spotsLeft <= 3 ? 'badge-danger' : 'badge-success'}`}>
                      {isFull ? 'Class Full' : `${spotsLeft} spots left`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem', minHeight: '32px' }}>
                    {c.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div
                      className="avatar avatar-xs"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden' }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                        alt="Trainer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Coach {c.trainerName}</span>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      marginTop: 'auto',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        <i className="fa-solid fa-calendar-day text-accent" />
                        {c.dayOfWeek || 'Weekday'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{c.durationMinutes || 50} mins</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-clock text-accent" />
                      <span>{c.startTime} – {c.endTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-location-dot text-accent" />
                      <span>{c.room || 'Main Studio'}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', background: 'var(--bg-surface)' }}>
                  {isBooked ? (
                    <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', fontWeight: 700 }} disabled>
                      <i className="fa-solid fa-circle-check text-success" style={{ marginRight: '0.3rem' }} /> Booked
                    </button>
                  ) : isFull ? (
                    <button type="button" className="btn btn-outline btn-sm" style={{ width: '100%', fontWeight: 700 }} disabled>
                      Full Capacity
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      style={{ width: '100%', fontWeight: 700 }}
                      onClick={() => setSelectedClass(c)}
                    >
                      Reserve Spot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedClass && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-calendar-check text-accent" style={{ marginRight: '0.4rem' }} />
                Confirm Class Reservation
              </h3>
              <button type="button" className="modal-close" onClick={() => setSelectedClass(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{selectedClass.name}</h4>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Coach:</strong> {selectedClass.trainerName}</div>
                  <div><strong>When:</strong> {selectedClass.dayOfWeek} at {selectedClass.startTime} ({selectedClass.durationMinutes || 50} mins)</div>
                  <div><strong>Studio:</strong> {selectedClass.room}</div>
                  <div><strong>Cost:</strong> <span className="text-success font-bold">Included in VIP Membership ($0.00)</span></div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Please arrive at least 5 minutes before start. Cancellations can be made up to 2 hours prior without strike.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedClass(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-accent" onClick={handleBookSpot}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
