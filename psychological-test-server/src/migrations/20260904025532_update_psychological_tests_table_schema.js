/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('psychological_tests', function(table) {
    table.integer('sequence').defaultTo(10);
    table.string('topic', 255);
    table.integer('question_count').defaultTo(0);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('psychological_tests', function(table) {
    table.dropColumn('sequence'); 
    table.dropColumn('topic'); 
    table.dropColumn('question_count'); 
  });
};
