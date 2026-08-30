import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();
const db = admin.firestore();

/**
 * Creates Razorpay Order for ₹29 Host Pass.
 */
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated anonymously.');
  }

  const userId = context.auth.uid;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Return mock development order
    return {
      order: {
        id: `order_dev_${Date.now()}`,
        amount: 2900,
        currency: 'INR',
        receipt: `rcpt_${userId.substring(0, 5)}_${Date.now()}`
      },
      isDevBypass: true
    };
  }

  // Live Razorpay API call using Basic Auth
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    },
    body: JSON.stringify({
      amount: 2900, // ₹29.00 = 2900 paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    })
  });

  if (!response.ok) {
    throw new functions.https.HttpsError('internal', 'Razorpay order creation failed.');
  }

  const orderData = await response.json();
  return { order: orderData, isDevBypass: false };
});

/**
 * Verifies Razorpay payment signature and writes 2-hour host entitlement.
 */
export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keySecret) {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid signature verification.');
    }
  }

  const entitlementRef = db.collection('entitlements').doc();
  const entitlementData = {
    userId: context.auth.uid,
    type: 'TWO_HOUR_HOST_PASS',
    amount: 29,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    status: 'ACTIVE',
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await entitlementRef.set(entitlementData);

  return { success: true, entitlement: { id: entitlementRef.id, ...entitlementData } };
});

/**
 * Idempotent Razorpay Webhook Handler.
 */
export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expected !== signature) {
      res.status(400).send('Invalid signature');
      return;
    }
  }

  const event = req.body.event;
  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;
    // Log payment idempotently
    await db.collection('payments').doc(payment.id).set({
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      orderId: payment.order_id,
      capturedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  res.status(200).json({ status: 'ok' });
});
