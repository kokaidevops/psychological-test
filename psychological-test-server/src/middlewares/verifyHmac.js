const { computeSignature, safeEqual } = require('../utils/hmac');
const env = require('../config/env');

function verifyHmac(req, res, next) {
  try {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!signature || !timestamp) {
      return res.status(401).json({ success: false, message: 'Missing signature/timestamp' });
    }

    const ts = parseInt(timestamp, 10);
    if (Number.isNaN(ts)) {
      return res.status(401).json({ success: false, message: 'Invalid timestamp' });
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > env.hmac.tolerance) {
      return res.status(401).json({ success: false, message: 'Timestamp out of range (replay?)' });
    }

    const rawBody = req.rawBody?.toString('utf8') ?? '';
    const expected = computeSignature(timestamp, rawBody);

    if (!safeEqual(signature, expected)) {
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Signature verification failed' });
  }
}

module.exports = verifyHmac;