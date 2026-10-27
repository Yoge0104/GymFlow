'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { FitnessClass, Trainer, Branch } from '@/types';
import { toast } from 'sonner';

export default function AdminClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<FitnessClass | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [branchId, setBranchId] = useState('br_1');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('07:00 AM');
  const [endTime, setEndTime] = useState('08:00 AM');
  const [capacity, setCapacity] = useState(20);
  const [room, setRoom] = useState('Studio A');
  const [status, setStatus] = useState<FitnessClass['status']>('Scheduled');

  const refreshData = () => {
    setClasses(DataScopeService.getClasses(user));
    setTrainers(DataScopeService.getTrainers(user));
    setBranches(DataScopeService.getBranches(user));
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setTrainerId(trainers[0]?.id || '');
    setBranchId(branches[0]?.id || 'br_1');
    setDayOfWeek('Monday');
    setStartTime('07:00 AM');
    setEndTime('08:00 AM');
    setCapacity(20);
    setRoom('Studio A');
    setStatus('Scheduled');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: FitnessClass) => {
    setEditingClass(c);
    setName(c.name);
    setTrainerId(c.trainerId);
    setBranchId(c.branchId || branches[0]?.id || 'br_1');
    setDayOfWeek(c.dayOfWeek);
    setStartTime(c.startTime);
    setEndTime(c.endTime);
    setCapacity(c.capacity);
    setRoom(c.room);
    setStatus(c.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Class title is required.');
      return;
    }

    const trainer = trainers.find((t) => t.id === trainerId) || trainers[0];

    const classToSave: FitnessClass = {
      id: editingClass ? editingClass.id : `cls_${Date.now()}`,
      gymId: editingClass ? editingClass.gymId : (user?.gymId || 'gym_1'),
      branchId: branchId || 'br_1',
      name: name.trim(),
      category: editingClass?.category || 'Strength',
      trainerId: trainer?.id || 'trn_1',
      trainerName: trainer?.name || 'Head Coach',
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes: editingClass?.durationMinutes || 60,
      capacity: Number(capacity),
      enrolledCount: editingClass ? editingClass.enrolledCount : 0,
      room,
      status,
      description: editingClass?.description || 'High-energy instructor-led group workout.',
    };

    StorageService.saveItem<FitnessClass>('classes', classToSave);
    refreshData();
    setModalOpen(false);
    toast.success(editingClass ? `Group class "${name}" updated.` : `Group class "${name}" scheduled.`);
  };

  const handleDelete = (c: FitnessClass) => {
    if (confirm(`Cancel or delete scheduled group class "${c.name}"?`)) {
      StorageService.deleteItem('classes', c.id);
      refreshData();
      toast.success(`Class "${c.name}" removed.`);
    }
  };

  const columns: Column<FitnessClass>[] = [
    {
      key: 'name',
      header: 'Group Class',
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ fontWeight: 700 }}>{c.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.room}</div>
        </div>
      ),
    },
    {
      key: 'trainerName',
      header: 'Assigned Instructor',
      sortable: true,
      render: (c) => <span>{c.trainerName}</span>,
    },
    {
      key: 'schedule',
      header: 'Weekly Schedule',
      render: (c) => <span>{c.dayOfWeek} at {c.startTime}</span>,
    },
    {
      key: 'capacity',
      header: 'Booked / Cap',
      sortable: true,
      render: (c) => <span>{c.enrolledCount} / {c.capacity}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c) => (
        <span
          className={`badge ${
            c.status === 'Scheduled'
              ? 'badge-success'
              : c.status === 'In-Progress'
              ? 'badge-primary'
              : c.status === 'Completed'
              ? 'badge-secondary'
              : 'badge-danger'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="classes.manage">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleOpenEdit(c)}
            >
              <i className="fa-solid fa-pen" /> Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
              onClick={() => handleDelete(c)}
              title="Delete class"
            >
              <i className="fa-solid fa-trash" />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Classes</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Group Fitness Classes & Timetable
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Weekly session scheduling, room allocations, instructor assignments, and capacity quotas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/class-bookings" className="btn btn-secondary">
            <i className="fa-solid fa-book-bookmark" /> Roster Bookings
          </Link>
          <PermissionGate permission="classes.manage">
            <button type="button" className="btn btn-accent" onClick={handleOpenAdd}>
              <i className="fa-solid fa-plus" /> Schedule Class
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={classes}
        columns={columns}
        searchPlaceholder="Search classes by name, trainer..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Scheduled', value: 'Scheduled' },
          { label: 'In-Progress', value: 'In-Progress' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        exportFilename="ironpulse-classes-timetable"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '520px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingClass ? `Edit Class: ${editingClass.name}` : 'Schedule Group Fitness Class'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Class Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sunrise Yoga Flow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Instructor Coach</label>
                    <select className="form-control" value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch Location</label>
                    <select className="form-control" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <select className="form-control" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Studio Room</label>
                    <input
                      type="text"
                      className="form-control"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingClass ? 'Save Changes' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
