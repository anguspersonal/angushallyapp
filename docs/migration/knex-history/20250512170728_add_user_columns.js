/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Add missing columns to users table
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS auth_provider varchar(255) DEFAULT \'local\'');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS first_name varchar(255)');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS last_name varchar(255)');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS google_sub varchar(255)');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS last_login_at timestamptz');
  await knex.raw('ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT \'{}\'');

  // Make auth_provider not null after setting the default
  await knex.raw('ALTER TABLE identity.users ALTER COLUMN auth_provider SET NOT NULL');
  await knex.raw('ALTER TABLE identity.users ALTER COLUMN metadata SET NOT NULL');

  // Add indexes
  await knex.raw('CREATE INDEX IF NOT EXISTS ix_users_auth_provider ON identity.users (auth_provider)');
  await knex.raw('CREATE INDEX IF NOT EXISTS ix_users_google_sub ON identity.users (google_sub)');
  await knex.raw('CREATE INDEX IF NOT EXISTS ix_users_last_login_at ON identity.users (last_login_at)');

  // Add unique constraints
  await knex.raw('ALTER TABLE identity.users DROP CONSTRAINT IF EXISTS uq_users_google_sub');
  await knex.raw('ALTER TABLE identity.users ADD CONSTRAINT uq_users_google_sub UNIQUE (google_sub)');

  await knex.raw('ALTER TABLE identity.users DROP CONSTRAINT IF EXISTS uq_users_email_auth_provider');
  await knex.raw('ALTER TABLE identity.users ADD CONSTRAINT uq_users_email_auth_provider UNIQUE (email, auth_provider)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop unique constraints
  await knex.raw('ALTER TABLE identity.users DROP CONSTRAINT IF EXISTS uq_users_email_auth_provider');
  await knex.raw('ALTER TABLE identity.users DROP CONSTRAINT IF EXISTS uq_users_google_sub');

  // Drop indexes
  await knex.raw('DROP INDEX IF EXISTS identity.ix_users_auth_provider');
  await knex.raw('DROP INDEX IF EXISTS identity.ix_users_google_sub');
  await knex.raw('DROP INDEX IF EXISTS identity.ix_users_last_login_at');

  // Drop columns
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS auth_provider');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS first_name');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS last_name');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS google_sub');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS email_verified_at');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS last_login_at');
  await knex.raw('ALTER TABLE identity.users DROP COLUMN IF EXISTS metadata');
}; 