'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { ClassBooking, FitnessClass } from '@/types';
import { toast } from 'sonner';

export default function MemberMyBookingsPage() {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'Booked' | 'Attended' | 'Cancelled'>('Booked');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Rating modal state
  const [ratingBooking, setRatingBooking] = useState<ClassBooking | null>(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewText, setReviewText] = useState('Great energy and coaching on proper form!');

  const refreshData = () => {
    const all = StorageService.getCollection<ClassBooking>('classBookings');
    const myBookings = all.filter((b) => b.memberId === 'mem-001' || b.memberName?.includes('Alex'));
    setBookings(myBookings);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCancelBooking = (booking: ClassBooking) => {
    const updated: ClassBooking = {
      ...booking,
      status: 'Cancelled',
    };
    StorageService.saveItem('classBookings', updated);

    // Decrement class enrolled count if available
    if (booking.classId) {
      const cls = StorageService.getItemById<FitnessClass>('classes', booking.classId);
      if (cls && (cls.enrolledCount || 0) > 0) {
        cls.enrolledCount = (cls.enrolledCount || 0) - 1;
        StorageService.saveItem('classes', cls);
      }
    }

    toast.info(`Reservation for ${booking.className} cancelled and spot released.`);
    refreshData();
  };

  const handleSaveRating = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Thank you! Submitted ${starCount}-star rating for Coach ${ratingBooking?.trainerName}.`);
    setRatingBooking(null);
  };

  const filteredBookings = bookings
    .filter((b) => {
      const matchesTab = b.status?.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch =
        search === '' ||
        b.className.toLowerCase().includes(search.toLowerCase()) ||
        b.trainerName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.className.localeCompare(b.className);
      if (sortBy === 'date_asc') return (a.bookingDate || '').localeCompare(b.bookingDate || '');
      return (b.bookingDate || '').localeCompare(a.bookingDate || '');
    });

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">My Bookings</span>
          </div>
          <h1 className="page-title">My Class Bookings</h1>
          <p className="page-subtitle">
            Manage upcoming session spots, cancellations, and past class attendance records.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/member/classes" className="btn btn-accent">
            <i className="fa-solid fa-plus" style={{ marginRight: '0.4rem' }} /> Book Another Class
          </Link>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
              placeholder="Search class, ID, coach..."
              style={{ paddingLeft: '34px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select form-select-sm"
              style={{ width: '170px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="name_asc">Class Name (A-Z)</option>
            </select>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setSortBy('date_desc');
              }}
              title="Reset search & sort"
            >
              <i className="fa-solid fa-arrow-rotate-left" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'Booked' ? 'active' : ''}`}
          onClick={() => setActiveTab('Booked')}
        >
          <i className="fa-solid fa-calendar-check" style={{ marginRight: '0.4rem' }} /> Upcoming Bookings
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'Attended' ? 'active' : ''}`}
          onClick={() => setActiveTab('Attended')}
        >
          <i className="fa-solid fa-circle-check" style={{ marginRight: '0.4rem' }} /> Past Attended
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('Cancelled')}
        >
          <i className="fa-solid fa-ban" style={{ marginRight: '0.4rem' }} /> Cancelled
        </button>
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredBookings.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-regular fa-calendar-xmark text-muted" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} />
            <h3>No Bookings in this Category</h3>
            <p className="text-muted text-sm">
              You do not have any {activeTab.toLowerCase()} fitness classes matching the current view.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/member/classes" className="btn btn-primary btn-sm">
                Browse Classes & Timetable
              </Link>
            </div>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)',
                    fontSize: '1.25rem',
                  }}
                >
                  <i className="fa-solid fa-dumbbell" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{b.className}</h3>
                    <span
                      className={`badge ${
                        b.status === 'Booked'
                          ? 'badge-success'
                          : b.status === 'Attended'
                          ? 'badge-primary'
                          : 'badge-danger'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>
                      <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }} /> {b.bookingDate}
                    </span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>
                      <i className="fa-solid fa-user-tie" style={{ marginRight: '0.3rem' }} /> Coach {b.trainerName}
                    </span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>Booking ID: #{b.id}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {b.status === 'Booked' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm text-danger"
                    onClick={() => handleCancelBooking(b)}
                  >
                    <i className="fa-solid fa-xmark" style={{ marginRight: '0.3rem' }} /> Cancel Spot
                  </button>
                )}
                {b.status === 'Attended' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRatingBooking(b)}
                  >
                    <i className="fa-solid fa-star text-warning" style={{ marginRight: '0.3rem' }} /> Rate Coach
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rate Coach Modal */}
      {ratingBooking && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-star text-warning" style={{ marginRight: '0.4rem' }} />
                Rate & Review Session
              </h3>
              <button type="button" className="modal-close" onClick={() => setRatingBooking(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveRating}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p className="text-sm text-muted" style={{ margin: 0 }}>
                  How was your session with <strong>Coach {ratingBooking.trainerName}</strong> in {ratingBooking.className}?
                </p>

                <div style={{ display: 'flex', justifySelf: 'center', gap: '0.75rem', fontSize: '1.75rem', color: '#f59e0b', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fa-star ${star <= starCount ? 'fa-solid' : 'fa-regular'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setStarCount(star)}
                    />
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Feedback for Instructor</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRatingBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
