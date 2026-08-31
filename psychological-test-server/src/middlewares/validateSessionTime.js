const redisService = require('../services/redisService');
const env = require('../config/env');

async function validateSessionTime(req, res, next) {
  try {
    const { sessionId, sessionTestId } = req.userSession;
    if (!sessionTestId) {
      return res.status(403).json({ success: false, message: 'No active test session' });
    }

    const meta = await redisService.getMeta(sessionId, sessionTestId);
    if (!meta || !meta.limit_time) {
      return res.status(403).json({ success: false, message: 'No active session meta' });
    }

    const limitTime = new Date(meta.limit_time).getTime();
    const now = Date.now();
    const graceMs = env.gracePeriod * 1000;

    if (now > limitTime + graceMs) {
      return res.status(403).json({ success: false, message: 'Session time expired' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Session validation failed' });
  }
}

module.exports = validateSessionTime;