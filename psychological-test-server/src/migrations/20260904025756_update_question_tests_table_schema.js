/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('question_tests', function(table) {
    table.string('type', 500).defaultTo('likert');
    table.string('dimension_name', 500);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('question_tests', function(table) {
    table.dropColumn('type'); 
    table.dropColumn('dimension_name'); 
  });
};
