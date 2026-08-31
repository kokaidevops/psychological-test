const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  db: env.redis.db,
  retryStrategy: (times) => Math.min(times * 200, 2000),
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
});

redis.on('connect', () => console.log('[Redis] connected'));
redis.on('error', (err) => console.error('[Redis] error:', err.message));

module.exports = redis;