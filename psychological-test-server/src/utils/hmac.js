const crypto = require('crypto');
const env = require('../config/env');

/**
 * Compute HMAC SHA-256 of `rawBody` combined with timestamp.
 * Signature pattern: HMAC(secret, `${timestamp}.${rawBody}`)
 */
function computeSignature(timestamp, rawBody) {
  const payload = `${timestamp}.${rawBody}`;
  return crypto
    .createHmac('sha256', env.hmac.secret)
    .update(payload, 'utf8')
    .digest('hex');
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { computeSignature, safeEqual };