'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StorageService } from '@/services/StorageService';
import { DataScopeService } from '@/services/DataScopeService';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { Equipment } from '@/types';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function AdminEquipment() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Equipment['category']>('Strength');
  const [brand, setBrand] = useState('Hammer Strength');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('Downtown Main Floor');
  const [status, setStatus] = useState<Equipment['status']>('Operational');

  const refreshData = () => {
    setEquipment(DataScopeService.getEquipment(user));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const openCreateModal = () => {
    setEditingEquipment(null);
    setName('');
    setCategory('Strength');
    setBrand('Hammer Strength');
    setSerialNumber('');
    setLocation('Downtown Main Floor');
    setStatus('Operational');
    setModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquipment(eq);
    setName(eq.name);
    setCategory(eq.category);
    setBrand(eq.brand || '');
    setSerialNumber(eq.serialNumber || '');
    setLocation(eq.location || 'Downtown Main Floor');
    setStatus(eq.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the equipment asset name.');
      return;
    }

    const payload: Equipment = {
      id: editingEquipment ? editingEquipment.id : `eq_${Date.now()}`,
      gymId: editingEquipment?.gymId || user?.gymId || 'gym_1',
      branchId: editingEquipment?.branchId || user?.branchId || 'br_1',
      name: name.trim(),
      category,
      serialNumber: serialNumber.trim() || editingEquipment?.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      purchaseDate: editingEquipment?.purchaseDate || '2025-01-15',
      warrantyExpiry: editingEquipment?.warrantyExpiry || '2028-01-15',
      lastServicedDate: editingEquipment?.lastServicedDate || new Date().toISOString().split('T')[0],
      status,
      brand: brand.trim() || 'Rogue Fitness',
      location: location.trim() || 'Downtown Main Floor',
    };

    StorageService.saveItem<Equipment>('equipment', payload);
    refreshData();
    setModalOpen(false);
    toast.success(editingEquipment ? `Asset "${payload.name}" updated successfully.` : `Asset "${payload.name}" added to inventory.`);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    StorageService.deleteItem('equipment', deleteId);
    refreshData();
    setDeleteId(null);
    toast.success('Equipment record removed.');
  };

  const columns: Column<Equipment>[] = [
    {
      key: 'name',
      header: 'Equipment Asset',
      sortable: true,
      render: (eq) => (
        <div>
          <div style={{ fontWeight: 700 }}>{eq.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{eq.brand} &bull; S/N: {eq.serialNumber}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (eq) => <span className="badge badge-secondary">{eq.category}</span>,
    },
    {
      key: 'location',
      header: 'Floor Location',
      sortable: true,
      render: (eq) => <span>{eq.location}</span>,
    },
    {
      key: 'lastServicedDate',
      header: 'Last Serviced',
      sortable: true,
      render: (eq) => <span>{formatDate(eq.lastServicedDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (eq) => (
        <span
          className={`badge ${
            eq.status === 'Operational'
              ? 'badge-success'
              : eq.status === 'Under Maintenance'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {eq.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (eq) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <PermissionGate permission="equipment.manage">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              title="Edit Equipment"
              onClick={() => openEditModal(eq)}
            >
              <i className="fa-solid fa-pen-to-square" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-danger"
              title="Delete Equipment"
              onClick={() => setDeleteId(eq.id)}
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
            <Link href="/admin/dashboard">Gym Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">Equipment</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Gym Floor Asset Inventory
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Weights, cardio suites, pin-loaded machines, serial records, and service lifecycles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/maintenance" className="btn btn-secondary">
            <i className="fa-solid fa-screwdriver-wrench" /> Service Tickets
          </Link>
          <PermissionGate permission="equipment.manage">
            <button type="button" className="btn btn-accent" onClick={openCreateModal}>
              <i className="fa-solid fa-plus" /> Add Machine
            </button>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        searchPlaceholder="Search machines by name, brand, serial..."
        statusFilterKey="status"
        statusOptions={[
          { label: 'Operational', value: 'Operational' },
          { label: 'Under Maintenance', value: 'Under Maintenance' },
          { label: 'Out of Order', value: 'Out of Order' },
        ]}
        exportFilename="ironpulse-equipment-inventory"
      />

      {isModalOpen && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '480px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingEquipment ? 'Edit Gym Equipment' : 'Add Gym Equipment'}
              </h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Asset Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dual Adjustable Pulley Cable Cross"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                      <option value="Strength">Strength</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Free Weights">Free Weights</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manufacturer Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. SN-884920"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Floor Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Zone B - Free Weights"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingEquipment ? 'Save Changes' : 'Save Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal active" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Remove Asset</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to remove this equipment asset from inventory records?
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
