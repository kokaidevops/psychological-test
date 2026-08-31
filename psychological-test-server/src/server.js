const app = require('./app');
const env = require('./config/env');
const db = require('./config/knex');
const redis = require('./config/redis');

async function start() {
  try {
    await db.raw('SELECT 1');
    console.log('[PostgreSQL] connected');

    if (redis.status !== 'ready') {
      // Wait briefly; ioredis auto-reconnects
      console.log('[Redis] waiting for connection...');
    }

    app.listen(env.port, () => {
      console.log(`[Server] running on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error('[Boot] failed:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`[Shutdown] received ${signal}`);
  try {
    await db.destroy();
    await redis.quit();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

start();