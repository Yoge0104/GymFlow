// ===================================================================
// GymFlow — Discount & Promotions Management Service
// ===================================================================

import { Discount } from '@/types';
import { StorageService } from './StorageService';

export const DiscountService = {
  getAll(): Discount[] {
    return StorageService.getCollection<Discount>('discounts');
  },

  getById(id: string): Discount | null {
    return StorageService.getItemById<Discount>('discounts', id);
  },

  getByGym(gymId: string | null): Discount[] {
    const list = this.getAll();
    if (!gymId) {
      return list.filter((d) => d.gymId === null);
    }
    return list.filter((d) => d.gymId === gymId || d.gymId === null);
  },

  getFeaturedLandingPromotion(): Discount | null {
    const list = this.getAll();
    const now = new Date().toISOString().split('T')[0];
    const activePublic = list.filter((d) => {
      if (d.status !== 'active') return false;
      if (!d.isPublicLandingPage) return false;
      if (d.startDate && now < d.startDate) return false;
      if (d.endDate && now > d.endDate) return false;
      if (d.totalUsageLimit && d.usedCount >= d.totalUsageLimit) return false;
      return true;
    });

    const featured = activePublic.find((d) => d.isFeatured);
    return featured || activePublic[0] || null;
  },

  getPublicLandingDiscounts(): Discount[] {
    const list = this.getAll();
    const now = new Date().toISOString().split('T')[0];
    return list.filter((d) => {
      if (d.status !== 'active') return false;
      if (!d.isPublicLandingPage) return false;
      if (d.startDate && now < d.startDate) return false;
      if (d.endDate && now > d.endDate) return false;
      if (d.totalUsageLimit && d.usedCount >= d.totalUsageLimit) return false;
      return true;
    });
  },

  save(discount: Partial<Discount>): Discount {
    const now = new Date().toISOString().split('T')[0];
    const fullDiscount: Discount = {
      id: discount.id || `disc_${Date.now()}`,
      gymId: discount.gymId ?? null,
      name: discount.name || 'Special Promotion',
      description: discount.description || '',
      code: (discount.code || `CODE${Math.floor(Math.random() * 1000)}`).toUpperCase().trim(),
      discountType: discount.discountType || 'percentage',
      discountValue: discount.discountValue ?? 10,
      startDate: discount.startDate || now,
      endDate: discount.endDate || '2026-12-31',
      status: discount.status || 'active',
      eligiblePlanIds: discount.eligiblePlanIds || [],
      eligibleBranchIds: discount.eligibleBranchIds || [],
      minPurchaseAmount: discount.minPurchaseAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount,
      totalUsageLimit: discount.totalUsageLimit,
      usedCount: discount.usedCount || 0,
      perMemberLimit: discount.perMemberLimit || 1,
      firstTimeOnly: discount.firstTimeOnly ?? false,
      isFeatured: discount.isFeatured ?? false,
      isPublicLandingPage: discount.isPublicLandingPage ?? true,
      landingHeadline: discount.landingHeadline || '',
      landingDescription: discount.landingDescription || '',
      badgeText: discount.badgeText || '',
    };

    return StorageService.saveItem<Discount>('discounts', fullDiscount);
  },

  delete(id: string): boolean {
    return StorageService.deleteItem('discounts', id);
  },

  incrementUsage(id: string): void {
    const discount = this.getById(id);
    if (discount) {
      discount.usedCount = (discount.usedCount || 0) + 1;
      StorageService.saveItem('discounts', discount);
    }
  },
};
