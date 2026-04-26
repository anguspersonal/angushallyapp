/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // It's good practice to ensure dependent objects (like views or FKs from other tables not yet handled)
  // are considered. However, based on our current knowledge, these are standalone or their dependents are also being refactored.
  await knex.schema.withSchema('public').dropTableIfExists('inquiries');
  await knex.schema.withSchema('public').dropTableIfExists('customers');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Recreating tables in a 'down' function can be complex due to data loss and sequence states.
  // This is a best-effort recreation based on previously seen schemas.
  // Consider if a backup/restore strategy is more appropriate for true rollbacks of drop operations.

  // Recreate public.customers
  await knex.schema.withSchema('public').createTable('customers', (table) => {
    table.increments('id').primary(); // SERIAL PRIMARY KEY
    table.string('name', 255).notNullable();
    table.string('email', 255).unique();
    // Assuming public.customers also had a phone column based on the backfill migration
    table.string('phone', 255).nullable(); 
    table.timestamp('created_at').defaultTo(knex.fn.now());
    // No updated_at was consistently seen for public.customers
  });

  // Recreate public.inquiries
  await knex.schema.withSchema('public').createTable('inquiries', (table) => {
    table.increments('id').primary(); // SERIAL PRIMARY KEY
    table.integer('customer_id').references('id').inTable('public.customers').onDelete('CASCADE');
    table.string('subject', 255).nullable();
    table.text('message').notNullable(); // Was not nullable in the provided psql output
    table.text('captcha_token').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.text('status').defaultTo('Pending');
    // Re-add CHECK constraint if it existed (based on psql output)
    // knex.raw for this might be needed if specific ENUM/array syntax was used in the original CHECK
  });

  // Note: The original CHECK constraint for public.inquiries.status was:
  // CHECK (status = ANY (ARRAY['Pending'::text, 'Reviewed'::text, 'Resolved'::text]))
  // Adding this precisely with Knex schema builder can be tricky; knex.raw might be better if needed.
  // For simplicity here, the basic column is recreated. Add knex.raw if full fidelity is required.
  await knex.raw(`
    ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_status_check CHECK (status = ANY (ARRAY['Pending'::text, 'Reviewed'::text, 'Resolved'::text]));
  `);

  console.warn('Tables public.inquiries and public.customers have been recreated by the down migration. Any data they contained before dropping is lost.');
}; 