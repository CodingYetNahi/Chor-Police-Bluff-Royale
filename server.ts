import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Chor Police: Bluff Royale' });
  });

  // Razorpay Order Creation API (Server-Side Proxy)
  app.post('/api/payments/create-order', async (req, res) => {
    const { userId, passType } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Mock development order
      return res.json({
        order: {
          id: `order_dev_${Date.now()}`,
          amount: 2900,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          status: 'created'
        },
        isDevBypass: true
      });
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          amount: 2900, // ₹29.00
          currency: 'INR',
          receipt: `rcpt_${userId?.substring(0, 6) || 'guest'}_${Date.now()}`
        })
      });

      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to create Razorpay order' });
      }

      const orderData = await response.json();
      res.json({ order: orderData, isDevBypass: false });
    } catch (err) {
      res.status(500).json({ error: 'Razorpay gateway communication error' });
    }
  });

  // Razorpay Verification API (Server-Side Signature Check)
  app.post('/api/payments/verify-payment', async (req, res) => {
    const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret) {
      const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Signature verification failed' });
      }
    }

    const entitlement = {
      id: `pass_${Date.now()}`,
      userId,
      type: 'TWO_HOUR_HOST_PASS',
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      amount: 29,
      status: 'ACTIVE'
    };

    res.json({ success: true, entitlement });
  });

  // Vite middleware for development vs static production serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chor Police: Bluff Royale server running on port ${PORT}`);
  });
}

startServer();
