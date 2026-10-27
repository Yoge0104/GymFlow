'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StorageService } from '@/services/StorageService';
import { GymSettings } from '@/types';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'brand' | 'hours' | 'finance' | 'policies'>('brand');

  const [settings, setSettings] = useState<GymSettings>({
    gymId: 'gym-001',
    name: 'IronPulse Fitness Club',
    legalEntityName: 'IronPulse Fitness Inc.',
    slogan: 'Peak Performance, Unmatched Dedication',
    email: 'contact@ironpulse.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Downtown District',
    city: 'Austin, TX 78701',
    website: 'https://ironpulse.example.com',
    socialHandle: '@ironpulse_official',
    currency: 'INR',
    currencySymbol: '₹',
    taxRate: 18.0,
    taxName: 'GST',
    taxId: '29AABCI1234F1Z5',
    invoicePrefix: 'INV-IP-',
    invoiceFooterNotes:
      'Thank you for working out with IronPulse Fitness! Direct bank transfer / NEFT / RTGS: HDFC Bank, IFSC: HDFC0001234, Acct: 94827104. UPI ID: ironpulse@hdfcbank.',
    invoiceTerms: 'Payment due upon receipt. 18% GST included where applicable.',
    openingHours: 'Mon-Fri 05:30 AM - 11:00 PM, Sat 07:00 AM - 09:00 PM, Sun 08:00 AM - 06:00 PM',
    hoursWeekday: '05:30 AM – 11:00 PM',
    hoursSaturday: '07:00 AM – 09:00 PM',
    hoursSunday: '08:00 AM – 06:00 PM',
    keycardAccess: true,
    capacityMain: 120,
    capacityStudio: 30,
    gracePeriodDays: 7,
    cancellationNoticeDays: 30,
    guestPassesPerMonth: 2,
    autoRenewDefault: true,
    waiverText:
      'Members acknowledge that physical exercise involves inherent risks. Members affirm they are medically cleared for strenuous exercise and waive liability against IronPulse Fitness Club for accidental injury on premises.',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop',
  });

  useEffect(() => {
    const saved = StorageService.getSettings<GymSettings>('gymSettings');
    if (saved && saved.name) {
      setSettings((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  const handleChange = (field: keyof GymSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    StorageService.saveSettings('gymSettings', settings);
    toast.success('Gym configuration and policies saved successfully!');
  };

  const handleSimulateLogoUpload = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&h=150&fit=crop',
    ];
    const picked = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
    handleChange('logo', picked);
    toast.info('New logo uploaded and preview updated.');
  };

  const handleResetLogo = () => {
    handleChange('logo', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop');
    toast.info('Default club logo restored.');
  };

  return (
    <DashboardLayout portal="admin">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/dashboard">Gym Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Settings</span>
          </div>
          <h1 className="page-title">Gym Settings & Brand Identity</h1>
          <p className="page-subtitle">
            Configure business profile, operating hours, tax rules, and invoice layouts for your gym.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <i className="fa-solid fa-floppy-disk" /> Save Changes
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'brand' ? 'active' : ''}`}
          onClick={() => setActiveTab('brand')}
        >
          <i className="fa-solid fa-building" /> Profile & Brand
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <i className="fa-solid fa-clock" /> Hours & Access
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <i className="fa-solid fa-file-invoice-dollar" /> Invoicing & Tax
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          <i className="fa-solid fa-shield-halved" /> Member Policies
        </button>
      </div>

      {/* Tab: Profile & Brand */}
      {activeTab === 'brand' && (
        <div className="card" style={{ maxWidth: '860px' }}>
          <div className="card-header">
            <h3 className="card-title">Gym Profile & Visual Identity</h3>
          </div>
          <div className="card-body">
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={settings.logo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop'}
                  alt="Gym Logo"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '2px solid var(--border-color)',
                  }}
                />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Club Logo & Banner</h4>
                <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>
                  Recommended size: 400x400px. PNG or JPG format.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={handleSimulateLogoUpload}>
                    <i className="fa-solid fa-cloud-arrow-up" /> Upload New
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleResetLogo}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Gym Legal Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slogan / Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.slogan || ''}
                  onChange={(e) => handleChange('slogan', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City, State & ZIP</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={settings.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Social Media Handle (@)</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.socialHandle || ''}
                  onChange={(e) => handleChange('socialHandle', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-accent" onClick={handleSave}>
              <i className="fa-solid fa-check" /> Save Brand Info
            </button>
          </div>
        </div>
      )}

      {/* Tab: Hours & Access */}
      {activeTab === 'hours' && (
        <div className="card" style={{ maxWidth: '860px' }}>
          <div className="card-header">
            <h3 className="card-title">Operating Hours & Capacity Limits</h3>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Monday – Friday Hours</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.hoursWeekday || '05:30 AM – 11:00 PM'}
                  onChange={(e) => handleChange('hoursWeekday', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Saturday Hours</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.hoursSaturday || '07:00 AM – 09:00 PM'}
                  onChange={(e) => handleChange('hoursSaturday', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sunday & Holidays Hours</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.hoursSunday || '08:00 AM – 06:00 PM'}
                  onChange={(e) => handleChange('hoursSunday', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">24/7 Keycard Access Enabled</label>
                <select
                  className="form-select"
                  value={settings.keycardAccess ? 'enabled' : 'disabled'}
                  onChange={(e) => handleChange('keycardAccess', e.target.value === 'enabled')}
                >
                  <option value="enabled">Yes — Active VIP Keyholders Only</option>
                  <option value="disabled">No — Strictly Supervised Hours</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Main Hall Safe Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.capacityMain || 120}
                  onChange={(e) => handleChange('capacityMain', parseInt(e.target.value, 10))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Studio Capacity Limit</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.capacityStudio || 30}
                  onChange={(e) => handleChange('capacityStudio', parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-accent" onClick={handleSave}>
              <i className="fa-solid fa-check" /> Save Schedule
            </button>
          </div>
        </div>
      )}

      {/* Tab: Finance & Tax */}
      {activeTab === 'finance' && (
        <div className="card" style={{ maxWidth: '860px' }}>
          <div className="card-header">
            <h3 className="card-title">Invoicing, Sales Tax & Receipts</h3>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={settings.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Invoice Prefix</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax ID / Business Registration #</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.taxId || 'TX-8492031-G'}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Invoice Footer Notice / Wire Details</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={settings.invoiceFooterNotes}
                  onChange={(e) => handleChange('invoiceFooterNotes', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-accent" onClick={handleSave}>
              <i className="fa-solid fa-check" /> Save Invoicing Rules
            </button>
          </div>
        </div>
      )}

      {/* Tab: Member Policies */}
      {activeTab === 'policies' && (
        <div className="card" style={{ maxWidth: '860px' }}>
          <div className="card-header">
            <h3 className="card-title">Membership & Cancellation Policies</h3>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Grace Period for Overdue Dues (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.gracePeriodDays ?? 7}
                  onChange={(e) => handleChange('gracePeriodDays', parseInt(e.target.value, 10))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cancellation Notice Requirement</label>
                <select
                  className="form-select"
                  value={settings.cancellationNoticeDays ?? 30}
                  onChange={(e) => handleChange('cancellationNoticeDays', parseInt(e.target.value, 10))}
                >
                  <option value={14}>14 Days Prior</option>
                  <option value={30}>30 Days Prior</option>
                  <option value={0}>Immediate / No Notice</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Guest Passes Per Month (Per Member)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.guestPassesPerMonth ?? 2}
                  onChange={(e) => handleChange('guestPassesPerMonth', parseInt(e.target.value, 10))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Auto-Renew Default</label>
                <select
                  className="form-select"
                  value={settings.autoRenewDefault ? 'true' : 'false'}
                  onChange={(e) => handleChange('autoRenewDefault', e.target.value === 'true')}
                >
                  <option value="true">Enabled by default</option>
                  <option value="false">Requires manual renewal</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Standard Liability & Health Waiver Summary</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={settings.waiverText || ''}
                  onChange={(e) => handleChange('waiverText', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-accent" onClick={handleSave}>
              <i className="fa-solid fa-check" /> Save Policies
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
