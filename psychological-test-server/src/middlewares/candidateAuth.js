const env = require('../config/env');
const { verify } = require('../utils/jwt');

function candidateAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.jwt.cookieName];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No session token' });
    }

    const decoded = verify(token);

    // Anti-IDOR: IDs come from JWT, NEVER from request body
    req.userSession = {
      sessionId: decoded.sessionId,
      sessionTestId: decoded.sessionTestId, // optional, set on start-session
      applicantName: decoded.applicantName,
      candidateNik: decoded.candidateNik,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = candidateAuth;