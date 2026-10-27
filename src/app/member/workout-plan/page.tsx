'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  load: string;
  tips: string;
  done: boolean;
}

interface WorkoutDay {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export default function MemberWorkoutPlanPage() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tipExercise, setTipExercise] = useState<Exercise | null>(null);

  const [days, setDays] = useState<WorkoutDay[]>([
    {
      id: 'day1',
      title: 'Monday (Push Day)',
      focus: 'Chest, Shoulders & Triceps',
      exercises: [
        {
          id: 'ex1',
          name: 'Barbell Flat Bench Press',
          sets: 4,
          reps: '8 reps',
          load: '85 kg',
          tips: 'Keep shoulder blades retracted and feet anchored firmly to the floor.',
          done: true,
        },
        {
          id: 'ex2',
          name: 'Incline Dumbbell Press',
          sets: 3,
          reps: '10-12 reps',
          load: '30 kg / hand',
          tips: 'Set bench to 30 degrees to minimize anterior deltoid dominance.',
          done: true,
        },
        {
          id: 'ex3',
          name: 'Seated Dumbbell Overhead Press',
          sets: 3,
          reps: '8-10 reps',
          load: '24 kg / hand',
          tips: 'Press in an arch and avoid flaring elbows 90 degrees outward.',
          done: true,
        },
        {
          id: 'ex4',
          name: 'Tricep Cable Rope Pushdowns',
          sets: 4,
          reps: '12-15 reps',
          load: '25 kg',
          tips: 'Pin elbows to your ribs and spread the rope apart at full extension.',
          done: false,
        },
      ],
    },
    {
      id: 'day2',
      title: 'Tuesday (Pull Day)',
      focus: 'Back, Lats & Biceps',
      exercises: [
        {
          id: 'ex5',
          name: 'Conventional Barbell Deadlift',
          sets: 4,
          reps: '5 reps',
          load: '125 kg',
          tips: 'Brace your core like taking a punch and pull slack out of the barbell before lifting.',
          done: false,
        },
        {
          id: 'ex6',
          name: 'Wide Grip Lat Pulldown',
          sets: 4,
          reps: '10 reps',
          load: '65 kg',
          tips: 'Drive through your elbows rather than pulling solely with forearms.',
          done: false,
        },
        {
          id: 'ex7',
          name: 'Chest-Supported Row',
          sets: 3,
          reps: '12 reps',
          load: '32 kg',
          tips: 'Squeeze the mid-traps and hold peak contraction for 1 second.',
          done: false,
        },
        {
          id: 'ex8',
          name: 'EZ-Bar Incline Bicep Curls',
          sets: 4,
          reps: '10-12 reps',
          load: '30 kg',
          tips: 'Keep wrists neutral and isolate the biceps with full stretch at the bottom.',
          done: false,
        },
      ],
    },
    {
      id: 'day3',
      title: 'Thursday (Leg Day)',
      focus: 'Quadriceps, Hamstrings & Calves',
      exercises: [
        {
          id: 'ex9',
          name: 'Barbell Back Squat',
          sets: 4,
          reps: '6-8 reps',
          load: '100 kg',
          tips: 'Descend to parallel, knees tracking in line with second toe.',
          done: false,
        },
        {
          id: 'ex10',
          name: 'Romanian Deadlift (RDL)',
          sets: 3,
          reps: '10 reps',
          load: '75 kg',
          tips: 'Hinge at the hips, keeping the barbell flush against your shins.',
          done: false,
        },
        {
          id: 'ex11',
          name: 'Leg Press',
          sets: 3,
          reps: '12 reps',
          load: '160 kg',
          tips: 'Do not lock out knees at top to maintain continuous tension.',
          done: false,
        },
        {
          id: 'ex12',
          name: 'Standing Calf Raises',
          sets: 4,
          reps: '15 reps',
          load: '65 kg',
          tips: 'Hold 2-second pause at bottom stretch to eliminate Achilles bounce.',
          done: false,
        },
      ],
    },
    {
      id: 'day4',
      title: 'Friday (Shoulders & Arms)',
      focus: 'Delts, Arms & Core',
      exercises: [
        {
          id: 'ex13',
          name: 'Dumbbell Lateral Raises',
          sets: 4,
          reps: '15 reps',
          load: '12 kg / hand',
          tips: 'Lead with elbows and avoid swinging torso for momentum.',
          done: false,
        },
        {
          id: 'ex14',
          name: 'Face Pulls',
          sets: 4,
          reps: '15 reps',
          load: '20 kg',
          tips: 'External rotate hands at the finish to hit the rear delts and rotator cuff.',
          done: false,
        },
        {
          id: 'ex15',
          name: 'Skull Crushers',
          sets: 3,
          reps: '10-12 reps',
          load: '32 kg',
          tips: 'Lower barbell towards forehead while keeping upper arms vertical.',
          done: false,
        },
        {
          id: 'ex16',
          name: 'Hanging Leg Raises',
          sets: 3,
          reps: '15 reps',
          load: 'Bodyweight',
          tips: 'Curl pelvis up towards sternum to recruit the lower abdominal wall.',
          done: false,
        },
      ],
    },
  ]);

  const currentDay = days[selectedDayIndex];
  const doneCount = currentDay.exercises.filter((e) => e.done).length;
  const totalCount = currentDay.exercises.length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  const toggleDone = (exerciseId: string) => {
    setDays((prev) => {
      const copy = [...prev];
      const cur = { ...copy[selectedDayIndex] };
      cur.exercises = cur.exercises.map((e) => {
        if (e.id === exerciseId) {
          const next = !e.done;
          toast.info(next ? `${e.name} marked completed!` : `${e.name} marked pending`);
          return { ...e, done: next };
        }
        return e;
      });
      copy[selectedDayIndex] = cur;
      return copy;
    });
  };

  const handleResetDayProgress = () => {
    setDays((prev) => {
      const copy = [...prev];
      const cur = { ...copy[selectedDayIndex] };
      cur.exercises = cur.exercises.map((e) => ({ ...e, done: false }));
      copy[selectedDayIndex] = cur;
      return copy;
    });
    toast.info('Session progress reset for today.');
  };

  const handleCompleteSession = () => {
    setDays((prev) => {
      const copy = [...prev];
      const cur = { ...copy[selectedDayIndex] };
      cur.exercises = cur.exercises.map((e) => ({ ...e, done: true }));
      copy[selectedDayIndex] = cur;
      return copy;
    });
    toast.success('Workout session completed! High five! 🔥 Check-in logged.');
  };

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Workout Plan</span>
          </div>
          <h1 className="page-title">Hypertrophy 4-Day Push/Pull/Legs Split</h1>
          <p className="page-subtitle">
            Designed by Coach David Miller &bull; Focus: Muscle Building & Progressive Overload
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            <i className="fa-solid fa-print" style={{ marginRight: '0.4rem' }} /> Print Routine
          </button>
          <button type="button" className="btn btn-primary" onClick={handleResetDayProgress}>
            <i className="fa-solid fa-arrow-rotate-right" style={{ marginRight: '0.4rem' }} /> Reset Today&apos;s Checks
          </button>
        </div>
      </div>

      {/* Workout Completion Progress Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div>
              <strong style={{ fontSize: '1rem' }}>
                Session Progress: {progressPercent}% Completed
              </strong>
              <span className="text-xs text-muted" style={{ display: 'block' }}>
                {doneCount} of {totalCount} exercises completed
              </span>
            </div>
            <span className={`badge ${progressPercent === 100 ? 'badge-success' : 'badge-warning'}`}>
              {progressPercent === 100 ? 'Workout Completed' : 'In Progress'}
            </span>
          </div>
          <div
            style={{
              height: '10px',
              backgroundColor: 'var(--bg-hover)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Schedule Day Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        {days.map((d, idx) => (
          <button
            key={d.id}
            type="button"
            className={`tab-btn ${selectedDayIndex === idx ? 'active' : ''}`}
            onClick={() => setSelectedDayIndex(idx)}
          >
            <i className="fa-solid fa-calendar-day" style={{ marginRight: '0.4rem' }} /> {d.title}
          </button>
        ))}
      </div>

      {/* Exercise List Table Card */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <h3 className="card-title">{currentDay.title}</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Focus: {currentDay.focus} &bull; Tap checkmark when each exercise is finished
            </p>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Done</th>
                  <th>Exercise Name</th>
                  <th>Target Sets</th>
                  <th>Reps</th>
                  <th>Target Load</th>
                  <th style={{ textAlign: 'right' }}>Form Tips</th>
                </tr>
              </thead>
              <tbody>
                {currentDay.exercises.map((ex, idx) => (
                  <tr key={ex.id} style={{ backgroundColor: ex.done ? 'rgba(16, 185, 129, 0.05)' : 'inherit' }}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={ex.done}
                        onChange={() => toggleDone(ex.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                      />
                    </td>
                    <td>
                      <strong style={{ textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--text-muted)' : 'inherit' }}>
                        {ex.name}
                      </strong>
                    </td>
                    <td>{ex.sets} sets</td>
                    <td>{ex.reps}</td>
                    <td><span className="badge badge-secondary">{ex.load}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setTipExercise(ex)}
                      >
                        <i className="fa-solid fa-circle-info text-primary" style={{ marginRight: '0.3rem' }} /> Coach Tips
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="card-footer"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}
        >
          <span className="text-xs text-muted">
            <i className="fa-solid fa-stopwatch text-accent" style={{ marginRight: '0.3rem' }} />
            Recommended rest between heavy compound sets: 90 - 120 seconds.
          </span>
          <button type="button" className="btn btn-sm btn-accent" onClick={handleCompleteSession}>
            <i className="fa-solid fa-flag-checkered" style={{ marginRight: '0.4rem' }} /> Finish Workout Session
          </button>
        </div>
      </div>

      {/* Form Tip Modal */}
      {tipExercise && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fa-solid fa-lightbulb text-warning" style={{ marginRight: '0.4rem' }} />
                Coach Execution Tips: {tipExercise.name}
              </h3>
              <button type="button" className="modal-close" onClick={() => setTipExercise(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Target Load:</strong> {tipExercise.load} &bull; <strong>Prescription:</strong> {tipExercise.sets} sets &times; {tipExercise.reps}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {tipExercise.tips}
                </p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setTipExercise(null)}>
                Got it, Coach!
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
