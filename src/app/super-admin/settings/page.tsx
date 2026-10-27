'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { PlatformSettings } from '@/types';
import { toast } from 'sonner';

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: 'GymFlow',
    supportEmail: 'support@gymflow.in',
    defaultCurrency: 'INR',
    currencySymbol: '₹',
    taxRate: 18,
    allowPublicRegistration: true,
    maintenanceMode: false,
    demoMode: true,
  });

  useEffect(() => {
    const s = StorageService.getSettings<PlatformSettings>('platformSettings');
    if (s) setSettings(s);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings('platformSettings', settings);
    toast.success('Platform settings saved successfully.');
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to restore the pristine seed database? All local demo mutations, discounts, and payments will be reset.')) {
      StorageService.resetDatabase();
      toast.success('Demo database factory reset to initial seed data!');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymflow-db-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Database exported to JSON.');
  };

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Settings</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Global Platform Governance & Configuration
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Branding, currencies, system maintenance mode, and demo factory reset.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Settings Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>General SaaS Policies</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Platform Brand Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Global Support Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select
                  className="form-control"
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Tax Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.85rem', fontSize: '1rem', fontWeight: 700 }}>Security & Feature Toggles</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowPublicRegistration}
                    onChange={(e) => setSettings({ ...settings, allowPublicRegistration: e.target.checked })}
                    style={{ width: '17px', height: '17px' }}
                  />
                  <span>Allow Public Gym Registration via Marketing Page</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    style={{ width: '17px', height: '17px' }}
                  />
                  <span>Maintenance Mode (Platform read-only lock)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.demoMode}
                    onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })}
                    style={{ width: '17px', height: '17px' }}
                  />
                  <span>Demonstration Mode Banner & Simulated Gateways</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-accent">
              <i className="fa-solid fa-floppy-disk" /> Save Platform Policies
            </button>
          </form>
        </div>

        {/* Database & Factory Reset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.1rem', fontWeight: 700 }}>
              <i className="fa-solid fa-database text-electric" style={{ marginRight: '0.35rem' }} /> Database Persistence
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              All records (gyms, members, classes, payments, invoices, discounts, permissions) are persisted safely in browser LocalStorage.
            </p>
            <button type="button" className="btn btn-secondary w-100" style={{ width: '100%' }} onClick={handleExportData}>
              <i className="fa-solid fa-download" /> Export Full JSON Backup
            </button>
          </div>

          <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-danger)' }}>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-danger)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.35rem' }} /> Factory Reset Demo
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Reset all tenant mutations, delete created invoices and return to the pristine initial seed dataset.
            </p>
            <button
              type="button"
              className="btn btn-danger w-100"
              style={{ width: '100%' }}
              onClick={handleResetDemoData}
            >
              <i className="fa-solid fa-rotate-left" /> Factory Reset Database
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
