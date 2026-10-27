// ===================================================================
// GymFlow — Centralized Pricing & Discount Calculation Engine
// ===================================================================

import { Discount } from '@/types';
import { formatINR } from '@/lib/formatters';

export interface PriceCalculationResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedDiscount: Discount | null;
  isValid: boolean;
  message?: string;
}

export const PricingService = {
  calculateDiscount(
    price: number,
    discount: Discount | null | undefined
  ): { discountAmount: number; finalPrice: number } {
    if (!discount || discount.status !== 'active') {
      return { discountAmount: 0, finalPrice: price };
    }

    // Check minimum purchase amount
    if (discount.minPurchaseAmount && price < discount.minPurchaseAmount) {
      return { discountAmount: 0, finalPrice: price };
    }

    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (price * discount.discountValue) / 100;
    } else {
      discountAmount = Math.min(discount.discountValue, price);
    }

    // Apply max discount cap if configured
    if (discount.maxDiscountAmount && discount.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
    }

    // Ensure discount does not exceed price and never produces negative price
    discountAmount = Math.max(0, Math.min(discountAmount, price));
    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalPrice = Math.round((price - discountAmount) * 100) / 100;

    return { discountAmount, finalPrice };
  },

  calculatePlanPrice(
    planPrice: number,
    planId: string,
    couponCode?: string,
    allDiscounts: Discount[] = [],
    isFirstTime = false
  ): PriceCalculationResult {
    if (!couponCode || !couponCode.trim()) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: true,
      };
    }

    const cleanCode = couponCode.trim().toUpperCase();
    const discount = allDiscounts.find(
      (d) => d.code.toUpperCase() === cleanCode && d.status === 'active'
    );

    if (!discount) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'Invalid or expired coupon code.',
      };
    }

    // Validate date range
    const now = new Date().toISOString().split('T')[0];
    if (discount.startDate && now < discount.startDate) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'This promotional code has not started yet.',
      };
    }

    if (discount.endDate && now > discount.endDate) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'This promotional coupon has expired.',
      };
    }

    // Validate usage limit
    if (
      discount.totalUsageLimit !== undefined &&
      discount.totalUsageLimit > 0 &&
      discount.usedCount >= discount.totalUsageLimit
    ) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'This promotional code has reached its maximum total usage limit.',
      };
    }

    // Validate plan eligibility
    if (
      discount.eligiblePlanIds &&
      discount.eligiblePlanIds.length > 0 &&
      !discount.eligiblePlanIds.includes(planId)
    ) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'This coupon is not applicable to the selected plan tier.',
      };
    }

    // Validate first-time only restriction
    if (discount.firstTimeOnly && !isFirstTime) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: 'This promotional discount is valid for first-time members only.',
      };
    }

    // Validate minimum spend
    if (discount.minPurchaseAmount && planPrice < discount.minPurchaseAmount) {
      return {
        originalPrice: planPrice,
        discountAmount: 0,
        finalPrice: planPrice,
        appliedDiscount: null,
        isValid: false,
        message: `Minimum purchase of ${formatINR(discount.minPurchaseAmount)} required for this coupon.`,
      };
    }

    const { discountAmount, finalPrice } = this.calculateDiscount(planPrice, discount);

    return {
      originalPrice: planPrice,
      discountAmount,
      finalPrice,
      appliedDiscount: discount,
      isValid: true,
      message: `Coupon applied! You save ${formatINR(discountAmount)}.`,
    };
  },
};
