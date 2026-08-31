import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface HostPassOrder {
  orderId: string;
  amount: number;
  currency: 'INR';
  keyId: string;
}
export interface PaymentConfirmation {
  orderId: string;
  paymentId: string;
  signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

let checkoutLoader: Promise<void> | null = null;
export function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutLoader) return checkoutLoader;
  checkoutLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Secure checkout could not be loaded.'));
    document.head.append(script);
  });
  return checkoutLoader;
}

export const paymentService = {
  async createHostPassOrder(): Promise<HostPassOrder> {
    const result = await httpsCallable<{ productId: 'HOST_PASS_2H' }, HostPassOrder>(
      functions,
      'createRazorpayOrder',
    )({ productId: 'HOST_PASS_2H' });
    return result.data;
  },
  async verifyPayment(
    confirmation: PaymentConfirmation,
  ): Promise<{ verified: boolean; pendingCapture: boolean }> {
    const result = await httpsCallable<PaymentConfirmation, { verified: boolean; pendingCapture: boolean }>(
      functions,
      'verifyRazorpayPayment',
    )(confirmation);
    return result.data;
  },
  async validateEntitlement(): Promise<boolean> {
    const result = await httpsCallable<Record<string, never>, { valid: boolean }>(
      functions,
      'validateEntitlement',
    )({});
    return result.data.valid;
  },
  async claimPrivateTrial(): Promise<boolean> {
    const result = await httpsCallable<Record<string, never>, { claimed: boolean }>(
      functions,
      'claimPrivateRoomTrial',
    )({});
    return result.data.claimed;
  },
};
