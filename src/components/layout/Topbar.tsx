'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationService } from '@/services/NotificationService';
import { AppNotification } from '@/types';
import { StorageService } from '@/services/StorageService';

export function Topbar({ portalTitle }: { portalTitle?: string }) {
  const router = useRouter();
  const { user, role, theme, toggleTheme, toggleSidebar, setMobileSidebarOpen, logout } = useAuth();

  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<AppNotification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Sync notifications
  const refreshNotifications = () => {
    const count = NotificationService.getUnreadCount(user.gymId, user.id, user.role);
    setUnreadCount(count);
    const all = NotificationService.getByRecipient(user.gymId, user.id, user.role);
    setRecentNotifs(all.slice(0, 5));
  };

  useEffect(() => {
    refreshNotifications();
    const unsub = StorageService.subscribe(() => {
      refreshNotifications();
    });
    return () => unsub();
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead(user.gymId, user.id, user.role);
    refreshNotifications();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-toggle sidebar-toggle-btn"
          onClick={() => {
            if (window.innerWidth <= 768) {
              setMobileSidebarOpen(true);
            } else {
              toggleSidebar();
            }
          }}
          aria-label="Toggle navigation drawer"
        >
          <i className="fa-solid fa-bars" />
        </button>

        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {role === 'SUPER_ADMIN' ? (
            <>
              <i className="fa-solid fa-shield-halved text-accent" />
              <span>SaaS Platform Command Center</span>
            </>
          ) : role === 'MEMBER' ? (
            <>
              <i className="fa-solid fa-dumbbell text-accent" />
              <span>{user.gymName || 'IronPulse Fitness Club'} • Athlete Portal</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-building text-electric" />
              <span id="topbar-gym-name">{user.gymName || 'IronPulse Fitness Club'}</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Role Indicator Pill */}
        <span
          className={`role-indicator ${
            role === 'SUPER_ADMIN' ? 'superadmin' : role === 'MEMBER' ? 'member' : 'admin'
          }`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background:
              role === 'SUPER_ADMIN'
                ? 'var(--color-purple-subtle)'
                : role === 'MEMBER'
                ? 'var(--color-accent-subtle)'
                : 'var(--color-electric-subtle)',
            color:
              role === 'SUPER_ADMIN'
                ? 'var(--color-purple)'
                : role === 'MEMBER'
                ? 'var(--color-accent)'
                : 'var(--color-electric)',
            border: `1px solid ${
              role === 'SUPER_ADMIN'
                ? 'var(--color-purple-border)'
                : role === 'MEMBER'
                ? 'var(--color-accent-border)'
                : 'rgba(37, 99, 235, 0.3)'
            }`,
          }}
        >
          <i
            className={
              role === 'SUPER_ADMIN'
                ? 'fa-solid fa-shield-halved'
                : role === 'MEMBER'
                ? 'fa-solid fa-person-running'
                : 'fa-solid fa-building'
            }
          />
          {user.roleLabel}
        </span>

        {/* Theme Toggle */}
        <button
          type="button"
          className="topbar-action-btn theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          onClick={toggleTheme}
        >
          <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} />
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="topbar-action-btn"
            id="btn-notifications"
            onClick={() => setNotifOpen(!isNotifOpen)}
            title="In-App Notifications"
          >
            <i className="fa-solid fa-bell" />
            {unreadCount > 0 && <span className="action-badge">{unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div
              className="card dropdown-panel"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '320px',
                zIndex: 1000,
                padding: '0',
                boxShadow: 'var(--shadow-xl)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Notifications {unreadCount > 0 && <span className="badge badge-accent">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {recentNotifs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <i className="fa-regular fa-bell-slash" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  recentNotifs.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color-subtle)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--color-accent-subtle)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        NotificationService.markAsRead(n.id);
                        refreshNotifications();
                        if (n.linkUrl) {
                          setNotifOpen(false);
                          router.push(n.linkUrl);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', marginTop: '0.25rem', display: 'block' }}>
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '0.6rem',
                  textAlign: 'center',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                }}
              >
                <Link
                  href={
                    role === 'SUPER_ADMIN'
                      ? '/super-admin/notifications'
                      : role === 'MEMBER'
                      ? '/member/notifications'
                      : '/admin/notifications'
                  }
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)' }}
                  onClick={() => setNotifOpen(false)}
                >
                  View All Notifications <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <button
            type="button"
            className="topbar-user-btn"
            onClick={() => setUserMenuOpen(!isUserMenuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="avatar avatar-sm">
              <img src={user.avatar} className="current-user-avatar" alt="Avatar" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="topbar-user-name current-user-name">{user.name}</div>
              <div className="topbar-user-role">{user.roleLabel}</div>
            </div>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }} />
          </button>

          {isUserMenuOpen && (
            <div
              className="dropdown-menu"
              style={{
                display: 'block',
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                minWidth: '190px',
                zIndex: 1000,
              }}
            >
              {role === 'MEMBER' ? (
                <>
                  <Link href="/member/my-profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <i className="fa-solid fa-user" /> My Profile
                  </Link>
                  <Link href="/member/my-membership" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <i className="fa-solid fa-id-card" /> Membership
                  </Link>
                </>
              ) : role === 'SUPER_ADMIN' ? (
                <Link href="/super-admin/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <i className="fa-solid fa-gear" /> Platform Settings
                </Link>
              ) : (
                <Link href="/admin/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <i className="fa-solid fa-gear" /> Gym Settings
                </Link>
              )}
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item text-danger"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
