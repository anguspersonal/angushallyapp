/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    .then(() => knex.raw('CREATE SCHEMA IF NOT EXISTS identity'))
    .then(() => {
      return knex.schema.withSchema('identity')
        .createTable('users', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.string('email').notNullable();
          table.string('password_hash').nullable();  // Made nullable for OAuth
          table.string('auth_provider').notNullable().defaultTo('local');  // e.g., 'local', 'google', 'github'
          table.string('google_sub').unique('uq_users_google_sub').nullable(); // Added google_sub
          table.string('first_name').nullable();
          table.string('last_name').nullable();
          table.boolean('is_active').notNullable().defaultTo(false);  // Default to inactive
          table.timestamp('email_verified_at', { useTz: true }).nullable();
          table.timestamp('last_login_at', { useTz: true }).nullable();
          table.jsonb('metadata').notNullable().defaultTo('{}');  // Flexible additional user data
          table.timestamps(true, true);  // Creates created_at and updated_at with TZ

          // Add indexes for commonly queried fields with consistent naming
          table.index('email', 'ix_users_email');
          table.index('auth_provider', 'ix_users_auth_provider');
          table.index('is_active', 'ix_users_is_active');
          table.index('last_login_at', 'ix_users_last_login_at');
          table.index('google_sub', 'ix_users_google_sub'); // Index for google_sub
          
          // Add unique constraint for email + auth_provider combination
          table.unique(['email', 'auth_provider'], 'uq_users_email_auth_provider');
        })
        .createTable('roles', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.string('name').notNullable().unique('uq_roles_name');
          table.string('description').nullable();
          table.timestamps(true, true);  // Creates created_at and updated_at as timestamptz
        })
        .createTable('user_roles', (table) => {
          table.uuid('user_id').notNullable().references('id').inTable('identity.users').onDelete('CASCADE');
          table.uuid('role_id').notNullable().references('id').inTable('identity.roles').onDelete('CASCADE');
          table.timestamps(true, true);  // Creates created_at and updated_at as timestamptz
          table.primary(['user_id', 'role_id'], 'pk_user_roles');  // Composite primary key
          
          // Add index for faster role lookups
          table.index(['role_id', 'user_id'], 'ix_user_roles_role_user');
        });
    })
    .then(() => {
      // Seed initial roles
      return knex('identity.roles').insert([
        { name: 'admin',   description: 'Full access' },
        { name: 'member',  description: 'Approved member' },
        { name: 'guest',   description: 'Unauthenticated or pending' }
      ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.withSchema('identity')
    .dropTableIfExists('user_roles')
    .dropTableIfExists('roles')
    .dropTableIfExists('users')
    .then(() => {
      return knex.raw('DROP SCHEMA IF EXISTS identity CASCADE');
    });
};
