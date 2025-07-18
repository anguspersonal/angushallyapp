exports.up = function(knex) {
    return knex.schema
        .withSchema('bookmark')
        .alterTable('bookmarks', table => {
            table.boolean('is_organised').defaultTo(false).notNullable();
        });
};

exports.down = function(knex) {
    return knex.schema
        .withSchema('bookmark')
        .alterTable('bookmarks', table => {
            table.dropColumn('is_organised');
        });
}; 