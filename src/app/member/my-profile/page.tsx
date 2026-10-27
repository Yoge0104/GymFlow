'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { Member } from '@/types';
import { toast } from 'sonner';

export default function MemberProfilePage() {
  const [member, setMember] = useState<Member | null>(null);

  // Form State
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dateOfBirth, setDateOfBirth] = useState('1994-08-14');
  const [gender, setGender] = useState('Male');
  const [branch, setBranch] = useState('Downtown Flagship');
  const [emergencyContact, setEmergencyContact] = useState('Sarah Morgan (+91 98765 43211)');
  const [goal, setGoal] = useState('Hypertrophy & Muscle Tone');
  const [notes, setNotes] = useState(
    'Consistent morning lifter. Preparing for amateur powerlifting meet. Mild previous right shoulder impingement resolved.'
  );
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const all = StorageService.getCollection<Member>('members');
    const cur = all.find((m) => m.id === 'mem-001') || all[0];
    if (cur) {
      setMember(cur);
      setName(cur.name || 'Alex Morgan');
      setEmail(cur.email || 'alex.morgan@example.com');
      setPhone(cur.phone || '+91 98765 43210');
      if (cur.dob) setDateOfBirth(cur.dob);
      if (cur.gender) setGender(cur.gender);
      if (cur.emergencyContact) setEmergencyContact(cur.emergencyContact);
      if (cur.avatar) setAvatar(cur.avatar);
    }
  }, []);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email) {
      toast.error('Please fill required fields.');
      return;
    }

    if (member) {
      const updated: Member = {
        ...member,
        name,
        email,
        phone,
        dob: dateOfBirth,
        gender,
        emergencyContact,
        avatar,
      };
      StorageService.saveItem('members', updated);
      setMember(updated);
    }

    toast.success('Member profile details updated successfully!');
  };

  const handleChangeAvatar = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    ];
    const picked = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
    setAvatar(picked);
    toast.info('New photo selected. Click "Save Profile" to apply changes.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Your account password has been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <DashboardLayout portal="member">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/member/dashboard">Member Portal</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">My Profile</span>
          </div>
          <h1 className="page-title">Personal Profile & Goals</h1>
          <p className="page-subtitle">
            Manage your personal contact info, emergency contacts, and fitness preferences.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => handleSaveProfile()}>
            <i className="fa-solid fa-floppy-disk" style={{ marginRight: '0.4rem' }} /> Save Profile
          </button>
        </div>
      </div>

      <div className="grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left: Edit Profile Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal Information</h3>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="card-body">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Legal Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Home Branch</label>
                  <select
                    className="form-select"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="Downtown Flagship">Downtown Flagship (Austin, TX)</option>
                    <option value="Westside Fitness">Westside Fitness (Austin, TX)</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Emergency Contact (Name & Phone)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
              </div>

              <hr style={{ margin: '1.75rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

              <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
                Fitness Preferences & Health Details
              </h3>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Primary Fitness Goal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Coach / Trainer</label>
                  <input
                    type="text"
                    className="form-control"
                    value="Coach David Miller"
                    readOnly
                    style={{ background: 'var(--bg-hover)' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Training Notes / Health Considerations</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-accent">
                <i className="fa-solid fa-check" style={{ marginRight: '0.4rem' }} /> Save Profile Details
              </button>
            </div>
          </form>
        </div>

        {/* Right: Avatar Card & Security Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Avatar & ID Badge Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: '2rem 1.5rem' }}>
              <div
                className="avatar avatar-xl"
                style={{
                  margin: '0 auto 1rem',
                  width: '90px',
                  height: '90px',
                  border: '3px solid var(--color-accent)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={avatar}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ marginBottom: '0.25rem' }}>{name}</h3>
              <p className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>
                Member since May 2025 &bull; #{member?.id || 'MEM-101'}
              </p>
              <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                <i className="fa-solid fa-check" style={{ marginRight: '0.3rem' }} /> Active VIP
              </span>

              <div style={{ marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-sm btn-outline" onClick={handleChangeAvatar}>
                  <i className="fa-solid fa-camera" style={{ marginRight: '0.3rem' }} /> Change Photo
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fa-solid fa-key text-accent" style={{ marginRight: '0.4rem' }} /> Security & Password
              </h3>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="card-footer">
                <button type="submit" className="btn btn-sm btn-secondary" style={{ width: '100%' }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
