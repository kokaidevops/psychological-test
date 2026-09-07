const db = require('../config/knex');
const env = require('../config/env');
const { sign } = require('../utils/jwt');
const { verifyTokenSchema } = require('../validators/schemas');
const logger = require('../utils/logger');

async function verifyToken(req, res) {
  try {
    const parsed = verifyTokenSchema.parse(req.body);

    const session = await db('psychological_sessions')
      .where({ token: parsed.token })
      .first();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    const tokenPayload = {
      sessionId: session.id,
      applicantName: session.applicant_name,
      token: session.token,
    };

    const jwtToken = sign(tokenPayload);

    res.cookie(env.jwt.cookieName, jwtToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      data: {
        id: session.id,
        name: session.name,
        applicant_name: session.applicant_name,
        date: session.date,
        state: session.state,
      },
    });
  } catch (err) {
    logger.error('verifyToken error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

async function logout(req, res) {
  res.clearCookie(env.jwt.cookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    domain: env.jwt.cookieDomain,
    path: '/',
  });
  return res.json({ success: true, message: 'Logged out' });
}

module.exports = { verifyToken, logout };