'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your account email.');
      return;
    }
    setSubmitted(true);
    toast.success('Simulated reset instructions generated!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, var(--bg-body) 0%, var(--bg-surface-secondary) 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="brand-link" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div className="brand-icon">
              <i className="fa-solid fa-dumbbell" />
            </div>
            <div className="brand-text">
              Gym<span>Flow</span>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>Password Recovery</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Enter your email to receive simulated recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-accent-subtle)',
                border: '1px solid var(--color-accent-border)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-accent)', fontSize: '2rem', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: '0.25rem 0' }}>Recovery Email Sent</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                We sent simulated instructions to <strong>{email}</strong>. In this frontend demo environment, no real email is dispatched.
              </p>
            </div>

            <Link href="/login" className="btn btn-primary w-100" style={{ width: '100%', padding: '0.75rem' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Account Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. marcus@ironpulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-paper-plane" /> Send Password Reset Link
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
