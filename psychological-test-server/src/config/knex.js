const knex = require('knex');
const env = require('./env');

const db = knex({
  client: 'pg',
  connection: {
    host: env.pg.host,
    port: env.pg.port,
    user: env.pg.user,
    password: env.pg.password,
    database: env.pg.database,
  },
  pool: { min: 2, max: 10 },
});

module.exports = db;