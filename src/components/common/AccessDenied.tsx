'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PermissionKey } from '@/types';
import { RouteAccessService } from '@/services/RouteAccessService';

interface AccessDeniedProps {
  requiredPermission?: PermissionKey;
  reason?: string;
  targetPath?: string;
}

export function AccessDenied({
  requiredPermission,
  reason = 'You do not have the required permissions to view this resource.',
  targetPath,
}: AccessDeniedProps) {
  const router = useRouter();
  const { user, role, loginAs } = useAuth();

  const defaultDashboard = RouteAccessService.getDefaultDashboardForRole(role);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--color-danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '1.25rem',
          }}
        >
          <i className="fa-solid fa-shield-halved" />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Access Denied
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {reason}
        </p>

        {requiredPermission && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}
          >
            <i className="fa-solid fa-key" style={{ color: 'var(--color-warning)' }} />
            <span style={{ color: 'var(--text-subtle)' }}>Required capability:</span>
            <code style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{requiredPermission}</code>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>
          <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
            {user.roleLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={defaultDashboard} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <i className="fa-solid fa-arrow-left" /> Return to Authorized Dashboard
          </Link>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              loginAs('superadmin');
              router.refresh();
            }}
            title="Elevate demo session to Super Admin for full platform access"
          >
            <i className="fa-solid fa-user-shield" /> Elevate to Super Admin
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          <i className="fa-solid fa-circle-info" /> This demonstration evaluates role-based access control client-side.
          In a production environment, authorization is enforced via server-side session claims and token scopes.
        </div>
      </div>
    </div>
  );
}
