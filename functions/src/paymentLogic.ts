export const HOST_PASS = { productId: 'HOST_PASS_2H', amount: 2900, currency: 'INR' } as const;

export interface StoredOrder {
  userId: string;
  amount: number;
  currency: string;
  status: string;
}

export function paymentMatchesOrder(
  order: StoredOrder | undefined,
  userId: string,
  amount = HOST_PASS.amount,
  currency = HOST_PASS.currency,
): boolean {
  return Boolean(order && order.userId === userId && order.amount === amount && order.currency === currency);
}

export function paymentEntitlementId(paymentId: string): string {
  return `payment_${paymentId}`;
}
