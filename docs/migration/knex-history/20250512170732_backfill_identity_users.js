/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
    await knex.raw('CREATE SCHEMA IF NOT EXISTS habit'); // Ensure habit schema exists

    // Drop the unique email constraint temporarily
    await knex.raw('ALTER TABLE identity.users DROP CONSTRAINT IF EXISTS users_email_key');

    // Insert specific primary user required for Strava data linkage
    await knex.raw(`
      INSERT INTO identity.users
        (id, email, auth_provider, google_sub, first_name, last_name, is_active, email_verified_at, password_hash, metadata, created_at, updated_at)
      VALUES
        ('95288f22-6049-4651-85ae-4932ededb5ab', 'angus.hally@gmail.com', 'google', NULL, 'Angus', 'Hally', TRUE, CURRENT_TIMESTAMP, NULL, '{"description": "Primary user, owns initial Strava data", "is_manual_entry": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        auth_provider = EXCLUDED.auth_provider,
        google_sub = EXCLUDED.google_sub,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        is_active = EXCLUDED.is_active,
        email_verified_at = EXCLUDED.email_verified_at,
        password_hash = EXCLUDED.password_hash,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP;
    `);

    // 1) Insert legacy habit users from habit._deprecated_users
    await knex.raw(`
      INSERT INTO identity.users
        (email, auth_provider, google_sub, first_name, last_name, 
         is_active, created_at, updated_at, metadata)
      SELECT
        hu.email,
        CASE WHEN hu.google_user_id IS NOT NULL THEN 'google' ELSE 'local' END as auth_provider,
        hu.google_user_id as google_sub,
        hu.fname as first_name,
        hu.lname as last_name,
        TRUE as is_active,  -- Confirmed: Migrated habit users default to active
        hu.created_at,      
        hu.last_updated as updated_at,
        jsonb_build_object(
            'legacy_source', 'habit_deprecated_users',
            'legacy_habit_user_id', hu.user_id 
        ) as metadata
      FROM habit._deprecated_users hu -- Explicitly schema.table
      ON CONFLICT (email, auth_provider) DO NOTHING;
    `);
  
    // 2) Insert legacy public customers from public.customers
    await knex.raw(`
      INSERT INTO identity.users
        (email, auth_provider, first_name, last_name,
         is_active, created_at, updated_at, metadata)
      SELECT
        pc.email,
        'legacy_customer' as auth_provider,
        CASE 
          WHEN POSITION(' ' IN pc.name) > 0 THEN SUBSTRING(pc.name FROM 1 FOR POSITION(' ' IN pc.name) - 1)
          ELSE pc.name -- If no space, full name goes to first_name, last_name is NULL. Adjust if needed.
        END as first_name, 
        CASE 
          WHEN POSITION(' ' IN pc.name) > 0 THEN SUBSTRING(pc.name FROM POSITION(' ' IN pc.name) + 1)
          ELSE NULL
        END as last_name,  
        TRUE as is_active, -- Confirmed: Migrated customer users default to active
        pc.created_at,
        pc.created_at as updated_at, -- No last_updated for customers, using created_at
        jsonb_build_object(
            'legacy_source', 'public_customers',
            'legacy_customer_id', pc.id, 
            'phone', pc.phone
        ) as metadata
      FROM public.customers pc -- Changed from _deprecated_customers to public.customers
      ON CONFLICT (email, auth_provider) DO NOTHING;
    `);
  
    // 3) Seed 'member' role for all newly migrated active users who don't have roles yet
    await knex.raw(`
      INSERT INTO identity.user_roles (user_id, role_id, created_at, updated_at)
      SELECT u.id, r.id, now(), now()
      FROM identity.users u
      JOIN identity.roles r ON r.name = 'member'
      WHERE u.is_active = TRUE 
        AND u.auth_provider IN ('google', 'local', 'legacy_customer') 
        AND NOT EXISTS (
          SELECT 1 FROM identity.user_roles ur WHERE ur.user_id = u.id
        )
      ON CONFLICT DO NOTHING;
    `);
  }; 
  
  exports.down = async function(knex) {
    await knex.raw(`
      DELETE FROM identity.user_roles ur
      USING identity.users u
      WHERE ur.user_id = u.id
        AND u.metadata->>'legacy_source' IN ('habit_deprecated_users', 'public_customers');
    `);

    await knex.raw(`
      DELETE FROM identity.users
      WHERE metadata->>'legacy_source' = 'habit_deprecated_users';
    `);

    await knex.raw(`
      DELETE FROM identity.users
      WHERE metadata->>'legacy_source' = 'public_customers';
    `);
  };
  