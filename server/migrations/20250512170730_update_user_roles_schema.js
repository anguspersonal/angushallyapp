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
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS pk_user_roles');

  // Add timestamp columns if they don't exist
  await knex.raw('ALTER TABLE identity.user_roles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT CURRENT_TIMESTAMP');
  await knex.raw('ALTER TABLE identity.user_roles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT CURRENT_TIMESTAMP');

  // Add new primary key if it doesn't exist
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id)');

  // Add the index for faster role lookups if it doesn't exist
  await knex.raw('CREATE INDEX IF NOT EXISTS ix_user_roles_role_user ON identity.user_roles (role_id, user_id)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop the primary key constraint
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS pk_user_roles');

  // Drop the index
  await knex.raw('DROP INDEX IF EXISTS identity.ix_user_roles_role_user');

  // Drop timestamp columns
  await knex.raw('ALTER TABLE identity.user_roles DROP COLUMN IF EXISTS created_at');
  await knex.raw('ALTER TABLE identity.user_roles DROP COLUMN IF EXISTS updated_at');

  // Re-add the original constraints
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id)');
}; 