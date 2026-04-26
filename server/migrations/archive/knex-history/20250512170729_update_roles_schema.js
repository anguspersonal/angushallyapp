/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // First, drop all foreign keys that reference roles.pkey
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_foreign');
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_fkey');

  // Drop the primary key constraint from roles
  await knex.raw('ALTER TABLE identity.roles DROP CONSTRAINT IF EXISTS roles_pkey');

  // Add the id column if it doesn't exist
  await knex.raw('ALTER TABLE identity.roles ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid()');

  // Update any NULL ids with new UUIDs
  await knex.raw('UPDATE identity.roles SET id = gen_random_uuid() WHERE id IS NULL');

  // Make id NOT NULL
  await knex.raw('ALTER TABLE identity.roles ALTER COLUMN id SET NOT NULL');

  // Add id as primary key
  await knex.raw('ALTER TABLE identity.roles ADD PRIMARY KEY (id)');

  // Drop and recreate the unique constraint on name
  await knex.raw('ALTER TABLE identity.roles DROP CONSTRAINT IF EXISTS uq_roles_name');
  await knex.raw('ALTER TABLE identity.roles ADD CONSTRAINT uq_roles_name UNIQUE (name)');

  // Add role_id column to user_roles if it doesn't exist
  await knex.raw('ALTER TABLE identity.user_roles ADD COLUMN IF NOT EXISTS role_id uuid');

  // If there's an old 'role' column, copy the IDs from roles table
  await knex.raw(`
    UPDATE identity.user_roles ur
    SET role_id = r.id
    FROM identity.roles r
    WHERE ur.role = r.name
  `);

  // Make role_id NOT NULL
  await knex.raw('ALTER TABLE identity.user_roles ALTER COLUMN role_id SET NOT NULL');

  // Re-add the foreign key constraint in user_roles
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT user_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES identity.roles(id) ON DELETE CASCADE');

  // Drop the old role column if it exists
  await knex.raw('ALTER TABLE identity.user_roles DROP COLUMN IF EXISTS role');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // First drop the foreign key constraint
  await knex.raw('ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_foreign');

  // Add back the role column
  await knex.raw('ALTER TABLE identity.user_roles ADD COLUMN IF NOT EXISTS role varchar(255)');

  // Copy names back from roles table
  await knex.raw(`
    UPDATE identity.user_roles ur
    SET role = r.name
    FROM identity.roles r
    WHERE ur.role_id = r.id
  `);

  // Make role NOT NULL
  await knex.raw('ALTER TABLE identity.user_roles ALTER COLUMN role SET NOT NULL');

  // Drop the role_id column
  await knex.raw('ALTER TABLE identity.user_roles DROP COLUMN IF EXISTS role_id');

  // Drop the unique constraint on name
  await knex.raw('ALTER TABLE identity.roles DROP CONSTRAINT IF EXISTS uq_roles_name');

  // Drop the primary key constraint
  await knex.raw('ALTER TABLE identity.roles DROP CONSTRAINT IF EXISTS roles_pkey');

  // Drop the id column
  await knex.raw('ALTER TABLE identity.roles DROP COLUMN IF EXISTS id');

  // Re-add name as primary key
  await knex.raw('ALTER TABLE identity.roles ADD PRIMARY KEY (name)');

  // Re-add the original foreign key in user_roles
  await knex.raw('ALTER TABLE identity.user_roles ADD CONSTRAINT user_roles_role_id_foreign FOREIGN KEY (role) REFERENCES identity.roles(name)');
}; 