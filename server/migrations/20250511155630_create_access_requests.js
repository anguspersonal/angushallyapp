/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw('CREATE SCHEMA IF NOT EXISTS identity')
    .then(() => {
      return knex.schema.withSchema('identity')
        .createTable('access_requests', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.uuid('user_id').notNullable().references('id').inTable('identity.users').onDelete('SET NULL');
          table.timestamp('requested_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
          table.enu('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
          table.uuid('handled_by')
            .references('id')
            .inTable('identity.users')
            .onDelete('SET NULL');
          table.timestamp('handled_at', { useTz: true }).nullable();
          table.text('rejection_reason').nullable();
          table.timestamps(true, true);  // This correctly creates created_at and updated_at with TZ

          // Add indexes for commonly queried fields with consistent naming
          table.index('user_id', 'ix_access_requests_user_id');
          table.index('status', 'ix_access_requests_status');
          table.index('requested_at', 'ix_access_requests_requested_at');
          table.index('handled_at', 'ix_access_requests_handled_at');
        })
        .then(() => {
          // Add partial unique index for pending requests only
          return knex.raw(`
            CREATE UNIQUE INDEX uq_access_requests_pending_user 
            ON identity.access_requests(user_id) 
            WHERE status = 'pending'
          `);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.withSchema('identity')
    .raw('DROP INDEX IF EXISTS identity.uq_access_requests_pending_user')
    .then(() => {
      return knex.schema.withSchema('identity')
        .dropTableIfExists('access_requests');
    });
};
