import { Entitlement } from '../types';
import { analytics } from './analytics';

const ENTITLEMENT_STORAGE_KEY = 'cp_entitlements';
const TRIAL_USED_KEY = 'cp_free_trial_used';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class PaymentService {
  /**
   * Checks if user has a valid active host entitlement.
   */
  public getActiveEntitlement(userId: string): Entitlement | null {
    try {
      const stored = localStorage.getItem(ENTITLEMENT_STORAGE_KEY);
      if (!stored) return null;

      const list: Entitlement[] = JSON.parse(stored);
      const now = Date.now();
      const valid = list.find((e) => e.userId === userId && e.status === 'ACTIVE' && e.expiresAt > now);
      return valid || null;
    } catch {
      return null;
    }
  }

  /**
   * Checks if user is eligible for the one-time free trial private room.
   */
  public hasFreeTrialAvailable(userId: string): boolean {
    try {
      const used = localStorage.getItem(`${TRIAL_USED_KEY}_${userId}`);
      return !used;
    } catch {
      return true;
    }
  }

  /**
   * Activates the free trial entitlement for the user.
   */
  public claimFreeTrial(userId: string): Entitlement {
    const entitlement: Entitlement = {
      id: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: 'FIRST_TRIAL_FREE',
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      amount: 0,
      status: 'ACTIVE'
    };

    this.saveEntitlement(entitlement);
    try {
      localStorage.setItem(`${TRIAL_USED_KEY}_${userId}`, 'true');
    } catch {
      // ignore
    }

    analytics.track('purchase_verified', { isHost: true });
    return entitlement;
  }

  /**
   * Creates a Razorpay order via server API.
   * In development/preview without live keys, activates mock order seamlessly.
   */
  public async createHostPassOrder(userId: string): Promise<{ order: RazorpayOrderResponse; isDevBypass: boolean }> {
    analytics.track('checkout_started', { isHost: true });

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // If key is configured, call server endpoint
    if (keyId) {
      try {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, passType: 'TWO_HOUR_HOST_PASS' })
        });

        if (res.ok) {
          const data = await res.json();
          return { order: data.order, isDevBypass: false };
        }
      } catch (err) {
        console.warn('Live payment server unreachable, falling back to test mode adapter.');
      }
    }

    // Development / test-mode fallback adapter
    return {
      order: {
        id: `order_test_${Date.now()}`,
        amount: 2900, // 2900 paise = ₹29
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        status: 'created'
      },
      isDevBypass: true
    };
  }

  /**
   * Verifies Razorpay payment signature via server API or test bypass.
   */
  public async verifyAndActivatePass(
    userId: string,
    payload: RazorpayPaymentSuccessPayload,
    isDevBypass: boolean
  ): Promise<{ success: boolean; entitlement?: Entitlement; error?: string }> {
    if (!isDevBypass && import.meta.env.VITE_RAZORPAY_KEY_ID) {
      try {
        const res = await fetch('/api/payments/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...payload })
        });

        if (res.ok) {
          const data = await res.json();
          this.saveEntitlement(data.entitlement);
          analytics.track('purchase_verified', { isHost: true });
          return { success: true, entitlement: data.entitlement };
        } else {
          analytics.track('purchase_failed', { isHost: true });
          return { success: false, error: 'Payment verification signature failed.' };
        }
      } catch {
        analytics.track('purchase_failed', { isHost: true });
        return { success: false, error: 'Server verification connection error.' };
      }
    }

    // Test mode bypass activation
    const entitlement: Entitlement = {
      id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: 'TWO_HOUR_HOST_PASS',
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      amount: 29,
      status: 'ACTIVE'
    };

    this.saveEntitlement(entitlement);
    analytics.track('purchase_verified', { isHost: true });
    return { success: true, entitlement };
  }

  private saveEntitlement(entitlement: Entitlement) {
    try {
      const stored = localStorage.getItem(ENTITLEMENT_STORAGE_KEY);
      const list: Entitlement[] = stored ? JSON.parse(stored) : [];
      list.push(entitlement);
      localStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

export const paymentService = new PaymentService();
