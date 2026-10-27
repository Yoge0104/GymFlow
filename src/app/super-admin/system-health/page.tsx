'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SuperAdminSystemHealth() {
  const telemetry = {
    uptime: '99.98%',
    apiLatencyMs: 42,
    dbConnections: '34 / 200',
    errorRate: '0.01%',
    cpuUsage: '28%',
    memoryUsage: '45%',
    lastIncident: '18 days ago (Resolved in 6 mins)',
  };

  const services = [
    { name: 'Core API Gateway', status: 'Operational', latency: '38ms', uptime: '99.99%' },
    { name: 'PostgreSQL Database Cluster', status: 'Operational', latency: '4ms', uptime: '100%' },
    { name: 'Redis Cache & Session Store', status: 'Operational', latency: '1ms', uptime: '100%' },
    { name: 'Simulated Payment Gateway', status: 'Operational', latency: '120ms', uptime: '99.95%' },
    { name: 'Email Notification Worker', status: 'Operational', latency: '45ms', uptime: '99.98%' },
    { name: 'Background Cron Scheduler', status: 'Operational', latency: '15ms', uptime: '100%' },
  ];

  return (
    <DashboardLayout portal="super-admin">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/super-admin/dashboard">Super Admin</Link> <span className="breadcrumb-separator">/</span> <span className="breadcrumb-current">System Health</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Simulated Infrastructure Telemetry
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Real-time status monitoring, API latencies, worker health, and system resource consumption.
          </p>
        </div>
        <div>
          <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
            <i className="fa-solid fa-circle-check" /> All Systems Operational
          </span>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            30-Day Uptime
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-accent)' }}>
            {telemetry.uptime}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            SLA target: 99.9%
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            API Response Latency
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {telemetry.apiLatencyMs} ms
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            p95: 78ms &bull; p99: 110ms
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Database Connections
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {telemetry.dbConnections}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pool capacity healthy
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Error Rate
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--color-accent)' }}>
            {telemetry.errorRate}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Zero unhandled exceptions
          </span>
        </div>
      </div>

      {/* Microservices Status Grid */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Microservices Status</h3>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Status</th>
                <th>Latency</th>
                <th>30-Day Uptime</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      <i className="fa-solid fa-circle-check" /> {s.status}
                    </span>
                  </td>
                  <td>{s.latency}</td>
                  <td>{s.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
