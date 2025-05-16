/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema('identity')
    .alterTable('users', (table) => {
      // Drop existing columns we want to replace
      table.dropColumn('name');
      table.dropColumn('picture_url');

      // Add new columns
      table.string('auth_provider').notNullable().defaultTo('local');
      table.string('first_name').nullable();
      table.string('last_name').nullable();
      table.timestamp('email_verified_at', { useTz: true }).nullable();
      table.timestamp('last_login_at', { useTz: true }).nullable();
      table.jsonb('metadata').notNullable().defaultTo('{}');

      // Change column types if needed
      table.string('email').alter();
      table.string('password_hash').alter();
      table.string('google_sub').alter();

      // Add new indexes
      table.index('auth_provider', 'ix_users_auth_provider');
      table.index('is_active', 'ix_users_is_active');
      table.index('last_login_at', 'ix_users_last_login_at');
      table.index('google_sub', 'ix_users_google_sub');
      
      // Add unique constraint for email + auth_provider combination
      table.unique(['email', 'auth_provider'], 'uq_users_email_auth_provider');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.withSchema('identity')
    .alterTable('users', (table) => {
      // Drop new columns
      table.dropColumn('auth_provider');
      table.dropColumn('first_name');
      table.dropColumn('last_name');
      table.dropColumn('email_verified_at');
      table.dropColumn('last_login_at');
      table.dropColumn('metadata');

      // Restore original columns
      table.text('name');
      table.text('picture_url');

      // Revert column types
      table.text('email').alter();
      table.text('password_hash').alter();
      table.text('google_sub').alter();

      // Drop new indexes
      table.dropIndex(null, 'ix_users_auth_provider');
      table.dropIndex(null, 'ix_users_is_active');
      table.dropIndex(null, 'ix_users_last_login_at');
      table.dropIndex(null, 'ix_users_google_sub');
      
      // Drop unique constraint
      table.dropUnique(null, 'uq_users_email_auth_provider');
    });
}; 