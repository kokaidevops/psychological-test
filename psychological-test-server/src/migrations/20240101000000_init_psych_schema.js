const { v4: uuidv4 } = require('uuid');

exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await knex.schema.createTable('psychological_tests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('test_id').notNullable().unique();
    t.string('name', 255).notNullable();
    t.string('slug', 255).notNullable();
    t.boolean('is_publish').defaultTo(true);
    t.boolean('can_previous').defaultTo(true);
    t.float('time').defaultTo(0);
    t.integer('limit_day').defaultTo(2);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('question_tests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('question_id').notNullable();
    t.integer('test_id').notNullable();
    t.integer('sequence').defaultTo(10);
    t.text('title');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['test_id', 'question_id']);
    t.index('test_id');
  });

  await knex.schema.createTable('question_answers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('answer_id').notNullable();
    t.integer('sequence').defaultTo(0);
    t.string('name', 500);
    t.integer('question_id').notNullable();
    t.integer('test_id').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['test_id', 'question_id', 'answer_id']);
    t.index(['test_id', 'question_id']);
  });

  await knex.schema.createTable('psychological_sessions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('session_id').notNullable().unique();
    t.string('name', 255);
    t.string('token', 255).notNullable().unique();
    t.string('applicant_name', 255);
    t.date('date');
    t.string('state', 50).defaultTo('pending');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('psychological_session_tests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('session_test_id').notNullable().unique();
    t.integer('session_id').notNullable();
    t.integer('test_id').notNullable();
    t.date('date');
    t.date('end_date');
    t.float('time').defaultTo(0);
    t.timestamp('start_time');
    t.timestamp('limit_time');
    t.timestamp('end_time');
    t.string('state', 50).defaultTo('pending');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.index(['session_id', 'state']);
  });

  await knex.schema.createTable('psychological_session_answers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.integer('session_id').notNullable();
    t.integer('session_test_id').notNullable();
    t.integer('test_id').notNullable();
    t.integer('question_id').notNullable();
    t.integer('answer_id');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['session_test_id', 'question_id']);
    t.index(['session_id', 'session_test_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('psychological_session_answers');
  await knex.schema.dropTableIfExists('psychological_session_tests');
  await knex.schema.dropTableIfExists('psychological_sessions');
  await knex.schema.dropTableIfExists('question_answers');
  await knex.schema.dropTableIfExists('question_tests');
  await knex.schema.dropTableIfExists('psychological_tests');
};