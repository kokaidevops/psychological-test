require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  pg: {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  hmac: {
    secret: process.env.HMAC_SECRET,
    tolerance: parseInt(process.env.TIMESTAMP_TOLERANCE_SECONDS || '300', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
    cookieName: 'candidate_session_token',
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  },
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  },
  gracePeriod: parseInt(process.env.SESSION_GRACE_PERIOD_SECONDS || '10', 10),
  flushDelayMs: parseInt(process.env.STOP_SESSION_FLUSH_DELAY_MS || '800', 10),
};

module.exports = env;