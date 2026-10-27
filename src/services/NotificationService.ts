// ===================================================================
// GymFlow — Centralized Event-Driven Notification Service
// ===================================================================

import { AppNotification, UserRole } from '@/types';
import { StorageService } from './StorageService';

export const NotificationService = {
  getAll(): AppNotification[] {
    return StorageService.getCollection<AppNotification>('notifications');
  },

  getByRecipient(gymId: string | null, userId?: string | null, role?: UserRole): AppNotification[] {
    const list = this.getAll();
    return list.filter((n) => {
      // Direct user match
      if (userId && n.targetUserId === userId) return true;

      // Platform superadmin sees platform & all
      if (role === 'SUPER_ADMIN') {
        return n.gymId === null || n.targetRole === 'SUPER_ADMIN' || n.targetRole === 'ALL';
      }

      // Gym level match
      if (n.gymId && gymId && n.gymId !== gymId) return false;

      if (!n.targetRole || n.targetRole === 'ALL') return true;
      if (role && n.targetRole === role) return true;

      return false;
    });
  },

  getUnreadCount(gymId: string | null, userId?: string | null, role?: UserRole): number {
    const items = this.getByRecipient(gymId, userId, role);
    return items.filter((n) => !n.isRead).length;
  },

  notify(params: {
    gymId?: string | null;
    targetUserId?: string | null;
    targetRole?: UserRole | 'ALL';
    category: AppNotification['category'];
    title: string;
    message: string;
    linkUrl?: string;
    relatedEntityId?: string;
    dedupKey?: string;
  }): AppNotification {
    const list = this.getAll();

    // Deduplication check
    if (params.dedupKey) {
      const existing = list.find((n) => n.dedupKey === params.dedupKey);
      if (existing) return existing;
    }

    const notification: AppNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      gymId: params.gymId ?? null,
      targetUserId: params.targetUserId ?? null,
      targetRole: params.targetRole ?? 'ALL',
      category: params.category,
      title: params.title,
      message: params.message,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkUrl: params.linkUrl,
      relatedEntityId: params.relatedEntityId,
      dedupKey: params.dedupKey,
    };

    return StorageService.saveItem<AppNotification>('notifications', notification);
  },

  markAsRead(id: string): void {
    const item = StorageService.getItemById<AppNotification>('notifications', id);
    if (item) {
      item.isRead = true;
      StorageService.saveItem('notifications', item);
    }
  },

  markAllAsRead(gymId: string | null, userId?: string | null, role?: UserRole): void {
    const items = this.getByRecipient(gymId, userId, role);
    items.forEach((item) => {
      if (!item.isRead) {
        item.isRead = true;
        StorageService.saveItem('notifications', item);
      }
    });
  },

  delete(id: string): boolean {
    return StorageService.deleteItem('notifications', id);
  },

  clearAll(gymId: string | null, userId?: string | null, role?: UserRole): void {
    const items = this.getByRecipient(gymId, userId, role);
    items.forEach((n) => StorageService.deleteItem('notifications', n.id));
  },
};
