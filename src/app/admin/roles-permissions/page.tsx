'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ALL_PERMISSION_MODULES, PermissionService } from '@/services/PermissionService';
import { PermissionKey, UserRole } from '@/types';
import { toast } from 'sonner';

const GYM_ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: 'GYM_OWNER', label: 'Gym Owner', color: 'var(--color-electric)' },
  { role: 'GYM_ADMIN', label: 'Gym Admin', color: 'var(--color-electric)' },
  { role: 'BRANCH_MANAGER', label: 'Branch Mgr', color: '#0891b2' },
  { role: 'TRAINER', label: 'Trainer', color: '#d97706' },
  { role: 'RECEPTIONIST', label: 'Receptionist', color: '#059669' },
  { role: 'ACCOUNTANT', label: 'Accountant', color: '#4f46e5' },
];

export default function AdminRolesPermissions() {
  const [matrix, setMatrix] = useState<Record<UserRole, PermissionKey[]>>({} as any);
  const [search, setSearch] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const refreshData = () => {
    setMatrix(PermissionService.getMatrix());
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggle = (role: UserRole, permKey: PermissionKey) => {
    if ((role === 'GYM_OWNER' || role === 'GYM_ADMIN') && permKey === 'roles.manage') {
      toast.warning('Warning: Modifying role governance capability for gym leadership.');
    }

    const currentPerms = matrix[role] || [];
    let updated: PermissionKey[];
    if (currentPerms.includes(permKey)) {
      updated = currentPerms.filter((p) => p !== permKey);
    } else {
      updated = [...currentPerms, permKey];
    }

    setMatrix((prev) => ({
      ...prev,
      [role]: updated,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    Object.entries(matrix).forEach(([role, perms]) => {
      PermissionService.updateRolePermissions(role as UserRole, perms);
    });
    setHasUnsavedChanges(false);
    toast.success('Club role access permissions updated immediately across navigation.');
  };

  const handleRestoreDefaults = () => {
    if (confirm('Reset club staff role permissions to system defaults?')) {
      PermissionService.resetDefaultPermissions();
      refreshData();
      toast.success('Restored default role permissions.');
    }
  };

  // Exclude platform-level governance from gym admin matrix
  const relevantModules = ALL_PERMISSION_MODULES.filter((m) => m.module !== 'platform');

  return (
    <DashboardLayout portal="admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Roles & Access</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Club Staff Permissions & Access Control
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure capability boundaries for receptionists, managers, personal trainers, and accountants.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleRestoreDefaults}>
            <i className="fa-solid fa-rotate-left" /> Restore Defaults
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <i className="fa-solid fa-floppy-disk" /> {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                <th style={{ width: '60px', textAlign: 'center', padding: '0.85rem 0.5rem' }}>Sr. No.</th>
                <th style={{ width: '320px', textAlign: 'left', padding: '0.85rem 1rem' }}>
                  Operational Capability
                </th>
                {GYM_ROLES.map((r) => (
                  <th key={r.role} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', minWidth: '100px' }}>
                    <div style={{ fontWeight: 700, color: r.color }}>{r.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let permIndex = 0;
                return relevantModules.map((mod) => (
                  <React.Fragment key={mod.module}>
                    <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderTop: '2px solid var(--border-color)' }}>
                      <td colSpan={GYM_ROLES.length + 2} style={{ padding: '0.5rem 1rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-electric)' }}>
                        {mod.label}
                      </td>
                    </tr>
                    {mod.permissions.map((p) => {
                      permIndex += 1;
                      const currentNumber = permIndex;
                      return (
                        <tr key={p.key} style={{ borderBottom: '1px solid var(--border-color-subtle)' }}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '0.75rem 0.5rem' }}>
                            {currentNumber}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700 }}>{p.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description}</div>
                          </td>
                          {GYM_ROLES.map((r) => {
                            const isGranted = (matrix[r.role] || []).includes(p.key);
                            return (
                              <td key={r.role} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.5rem' }}>
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  onChange={() => handleToggle(r.role, p.key)}
                                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
