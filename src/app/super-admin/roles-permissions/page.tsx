'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ALL_PERMISSION_MODULES, PermissionService } from '@/services/PermissionService';
import { PermissionKey, UserRole } from '@/types';
import { toast } from 'sonner';

const ALL_ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'var(--color-purple)' },
  { role: 'GYM_OWNER', label: 'Gym Owner', color: 'var(--color-electric)' },
  { role: 'GYM_ADMIN', label: 'Gym Admin', color: 'var(--color-electric)' },
  { role: 'BRANCH_MANAGER', label: 'Branch Mgr', color: '#0891b2' },
  { role: 'TRAINER', label: 'Trainer', color: '#d97706' },
  { role: 'RECEPTIONIST', label: 'Receptionist', color: '#059669' },
  { role: 'ACCOUNTANT', label: 'Accountant', color: '#4f46e5' },
  { role: 'MEMBER', label: 'Member', color: 'var(--color-accent)' },
];

export default function SuperAdminRolesPermissions() {
  const [matrix, setMatrix] = useState<Record<UserRole, PermissionKey[]>>({} as any);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const refreshData = () => {
    setMatrix(PermissionService.getMatrix());
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggle = (role: UserRole, permKey: PermissionKey) => {
    if (role === 'SUPER_ADMIN' && (permKey === 'roles.manage' || permKey === 'platform.manage' || permKey === 'platform.view')) {
      toast.error('Safety Guard: Cannot remove core administrative governance permissions from Super Admin to prevent system lockout.');
      return;
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
    toast.success('Role permissions matrix saved successfully! All portal navigations updated immediately.');
  };

  const handleRestoreDefaults = () => {
    if (confirm('Restore default role permissions? Custom overrides will be reset.')) {
      PermissionService.resetDefaultPermissions();
      refreshData();
      toast.success('Restored default role permissions.');
    }
  };

  // Filter modules and permissions
  const filteredModules = ALL_PERMISSION_MODULES.filter((mod) => {
    if (selectedModule !== 'all' && mod.module !== selectedModule) return false;
    return true;
  }).map((mod) => {
    const matchingPerms = mod.permissions.filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.key.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
    return { ...mod, permissions: matchingPerms };
  }).filter((mod) => mod.permissions.length > 0);

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Roles & Permissions</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Centralized Role-Permission Matrix
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure granular access capabilities across 8 system roles. Changes apply immediately to navigation and actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={handleRestoreDefaults}>
            <i className="fa-solid fa-rotate-left" /> Restore Defaults
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <i className="fa-solid fa-floppy-disk" /> {hasUnsavedChanges ? 'Save Matrix Changes' : 'All Changes Saved'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search permissions or keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="all">All Modules</option>
              {ALL_PERMISSION_MODULES.map((m) => (
                <option key={m.module} value={m.module}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {hasUnsavedChanges && (
            <span className="badge badge-warning" style={{ padding: '0.4rem 0.75rem' }}>
              <i className="fa-solid fa-circle-exclamation" /> Unsaved modifications present
            </span>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                <th style={{ width: '60px', textAlign: 'center', padding: '0.85rem 0.5rem' }}>Sr. No.</th>
                <th style={{ width: '320px', textAlign: 'left', padding: '0.85rem 1rem' }}>
                  Permission / Capability
                </th>
                {ALL_ROLES.map((r) => (
                  <th
                    key={r.role}
                    style={{
                      textAlign: 'center',
                      padding: '0.75rem 0.5rem',
                      minWidth: '100px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: r.color }}>{r.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let permIndex = 0;
                return filteredModules.map((mod) => (
                  <React.Fragment key={mod.module}>
                    <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderTop: '2px solid var(--border-color)' }}>
                      <td colSpan={ALL_ROLES.length + 2} style={{ padding: '0.5rem 1rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>
                        {mod.label}
                      </td>
                    </tr>
                    {mod.permissions.map((p) => {
                      permIndex += 1;
                      const currentNo = permIndex;
                      return (
                        <tr key={p.key} style={{ borderBottom: '1px solid var(--border-color-subtle)' }}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '0.75rem 0.5rem' }}>
                            {currentNo}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description}</div>
                            <code style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{p.key}</code>
                          </td>
                          {ALL_ROLES.map((r) => {
                            const isGranted = (matrix[r.role] || []).includes(p.key);
                            return (
                              <td key={r.role} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.5rem' }}>
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  onChange={() => handleToggle(r.role, p.key)}
                                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                                  aria-label={`Toggle ${p.label} for ${r.label}`}
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
