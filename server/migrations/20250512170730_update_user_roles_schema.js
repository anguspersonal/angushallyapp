/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // First, drop the existing foreign key constraints
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_fkey');
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey');
  
  // Drop the primary key constraint
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey');

  // Drop the role column (we'll replace it with role_id)
  await knex.raw('ALTER TABLE identity.user_roles DROP COLUMN IF EXISTS role');

  // Add new columns
  await knex.schema.withSchema('identity').alterTable('user_roles', table => {
    table.uuid('role_id').notNullable().references('id').inTable('identity.roles').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Add new primary key
  await knex.raw('ALTER TABLE identity.user_roles ADD PRIMARY KEY (user_id, role_id)');

  // Add the index for faster role lookups
  await knex.raw('CREATE INDEX IF NOT EXISTS ix_user_roles_role_user ON identity.user_roles (role_id, user_id)');

  // Re-add the user_id foreign key with CASCADE
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop the new foreign key constraints
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey');
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey');
  
  // Drop the primary key constraint
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey');

  // Drop the index
  await knex.raw('DROP INDEX IF EXISTS identity.ix_user_roles_role_user');

  // Drop the timestamps and role_id columns
  await knex.schema.withSchema('identity').alterTable('user_roles', table => {
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('role_id');
  });

  // Add back the role column
  await knex.schema.withSchema('identity').alterTable('user_roles', table => {
    table.text('role').notNullable();
  });

  // Re-add the original constraints
  await knex.raw('ALTER TABLE identity.user_roles ADD PRIMARY KEY (user_id, role)');
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT user_roles_role_fkey FOREIGN KEY (role) REFERENCES identity.roles(name)');
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE');
}; 