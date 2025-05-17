/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS crm');

  // Drop the table first if it exists
  await knex.schema.withSchema('crm').dropTableIfExists('inquiries');

  await knex.schema.withSchema('crm').createTable('inquiries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('submitter_user_id')
      .nullable()
      .references('id')
      .inTable('identity.users')
      .onDelete('SET NULL')
      .comment('User from identity.users who submitted the inquiry, if logged in.');
      
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('subject', 255).nullable();
    table.text('message').nullable();
    
    table.text('status').notNullable().defaultTo('new')
      .comment('Status of the inquiry (e.g., new, open, assigned, pending_customer_reply, resolved, closed, spam)');
    // For PostgreSQL, you might prefer a more robust ENUM type if your DB supports it easily via Knex,
    // or add a CHECK constraint for status values.
    // Example CHECK constraint (add separately with knex.raw if needed):
    // ALTER TABLE crm.inquiries ADD CONSTRAINT check_inquiries_status 
    // CHECK (status IN ('new', 'open', 'assigned', 'pending_customer_reply', 'resolved', 'closed', 'spam'));

    table.uuid('assigned_to_user_id')
      .nullable()
      .defaultTo('95288f22-6049-4651-85ae-4932ededb5ab') // Default to a specific system/admin user
      .references('id')
      .inTable('identity.users')
      .onDelete('SET NULL')
      .comment('Internal user from identity.users assigned to handle the inquiry. Defaults to a specific system/admin user.');

    table.timestamps(true, true); // Creates created_at and updated_at with TIMESTAMPTZ

    // Indexes
    table.index('submitter_user_id', 'idx_inquiries_submitter_user_id');
    table.index('email', 'idx_inquiries_email'); // For looking up inquiries by email
    table.index('status', 'idx_inquiries_status');
    table.index('assigned_to_user_id', 'idx_inquiries_assigned_to_user_id');
  });

  // Add CHECK constraint for status after table creation for broader compatibility
  // and because Knex's built-in ENUM support can vary or be complex.
  await knex.raw(`
    ALTER TABLE crm.inquiries
    ADD CONSTRAINT check_inquiries_status
    CHECK (status IN ('new', 'open', 'assigned', 'pending_customer_reply', 'pending_agent_reply', 'resolved', 'closed', 'spam'))
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Before dropping the table, explicitly drop the CHECK constraint if it was added.
  // The IF EXISTS clause makes it safe even if the constraint wasn't added or was already dropped.
  await knex.raw('ALTER TABLE crm.inquiries DROP CONSTRAINT IF EXISTS check_inquiries_status');
  
  await knex.schema.withSchema('crm').dropTableIfExists('inquiries');
  
  // Optional: Drop schema if it's empty and this was the only table.
  // For safety, this is often handled in a separate, more deliberate migration.
  // Example:
  // const tablesInCrm = await knex('pg_catalog.pg_tables')
  //   .where('schemaname', 'crm')
  //   .select('tablename');
  // if (tablesInCrm.length === 0) {
  //   await knex.raw('DROP SCHEMA IF EXISTS crm');
  // }
}; 