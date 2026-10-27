'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { useAuth } from '@/context/AuthContext';
import { WorkoutPlan, WorkoutDay, WorkoutExercise, Member, Trainer } from '@/types';
import { formatNumber, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

/**
 * Normalizes any workout plan into standard WorkoutDay array
 * to handle both legacy mock schemas and modern data structures
 */
const normalizePlanDays = (plan: WorkoutPlan | null | undefined): WorkoutDay[] => {
  if (!plan) return [];
  if (Array.isArray(plan.schedule) && plan.schedule.length > 0) {
    return plan.schedule.map((day, dIdx) => ({
      dayName: day.dayName || day.day || day.title || `Day ${dIdx + 1}`,
      exercises: Array.isArray(day.exercises)
        ? day.exercises.map((ex, eIdx) => ({
            id: ex.id || `ex_${dIdx}_${eIdx}`,
            name: ex.name || 'Exercise Routine',
            targetMuscle: ex.targetMuscle || ex.category || 'Compound Lift',
            category: ex.category || 'Strength',
            sets: Number(ex.sets) || 3,
            reps: String(ex.reps || '10-12'),
            restSeconds: Number(ex.restSeconds) || 60,
            weight: ex.weight || ex.load || '',
            load: ex.load || ex.weight || '',
            completed: Boolean(ex.completed || ex.isCompleted),
            isCompleted: Boolean(ex.completed || ex.isCompleted),
          }))
        : [],
    }));
  }

  if (Array.isArray(plan.weeklySchedule) && plan.weeklySchedule.length > 0) {
    return plan.weeklySchedule.map((item: any, dIdx: number) => ({
      dayName: item.dayName || item.day || item.title || `Day ${dIdx + 1}`,
      exercises: Array.isArray(item.exercises)
        ? item.exercises.map((ex: any, eIdx: number) => ({
            id: ex.id || `ex_${dIdx}_${eIdx}`,
            name: ex.name || 'Exercise Routine',
            targetMuscle: ex.targetMuscle || ex.focus || ex.category || 'Compound Lift',
            category: ex.category || 'Strength',
            sets: Number(ex.sets) || 3,
            reps: String(ex.reps || '10-12'),
            restSeconds: Number(ex.restSeconds) || 60,
            weight: ex.weight || ex.load || '',
            load: ex.load || ex.weight || '',
            completed: Boolean(ex.completed || ex.isCompleted),
            isCompleted: Boolean(ex.completed || ex.isCompleted),
          }))
        : [],
    }));
  }

  return [];
};

export default function AdminWorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'detail' | 'grid'>('detail');

  // Modals
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<WorkoutPlan | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState<'Hypertrophy' | 'Fat Loss' | 'Strength' | 'Endurance' | 'Mobility'>('Hypertrophy');
  const [trainerName, setTrainerName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [notes, setNotes] = useState('');
  const [formDays, setFormDays] = useState<WorkoutDay[]>([]);

  const refreshData = () => {
    const list = StorageService.getCollection<WorkoutPlan>('workoutPlans');
    setPlans(list);
    setMembers(DataScopeService.getMembers(user));
    setTrainers(DataScopeService.getTrainers(user));

    if (list.length > 0) {
      // Retain selection or select first
      setSelectedPlan((prev) => {
        if (!prev) return list[0];
        const match = list.find((p) => p.id === prev.id);
        return match || list[0];
      });
    } else {
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsub();
  }, [user]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.memberName || '').toLowerCase().includes(q) ||
        p.trainerName.toLowerCase().includes(q) ||
        (p.notes || '').toLowerCase().includes(q);

      const matchGoal = goalFilter === 'All' || p.goal === goalFilter;
      return matchSearch && matchGoal;
    });
  }, [plans, searchQuery, goalFilter]);

  const activeDays = useMemo(() => {
    return normalizePlanDays(selectedPlan);
  }, [selectedPlan]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setTitle('');
    setGoal('Hypertrophy');
    setTrainerName(trainers[0]?.name || 'Coach David Miller');
    setMemberId(members[0]?.id || '');
    setDurationWeeks(12);
    setNotes('Focus on steady progressive overload with deliberate tempo on eccentric contractions.');
    setFormDays([
      {
        dayName: 'Day 1: Upper Body Strength Split',
        exercises: [
          { id: 'ex_1', name: 'Barbell Flat Bench Press', targetMuscle: 'Chest', category: 'Strength', sets: 4, reps: '8-10', weight: '75 kg', restSeconds: 90 },
          { id: 'ex_2', name: 'Overhead Barbell Press', targetMuscle: 'Shoulders', category: 'Strength', sets: 3, reps: '8-10', weight: '45 kg', restSeconds: 90 },
          { id: 'ex_3', name: 'Incline Dumbbell Flyes', targetMuscle: 'Pectorals', category: 'Hypertrophy', sets: 3, reps: '12', weight: '16 kg', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Day 2: Lower Body Power & Posterior Chain',
        exercises: [
          { id: 'ex_4', name: 'Barbell Back Squat', targetMuscle: 'Quadriceps', category: 'Strength', sets: 4, reps: '8', weight: '95 kg', restSeconds: 120 },
          { id: 'ex_5', name: 'Romanian Deadlifts', targetMuscle: 'Hamstrings', category: 'Hypertrophy', sets: 3, reps: '10', weight: '75 kg', restSeconds: 90 },
        ],
      },
    ]);
    setEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setGoal((plan.goal as any) || 'Hypertrophy');
    setTrainerName(plan.trainerName);
    setMemberId(plan.memberId || '');
    setDurationWeeks(plan.durationWeeks || 12);
    setNotes(plan.notes || '');
    setFormDays(normalizePlanDays(plan));
    setEditModalOpen(true);
  };

  // Form Day Management
  const handleAddDay = () => {
    setFormDays((prev) => [
      ...prev,
      {
        dayName: `Day ${prev.length + 1}: Custom Training Split`,
        exercises: [
          {
            id: `ex_${Date.now()}`,
            name: 'Primary Compound Lift',
            targetMuscle: 'Target Muscle',
            category: 'Compound',
            sets: 3,
            reps: '10',
            weight: '50 kg',
            restSeconds: 60,
          },
        ],
      },
    ]);
  };

  const handleRemoveDay = (dayIdx: number) => {
    setFormDays((prev) => prev.filter((_, idx) => idx !== dayIdx));
  };

  const handleDayNameChange = (dayIdx: number, newName: string) => {
    setFormDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = { ...updated[dayIdx], dayName: newName };
      return updated;
    });
  };

  const handleAddExercise = (dayIdx: number) => {
    setFormDays((prev) => {
      const updated = [...prev];
      const targetDay = updated[dayIdx];
      const newEx: WorkoutExercise = {
        id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: 'New Exercise',
        targetMuscle: 'Primary Muscle',
        category: 'Strength',
        sets: 3,
        reps: '10-12',
        weight: '20 kg',
        restSeconds: 60,
      };
      updated[dayIdx] = {
        ...targetDay,
        exercises: [...(targetDay.exercises || []), newEx],
      };
      return updated;
    });
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    setFormDays((prev) => {
      const updated = [...prev];
      const targetDay = updated[dayIdx];
      updated[dayIdx] = {
        ...targetDay,
        exercises: targetDay.exercises.filter((_, idx) => idx !== exIdx),
      };
      return updated;
    });
  };

  const handleExerciseChange = (dayIdx: number, exIdx: number, field: keyof WorkoutExercise, value: any) => {
    setFormDays((prev) => {
      const updated = [...prev];
      const targetDay = updated[dayIdx];
      const targetEx = { ...targetDay.exercises[exIdx], [field]: value };
      const exCopy = [...targetDay.exercises];
      exCopy[exIdx] = targetEx;
      updated[dayIdx] = { ...targetDay, exercises: exCopy };
      return updated;
    });
  };

  // Save Workout Plan
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Plan title is required.');
      return;
    }

    const assignedMember = members.find((m) => m.id === memberId);

    const planToSave: WorkoutPlan = {
      id: editingPlan ? editingPlan.id : `wp_${Date.now()}`,
      gymId: editingPlan ? editingPlan.gymId : (user?.gymId || 'gym_1'),
      memberId: assignedMember?.id || editingPlan?.memberId,
      memberName: assignedMember?.name || editingPlan?.memberName || 'General Prescribed Template',
      trainerName: trainerName.trim() || 'Head Coach',
      title: title.trim(),
      goal,
      durationWeeks: Number(durationWeeks) || 12,
      schedule: formDays,
      weeklySchedule: formDays.map((d) => ({
        day: d.dayName,
        exercises: d.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || '',
          completed: ex.completed || false,
        })),
      })),
      createdDate: editingPlan ? editingPlan.createdDate : new Date().toISOString().split('T')[0],
      assignedDate: editingPlan?.assignedDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || 'Prescribed personalized routine.',
    };

    StorageService.saveItem<WorkoutPlan>('workoutPlans', planToSave);
    refreshData();
    setSelectedPlan(planToSave);
    setEditModalOpen(false);
    toast.success(editingPlan ? `Workout plan "${title}" updated.` : `Workout plan "${title}" created!`);
  };

  // Delete Workout Plan
  const confirmDelete = () => {
    if (!deleteConfirmPlan) return;
    StorageService.deleteItem('workoutPlans', deleteConfirmPlan.id);
    refreshData();
    setDeleteConfirmPlan(null);
    toast.success(`Workout plan "${deleteConfirmPlan.title}" removed.`);
  };

  // Print Routine
  const handlePrintRoutine = () => {
    if (!selectedPlan) return;
    window.print();
  };

  // Summary Metrics
  const uniqueTrainers = Array.from(new Set(plans.map((p) => p.trainerName))).filter(Boolean);
  const athleteCount = plans.filter((p) => p.memberName && p.memberName !== 'General Prescribed Template').length;
  const avgWeeks = plans.length > 0 ? Math.round(plans.reduce((acc, p) => acc + (p.durationWeeks || 8), 0) / plans.length) : 8;

  return (
    <DashboardLayout portal="admin">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">Workout Plans</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Prescribed Fitness Regimens & Splits
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Multi-day exercise routines, target muscle splits, prescription logs, and athlete assignments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="btn-group" style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'detail' ? 'btn-accent' : 'btn-secondary'}`}
              style={{ borderRadius: 0, border: 'none' }}
              onClick={() => setViewMode('detail')}
            >
              <i className="fa-solid fa-table-columns" style={{ marginRight: '0.35rem' }} />
              Split Detail View
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-accent' : 'btn-secondary'}`}
              style={{ borderRadius: 0, border: 'none' }}
              onClick={() => setViewMode('grid')}
            >
              <i className="fa-solid fa-grip" style={{ marginRight: '0.35rem' }} />
              View All Compatible Plans
            </button>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrintRoutine} disabled={!selectedPlan}>
            <i className="fa-solid fa-print" style={{ marginRight: '0.35rem' }} />
            Print Routine
          </button>

          <button type="button" className="btn btn-accent btn-sm" onClick={handleOpenCreate}>
            <i className="fa-solid fa-plus" style={{ marginRight: '0.35rem' }} />
            Create Routine
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            <i className="fa-solid fa-dumbbell" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Regimens
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNumber(plans.length)}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            <i className="fa-solid fa-users" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Athletes
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNumber(athleteCount)}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            <i className="fa-solid fa-user-ninja" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Coaching Authors
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNumber(uniqueTrainers.length)}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Duration
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{avgWeeks} Weeks</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            />
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search routines, coach, or assigned athlete..."
              style={{ paddingLeft: '2rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-control form-control-sm"
            style={{ width: '160px' }}
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
          >
            <option value="All">All Goals</option>
            <option value="Hypertrophy">Hypertrophy</option>
            <option value="Fat Loss">Fat Loss</option>
            <option value="Strength">Strength</option>
            <option value="Endurance">Endurance</option>
            <option value="Mobility">Mobility</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredPlans.length}</strong> of <strong>{plans.length}</strong> routines
        </div>
      </div>

      {/* Main Content: Split Detail View OR All Plans Grid View */}
      {viewMode === 'detail' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: '1.5rem' }}>
          {/* Left Column: Routines List */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Prescribed Routines</h3>
              <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                {filteredPlans.length} Available
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '720px' }}>
              {filteredPlans.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-dumbbell" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                  <div>No routines matching current search or filters.</div>
                </div>
              ) : (
                filteredPlans.map((p) => {
                  const isSelected = selectedPlan?.id === p.id;
                  const days = normalizePlanDays(p);
                  const totalExercises = days.reduce((acc, d) => acc + (d.exercises ? d.exercises.length : 0), 0);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)' }}>
                          {p.title}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Coach: <strong>{p.trainerName}</strong> &bull; {p.durationWeeks || 8} Wks
                      </div>

                      {p.memberName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.2rem' }}>
                          <i className="fa-solid fa-user-check" style={{ marginRight: '0.3rem' }} />
                          Assigned to: {p.memberName}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                          {p.goal}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                          {days.length} Days Split
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {totalExercises} Exercises
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Plan Detail View */}
          {selectedPlan ? (
            <div className="card" style={{ padding: '1.75rem' }}>
              {/* Routine Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{selectedPlan.title}</h2>
                    <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                      {selectedPlan.goal}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Prescribed by <strong>{selectedPlan.trainerName}</strong> &bull; Program Duration:{' '}
                    <strong>{selectedPlan.durationWeeks || 12} Weeks</strong>
                    {selectedPlan.memberName && (
                      <span>
                        {' '}&bull; Athlete: <strong>{selectedPlan.memberName}</strong>
                      </span>
                    )}
                  </div>
                  {selectedPlan.notes && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.55rem 0.85rem',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        borderLeft: '3px solid var(--color-accent)',
                      }}
                    >
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem', color: 'var(--color-accent)' }} />
                      <strong>Coach Cues:</strong> {selectedPlan.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(selectedPlan)}
                  >
                    <i className="fa-solid fa-pen" style={{ marginRight: '0.35rem' }} />
                    Edit Routine
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteConfirmPlan(selectedPlan)}
                  >
                    <i className="fa-solid fa-trash" style={{ marginRight: '0.35rem' }} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Day Schedules Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeDays.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No daily workout split scheduled for this regimen yet.</p>
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      style={{ marginTop: '0.75rem' }}
                      onClick={() => handleOpenEdit(selectedPlan)}
                    >
                      Add Training Days
                    </button>
                  </div>
                ) : (
                  activeDays.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.85rem',
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                          <i className="fa-solid fa-calendar-day" style={{ marginRight: '0.45rem' }} />
                          {day.dayName}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {(day.exercises || []).length} Prescribed Exercises
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%', fontSize: '0.85rem', minWidth: '550px' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                              <th>Exercise</th>
                              <th>Target Muscle</th>
                              <th>Sets & Reps</th>
                              <th>Target Weight</th>
                              <th>Rest Interval</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.exercises && day.exercises.length > 0 ? (
                              day.exercises.map((ex, eIdx) => (
                                <tr key={ex.id || eIdx}>
                                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {eIdx + 1}
                                  </td>
                                  <td>
                                    <strong>{ex.name}</strong>
                                    {ex.notes && (
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ex.notes}</div>
                                    )}
                                  </td>
                                  <td>
                                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                      {ex.targetMuscle || 'Compound'}
                                    </span>
                                  </td>
                                  <td>
                                    <strong>{ex.sets}</strong> sets &times; <strong>{ex.reps}</strong>
                                  </td>
                                  <td>{ex.weight || ex.load || '—'}</td>
                                  <td>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                      <i className="fa-solid fa-stopwatch" style={{ marginRight: '0.3rem', opacity: 0.7 }} />
                                      {ex.restSeconds || 60}s
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                  No exercises assigned to this day yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-clipboard-list" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }} />
              <h3>Select a Routine</h3>
              <p>Choose any workout regimen from the catalog on the left to review its full split, exercises, and prescription.</p>
            </div>
          )}
        </div>
      ) : (
        /* View All Compatible Plans: Modern Responsive Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredPlans.map((plan) => {
            const days = normalizePlanDays(plan);
            const totalExercises = days.reduce((acc, d) => acc + (d.exercises ? d.exercises.length : 0), 0);

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid var(--color-accent)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                      {plan.goal}
                    </span>
                    <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                      {plan.durationWeeks || 12} Weeks
                    </span>
                  </div>

                  <h3 style={{ margin: '0.35rem 0', fontSize: '1.15rem', fontWeight: 700 }}>{plan.title}</h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Author: <strong>{plan.trainerName}</strong>
                    {plan.memberName && (
                      <div>
                        Assigned: <strong>{plan.memberName}</strong>
                      </div>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      margin: '0 0 1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {plan.notes || 'Custom tailored progressive training regimen designed for optimal performance.'}
                  </p>

                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      <i className="fa-solid fa-calendar-days" style={{ marginRight: '0.35rem', color: 'var(--color-accent)' }} />
                      <strong>{days.length}</strong> Days Split
                    </span>
                    <span>
                      <i className="fa-solid fa-dumbbell" style={{ marginRight: '0.35rem', color: 'var(--color-accent)' }} />
                      <strong>{totalExercises}</strong> Total Exercises
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setViewMode('detail');
                    }}
                  >
                    <i className="fa-solid fa-eye" style={{ marginRight: '0.35rem' }} />
                    View Split
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(plan)}
                    title="Edit Routine"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteConfirmPlan(plan)}
                    title="Delete Routine"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Workout Plan Modal */}
      {isEditModalOpen && (
        <div
          className="modal-backdrop active"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          <div
            className="modal active"
            style={{
              width: '95%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div className="modal-header" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingPlan ? 'Edit Workout Plan Regimen' : 'Prescribe New Fitness Regimen'}
              </h3>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Regimen Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Hypertrophy 4-Day Push/Pull/Legs Split"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Goal</label>
                    <select
                      className="form-control"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as any)}
                    >
                      <option value="Hypertrophy">Hypertrophy</option>
                      <option value="Fat Loss">Fat Loss</option>
                      <option value="Strength">Strength</option>
                      <option value="Endurance">Endurance</option>
                      <option value="Mobility">Mobility</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Supervising Coach</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trainerName}
                      onChange={(e) => setTrainerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign to Member (Optional)</label>
                    <select
                      className="form-control"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                    >
                      <option value="">General Prescribed Template</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.planName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Program Duration (Weeks)</label>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      className="form-control"
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Coaching Notes & Prescriptions</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Tempo, rest guidelines, warm-up sets, and progressive overload cues..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Day-by-Day Exercises Editor */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                      <i className="fa-solid fa-list-check" style={{ marginRight: '0.45rem', color: 'var(--color-accent)' }} />
                      Training Days & Exercise Split ({formDays.length} Days)
                    </h4>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddDay}>
                      <i className="fa-solid fa-plus" style={{ marginRight: '0.35rem' }} />
                      Add Training Day
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formDays.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          padding: '1rem',
                          backgroundColor: 'var(--bg-surface-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ fontWeight: 700 }}
                            value={day.dayName}
                            onChange={(e) => handleDayNameChange(dIdx, e.target.value)}
                            placeholder="e.g. Day 1: Push Day (Chest & Shoulders)"
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.55rem' }}
                            onClick={() => handleRemoveDay(dIdx)}
                            title="Remove Day"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>

                        {/* Exercise rows for this day */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {day.exercises.map((ex, exIdx) => (
                            <div
                              key={ex.id || exIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 40px',
                                gap: '0.5rem',
                                alignItems: 'center',
                                backgroundColor: 'var(--bg-surface)',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                              }}
                            >
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Exercise Name"
                                value={ex.name}
                                onChange={(e) => handleExerciseChange(dIdx, exIdx, 'name', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Target Muscle"
                                value={ex.targetMuscle || ''}
                                onChange={(e) => handleExerciseChange(dIdx, exIdx, 'targetMuscle', e.target.value)}
                              />
                              <input
                                type="number"
                                min={1}
                                className="form-control form-control-sm"
                                placeholder="Sets"
                                value={ex.sets}
                                onChange={(e) => handleExerciseChange(dIdx, exIdx, 'sets', Number(e.target.value))}
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Reps"
                                value={ex.reps}
                                onChange={(e) => handleExerciseChange(dIdx, exIdx, 'reps', e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Weight/Load"
                                value={ex.weight || ex.load || ''}
                                onChange={(e) => handleExerciseChange(dIdx, exIdx, 'weight', e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', color: 'var(--color-danger)' }}
                                onClick={() => handleRemoveExercise(dIdx, exIdx)}
                              >
                                <i className="fa-solid fa-times" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleAddExercise(dIdx)}
                        >
                          <i className="fa-solid fa-plus" style={{ marginRight: '0.25rem' }} />
                          Add Exercise to {day.dayName || `Day ${dIdx + 1}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingPlan ? 'Save Changes' : 'Prescribe Regimen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPlan && (
        <div
          className="modal-backdrop active"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="modal active" style={{ width: '90%', maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>
                Remove Workout Plan
              </h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove the prescribed routine <strong>&quot;{deleteConfirmPlan.title}&quot;</strong>?
                This action will unassign the plan from any linked athletes.
              </p>
            </div>
            <div
              className="modal-footer"
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}
            >
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmPlan(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
