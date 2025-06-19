/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.withSchema('bookmark')
        .alterTable('bookmarks', (table) => {
            table.jsonb('tags').defaultTo('[]');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.withSchema('bookmark')
        .alterTable('bookmarks', (table) => {
            table.dropColumn('tags');
        });
}; 