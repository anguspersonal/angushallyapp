exports.up = function(knex) {
    return knex.raw('CREATE SCHEMA IF NOT EXISTS bookmark')
      .then(() => {
        return knex.schema
          .withSchema('bookmark')
          .createTable('bookmarks', tbl => {
            tbl.increments('id').primary();
            tbl.uuid('user_id')
              .notNullable()
              .references('id')
              .inTable('identity.users')
              .onDelete('CASCADE');
            tbl.text('url').notNullable();
            tbl.text('resolved_url');
            tbl.text('title');
            tbl.text('description');
            tbl.text('source').notNullable().defaultTo('manual');
            tbl.timestamp('created_at').defaultTo(knex.fn.now());
            tbl.timestamp('updated_at').defaultTo(knex.fn.now());
            
            // Add indexes for common queries
            tbl.index('user_id');
            tbl.index('created_at');
          })
          .createTable('bookmark_sync_logs', tbl => {
            tbl.increments('id').primary();
            tbl.uuid('user_id')
              .notNullable()
              .references('id')
              .inTable('identity.users')
              .onDelete('CASCADE');
            tbl.integer('item_count').notNullable();
            tbl.text('status').notNullable();
            tbl.text('error_msg');
            tbl.timestamp('started_at').defaultTo(knex.fn.now());
            tbl.timestamp('finished_at');
            
            // Add index for user_id
            tbl.index('user_id');
          });
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .withSchema('bookmark')
      .dropTableIfExists('bookmark_sync_logs')
      .dropTableIfExists('bookmarks')
      .then(() => knex.raw('DROP SCHEMA IF EXISTS bookmark CASCADE'));
  };