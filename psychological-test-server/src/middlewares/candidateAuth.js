const env = require('../config/env');
const { verify } = require('../utils/jwt');

function candidateAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.jwt.cookieName];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No session token' });
    }

    const decoded = verify(token);

    req.userSession = {
      sessionId: decoded.sessionId,
      sessionTestId: decoded.sessionTestId,
      applicantName: decoded.applicantName,
      token: decoded.token,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = candidateAuth;