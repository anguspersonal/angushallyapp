/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // === Add captcha_token to crm.inquiries ===
  // First check if the column exists to avoid errors
  const hasCaptchaToken = await knex.schema.withSchema('crm').hasColumn('inquiries', 'captcha_token');
  if (!hasCaptchaToken) {
    await knex.schema.withSchema('crm').alterTable('inquiries', (table) => {
      table.text('captcha_token').nullable();
    });
    console.log('Added captcha_token column to crm.inquiries');
  } else {
    console.log('captcha_token column already exists in crm.inquiries');
  }

  // === Refactor content.authors ===

  // To make dropping PK and specific FKs safer, it's often better to get their actual names first.
  // However, for a single known author and controlled environment, direct alterations can be okay.
  // Assuming default or known constraint names if not fetching dynamically.

  // 1. Drop old PK from content.authors (actual name might vary, e.g., authors_pkey)
  // We need to know the actual constraint name or handle it robustly.
  // For simplicity in this draft, we assume it will be dropped when the column is dropped if it's the PK column.
  // More robust: await knex.raw('ALTER TABLE content.authors DROP CONSTRAINT authors_pkey;');
  // Note: Dropping the column that is the PK will automatically drop the PK constraint.
  if (await knex.schema.withSchema('content').hasColumn('authors', 'author_id')) {
    // If there are posts referencing authors.author_id, that FK must be dropped first from content.posts
    const fkPostsAuthorConstraint = await knex.raw(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'content' AND table_name = 'posts' AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%posts_author_id_fkey%'; -- or whatever the actual name pattern is
    `);
    if (fkPostsAuthorConstraint.rows.length > 0) {
      const fkName = fkPostsAuthorConstraint.rows[0].constraint_name;
      await knex.raw(`ALTER TABLE content.posts DROP CONSTRAINT "${fkName}";`);
    }
    console.log('Dropped FK from content.posts to content.authors.author_id (if existed)');

    // Now drop the PK column from authors (which also drops the PK constraint)
    await knex.schema.withSchema('content').table('authors', (table) => {
      table.dropColumn('author_id');
    });
    console.log('Dropped old author_id VARCHAR column from content.authors');
  }

  // PRE-CLEANUP: Ensure only the single intended author row exists before adding the new UUID PK.
  // This assumes any other rows are artifacts to be removed.
  const singleAuthorName = 'Angus Hally';
  const deletedUnexpectedAuthors = await knex('content.authors').whereNot({ author_name: singleAuthorName }).delete();
  if (deletedUnexpectedAuthors > 0) {
    console.warn(`WARNING: Deleted ${deletedUnexpectedAuthors} unexpected rows from content.authors that did not match name: ${singleAuthorName}`);
  }
  const authorCount = await knex('content.authors').count('*');
  if (authorCount[0].count > 1) {
      console.error('CRITICAL: content.authors still contains more than one row after cleanup attempt. Aborting to prevent issues.');
      throw new Error('content.authors cleanup failed, multiple rows detected.');
  } else if (authorCount[0].count === 0) {
      console.error('CRITICAL: content.authors is empty after cleanup attempt (expected one row). Aborting.');
      throw new Error('content.authors cleanup failed, no rows detected.');
  }

  // 2. Add new id UUID column to content.authors (initially nullable)
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.uuid('id'); 
  });
  console.log('Added new id UUID column (nullable) to content.authors');

  // 2.5. Ensure all existing rows get some UUID if they don't have one, to allow NOT NULL later
  // This is a safety for any unexpected rows. The specific user will be updated next.
  await knex.raw(`UPDATE content.authors SET id = gen_random_uuid() WHERE id IS NULL;`);
  console.log('Assigned temporary UUIDs to any existing author rows with NULL id (should only be the one if cleanup worked)');

  // 3. Populate/Overwrite the id for the specific existing author
  // Ensure the user '95288f22-6049-4651-85ae-4932ededb5ab' exists in identity.users before this.
  // Ensure the column name is 'author_name' before it's renamed later in this script.
  const authorNameForUpdate = 'Angus Hally'; // Define clearly
  const targetAuthorUuid = '95288f22-6049-4651-85ae-4932ededb5ab';

  console.log(`Attempting to update author: "${authorNameForUpdate}" to id: ${targetAuthorUuid}`);

  const updatedRows = await knex('content.authors')
    .where({ author_name: authorNameForUpdate }) // Assumes column is still 'author_name'
    .update({
      id: targetAuthorUuid
    });

  if (updatedRows > 0) {
    console.log(`Successfully updated id for ${updatedRows} author row(s) named "${authorNameForUpdate}" to ${targetAuthorUuid}`);
  } else {
    console.warn(`WARNING: No author rows found with author_name "${authorNameForUpdate}" to update. The ID was not set to ${targetAuthorUuid}. This might cause FK issues.`);
    // Optional: Query the table to see what the name actually is
    const currentAuthorData = await knex('content.authors').select('author_name', 'name', 'id').first(); // Assuming one row
    console.warn('Current author data that was not updated:', currentAuthorData);
  }

  // 4. Alter the id column to be NOT NULL and then add PRIMARY KEY constraint
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.uuid('id').notNullable().alter();
  });
  await knex.raw('ALTER TABLE content.authors ADD CONSTRAINT authors_pkey PRIMARY KEY (id);');
  console.log('Made id NOT NULL and PRIMARY KEY in content.authors');
  
  // 5. Add FK constraint from content.authors.id to identity.users.id
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.foreign('id', 'fk_authors_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
  });
  console.log('Added FK from content.authors.id to identity.users.id');

  // 6. Rename author_name to name
  if (await knex.schema.withSchema('content').hasColumn('authors', 'author_name')) {
    await knex.schema.withSchema('content').alterTable('authors', (table) => {
      table.renameColumn('author_name', 'name');
    });
    console.log('Renamed author_name to name in content.authors');
  }

  // 7. Change author_createddate to created_at TIMESTAMPTZ
  if (await knex.schema.withSchema('content').hasColumn('authors', 'author_createddate')) {
    await knex.schema.withSchema('content').alterTable('authors', (table) => {
      table.renameColumn('author_createddate', 'created_at');
    });
    await knex.raw('ALTER TABLE content.authors ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ;');
    console.log('Changed author_createddate to created_at TIMESTAMPTZ in content.authors');
  }
  
  // 8. Add updated_at to content.authors
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
  console.log('Added updated_at to content.authors');


  // === Refactor content.posts ===

  // 1. Drop old author_name column from content.posts (it was VARCHAR)
  if (await knex.schema.withSchema('content').hasColumn('posts', 'author_name')) {
    await knex.schema.withSchema('content').table('posts', (table) => {
      table.dropColumn('author_name');
    });
    console.log('Dropped author_name from content.posts');
  }
  
  // 2. Drop old author_id VARCHAR column from content.posts (FK already dropped above)
  if (await knex.schema.withSchema('content').hasColumn('posts', 'author_id')) {
      await knex.schema.withSchema('content').table('posts', (table) => {
        table.dropColumn('author_id');
      });
      console.log('Dropped old author_id VARCHAR column from content.posts');
  }

  // 3. Add new author_id UUID to content.posts
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.uuid('author_id');
  });
  console.log('Added new author_id UUID column to content.posts');

  // 4. Populate new author_id for all posts
  await knex('content.posts').update({ author_id: '95288f22-6049-4651-85ae-4932ededb5ab' });
  console.log('Populated new author_id for all posts in content.posts');

  // 5. Alter author_id to be NOT NULL
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.uuid('author_id').notNullable().alter();
  });
  console.log('Made author_id NOT NULL in content.posts');

  // 6. Add new FK from content.posts.author_id to identity.users.id
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.foreign('author_id', 'fk_posts_author_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
  });
  console.log('Added FK from content.posts.author_id to identity.users.id');

  // 7. Change created_at to TIMESTAMPTZ in content.posts
  if (await knex.schema.withSchema('content').hasColumn('posts', 'created_at')) {
    await knex.raw('ALTER TABLE content.posts ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ;');
    console.log('Changed created_at to TIMESTAMPTZ in content.posts');
  }

  // 8. Add updated_at to content.posts (as it was missing and desired)
  if (!await knex.schema.withSchema('content').hasColumn('posts', 'updated_at')) {
    await knex.schema.withSchema('content').alterTable('posts', (table) => {
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    });
    console.log('Added updated_at to content.posts');
  }

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // === Remove captcha_token from crm.inquiries ===
  // First check if the column exists to avoid errors
  const hasCaptchaToken = await knex.schema.withSchema('crm').hasColumn('inquiries', 'captcha_token');
  if (hasCaptchaToken) {
    await knex.schema.withSchema('crm').alterTable('inquiries', (table) => {
      table.dropColumn('captcha_token');
    });
    console.log('Removed captcha_token column from crm.inquiries');
  } else {
    console.log('captcha_token column does not exist in crm.inquiries, skipping removal');
  }

  // === Revert content.authors and content.posts changes ===
  // 1. Drop new FK and author_id UUID
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.dropForeign('author_id', 'fk_posts_author_identity_user');
  });
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.dropColumn('author_id');
  });
  if (await knex.schema.withSchema('content').hasColumn('posts', 'updated_at')) {
      // Assuming it was added by this migration's up() if it exists now
      await knex.schema.withSchema('content').table('posts', (table) => {
        table.dropColumn('updated_at');
      });
  }
  await knex.raw('ALTER TABLE content.posts ALTER COLUMN created_at TYPE DATE USING created_at::DATE;');

  // 2. Re-add old author_id VARCHAR and author_name VARCHAR
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.string('author_id', 255);
    table.string('author_name', 255);
  });
  // Data population for old author_id/author_name would require knowing the original state or joining with reverted authors table.
  // For simplicity, we're not repopulating them here.
  
  // === Revert content.authors ===
  // 1. Drop new FK, new PK (id UUID), and updated_at
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.dropForeign('id', 'fk_authors_identity_user');
  });
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.dropPrimary(); // Drops PK on 'id'
    table.dropColumn('id');
  });
  if (await knex.schema.withSchema('content').hasColumn('authors', 'updated_at')) {
      await knex.schema.withSchema('content').table('authors', (table) => {
        table.dropColumn('updated_at');
      });
  }
  await knex.raw('ALTER TABLE content.authors ALTER COLUMN created_at TYPE DATE USING created_at::DATE;');
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.renameColumn('created_at', 'author_createddate');
  });
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.renameColumn('name', 'author_name');
  });

  // 2. Re-add old author_id VARCHAR, populate it, then make it PK
  // Step 2.1: Add the old author_id column as nullable first
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
    table.string('author_id', 255).nullable();
  });
  
  // Step 2.2: Repopulate old author_id 'angus_hally' for the single author.
  // Ensure author_name is reverted before this where clause can work.
  await knex('content.authors')
    .where({ author_name: 'Angus Hally' }) // Use the reverted column name
    .update({ author_id: 'angus_hally' });

  // Step 2.3: If there could be other authors (e.g. from failed/partial previous states)
  // that didn't match 'Angus Hally', they would have NULL author_id.
  // For a PK, these must be handled: either delete them or assign a unique ID.
  // Given the context of a single author, we'll assume the update above covers the only row.
  // If not, a cleanup step would be needed here, e.g.:
  // await knex('content.authors').withSchema('content').whereNull('author_id').delete();

  // Step 2.4: Now make the author_id column NOT NULL and then PRIMARY KEY.
  await knex.schema.withSchema('content').alterTable('authors', (table) => {
      table.string('author_id', 255).notNullable().alter();
  });
  // Add primary key constraint using raw SQL to match the error's format and ensure specific naming.
  // Knex's .primary() on an existing column might try to rename, so raw is safer for just adding constraint.
  await knex.raw('ALTER TABLE content.authors ADD CONSTRAINT authors_pkey PRIMARY KEY (author_id);');

  // 3. Re-add FK from posts to authors on VARCHAR author_id
  // This assumes the constraint was named 'posts_author_id_fkey' as per psql output
  await knex.schema.withSchema('content').alterTable('posts', (table) => {
    table.foreign('author_id', 'posts_author_id_fkey').references('author_id').inTable('content.authors');
  });

  console.warn('Down migration for content authors/posts refactor executed. Data may need manual verification/restoration.');
}; 