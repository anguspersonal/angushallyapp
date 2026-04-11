/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // === Update habit.habit_log ===
  // Step 1: Drop the google_user_id index if it exists
  await knex.raw('DROP INDEX IF EXISTS habit.idx_habit_log_google_user_id;');

  // Step 2: Drop the google_user_id column if it exists
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'google_user_id')) {
    await knex.schema.withSchema('habit').table('habit_log', t => t.dropColumn('google_user_id'));
  }
  
  // Step 3: Add new nullable temporary UUID column for new user FK (only if it doesn't exist)
  if (!await knex.schema.withSchema('habit').hasColumn('habit_log', 'identity_user_id_temp')) {
    await knex.schema.withSchema('habit').table('habit_log', t => t.uuid('identity_user_id_temp').nullable());
  }

  // Step 4: Populate identity_user_id_temp (only for rows where it's currently NULL and a match is found)
  // This assumes the old user_id (integer) still exists on habit_log for mapping.
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id') && await knex.schema.withSchema('habit').hasColumn('habit_log', 'identity_user_id_temp')) {
    const oldUserColInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'habit_log' AND column_name = 'user_id';");
    const oldUserColInfo = oldUserColInfoResult[0];
    if (oldUserColInfo && oldUserColInfo.data_type === 'integer') {
      await knex.raw(`
        UPDATE habit.habit_log hhl
        SET identity_user_id_temp = iu.id
        FROM identity.users iu
        WHERE (iu.metadata->>'legacy_habit_user_id')::integer = hhl.user_id 
          AND iu.metadata->>'legacy_source' = 'habit_deprecated_users'
          AND hhl.identity_user_id_temp IS NULL;
      `);
    }
  }

  // Step 5: Drop the old foreign key constraint (if user_id column and the FK still exist)
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
     // Check if user_id is integer type before trying to drop FK that expects integer column
    const userColInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'habit_log' AND column_name = 'user_id';");
    const userColInfo = userColInfoResult[0];
    if (userColInfo && userColInfo.data_type === 'integer') {
      await knex.raw('ALTER TABLE habit.habit_log DROP CONSTRAINT IF EXISTS habit_log_user_id_fkey;');
    }
  }
  
  // Step 6: Drop the old integer user_id column (if it exists and is integer)
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
    const userColInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'habit_log' AND column_name = 'user_id';");
    const userColInfo = userColInfoResult[0];
    if (userColInfo && userColInfo.data_type === 'integer') {
        await knex.schema.withSchema('habit').table('habit_log', t => t.dropColumn('user_id'));
    }
  }
  
  // Step 7: Rename the temporary column to user_id (if temp exists and final user_id either doesn't exist or isn't already UUID)
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'identity_user_id_temp')) {
    let renameTemp = true;
    if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
        const userColInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'habit_log' AND column_name = 'user_id';");
        const userColInfo = userColInfoResult[0];
        if (userColInfo && userColInfo.data_type === 'uuid') { 
            await knex.schema.withSchema('habit').table('habit_log', t => t.dropColumn('identity_user_id_temp'));
            renameTemp = false;
        } else { // user_id exists but is not UUID, drop it so we can rename temp
            await knex.schema.withSchema('habit').table('habit_log', t => t.dropColumn('user_id'));
        }
    }
    if (renameTemp) { 
        await knex.schema.withSchema('habit').table('habit_log', t => t.renameColumn('identity_user_id_temp', 'user_id'));
    }
  }

  // Step 8: New user_id column remains nullable (as per previous decision)

  // Step 9: Add the new foreign key constraint (if user_id is now UUID and FK doesn't exist)
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
    const userColInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'habit_log' AND column_name = 'user_id';");
    const userColInfo = userColInfoResult[0];
    if (userColInfo && userColInfo.data_type === 'uuid') {
        const fkExistsResult = await knex.raw(
          `SELECT 1 FROM information_schema.table_constraints ` +
          `WHERE constraint_schema = 'habit' AND table_name = 'habit_log' AND constraint_name = 'fk_habit_log_identity_user' AND constraint_type = 'FOREIGN KEY';`
        );
        const fkExists = fkExistsResult.length > 0;
        if (!fkExists) {
            await knex.schema.withSchema('habit').table('habit_log', t => {
                t.foreign('user_id', 'fk_habit_log_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
            });
        }
    }
  }

  // === Update habit.alcohol ===
  await knex.raw('DROP INDEX IF EXISTS habit.idx_alcohol_google_user_id;');

  if (await knex.schema.withSchema('habit').hasColumn('alcohol', 'google_user_id')) {
    await knex.schema.withSchema('habit').table('alcohol', t => t.dropColumn('google_user_id'));
  }

  let alcoholHasUserId = await knex.schema.withSchema('habit').hasColumn('alcohol', 'user_id');
  if (alcoholHasUserId) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'alcohol' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type !== 'uuid') {
      console.warn('habit.alcohol.user_id exists but is not UUID. Replacing it.');
      await knex.schema.withSchema('habit').table('alcohol', t => t.dropColumn('user_id'));
      alcoholHasUserId = false; // Re-set flag as we dropped it
    }
  }
  if (!alcoholHasUserId) {
    await knex.schema.withSchema('habit').table('alcohol', t => t.uuid('user_id').nullable());
  }

  await knex.raw(`
    UPDATE habit.alcohol ha
    SET user_id = hhl.user_id
    FROM habit.habit_log hhl
    WHERE ha.log_id = hhl.id AND ha.user_id IS NULL;
  `);

  const finalAlcoholUserColCheckResult = await knex.schema.withSchema('habit').hasColumn('alcohol', 'user_id') ? 
                                (await knex.raw('SELECT data_type FROM information_schema.columns WHERE table_schema = \'habit\' AND table_name = \'alcohol\' AND column_name = \'user_id\';')) : null;
  const finalAlcoholUserColInfo = finalAlcoholUserColCheckResult ? finalAlcoholUserColCheckResult[0] : null;                            
  if (finalAlcoholUserColInfo && finalAlcoholUserColInfo.data_type === 'uuid') {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'alcohol' AND constraint_name = 'fk_alcohol_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;
    if (!fkExists) {
        await knex.schema.withSchema('habit').table('alcohol', t => {
            t.foreign('user_id', 'fk_alcohol_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
        });
    }
  } else {
      console.error('CRITICAL: habit.alcohol.user_id is not UUID or does not exist. FK not added.');
  }

  // === Update habit.exercise ===
  await knex.raw('DROP INDEX IF EXISTS habit.idx_exercise_google_user_id;');

  if (await knex.schema.withSchema('habit').hasColumn('exercise', 'google_user_id')) {
    await knex.schema.withSchema('habit').table('exercise', t => t.dropColumn('google_user_id'));
  }

  let exerciseHasUserId = await knex.schema.withSchema('habit').hasColumn('exercise', 'user_id');
  if (exerciseHasUserId) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'exercise' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type !== 'uuid') {
      console.warn('habit.exercise.user_id exists but is not UUID. Replacing it.');
      await knex.schema.withSchema('habit').table('exercise', t => t.dropColumn('user_id'));
      exerciseHasUserId = false; // Re-set flag as we dropped it
    }
  }
  if (!exerciseHasUserId) {
    await knex.schema.withSchema('habit').table('exercise', t => t.uuid('user_id').nullable());
  }

  await knex.raw(`
    UPDATE habit.exercise he
    SET user_id = hhl.user_id
    FROM habit.habit_log hhl
    WHERE he.log_id = hhl.id AND he.user_id IS NULL;
  `);

  const finalExerciseUserColCheckResult = await knex.schema.withSchema('habit').hasColumn('exercise', 'user_id') ? 
                                (await knex.raw('SELECT data_type FROM information_schema.columns WHERE table_schema = \'habit\' AND table_name = \'exercise\' AND column_name = \'user_id\';')) : null;
  const finalExerciseUserColInfo = finalExerciseUserColCheckResult ? finalExerciseUserColCheckResult[0] : null;
  if (finalExerciseUserColInfo && finalExerciseUserColInfo.data_type === 'uuid') {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'exercise' AND constraint_name = 'fk_exercise_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;
    if (!fkExists) {
        await knex.schema.withSchema('habit').table('exercise', t => {
            t.foreign('user_id', 'fk_exercise_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
        });
    }
  } else {
      console.error('CRITICAL: habit.exercise.user_id is not UUID or does not exist. FK not added.');
  }

  // === Update habit.drink_catalog ===
  let drinkCatalogUserIdIsUuid = false;
  const drinkCatalogHasUserIdColumn = await knex.schema.withSchema('habit').hasColumn('drink_catalog', 'user_id');

  if (drinkCatalogHasUserIdColumn) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'drink_catalog' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type === 'uuid') {
      drinkCatalogUserIdIsUuid = true;
    } else if (colInfo) { // Column exists but is not UUID
      console.warn('habit.drink_catalog.user_id exists but is not UUID. Replacing it. Data in this column will be lost.');
      await knex.schema.withSchema('habit').table('drink_catalog', t => t.dropColumn('user_id'));
      await knex.schema.withSchema('habit').table('drink_catalog', t => t.uuid('user_id').nullable().comment('Owner of the custom drink entry, NULL for global/seeded drinks'));
      drinkCatalogUserIdIsUuid = true; // It has been made UUID
    }
  } else { // user_id column does not exist, so add it as UUID
    await knex.schema.withSchema('habit').table('drink_catalog', function(table) {
      table.uuid('user_id').nullable().comment('Owner of the custom drink entry, NULL for global/seeded drinks');
    });
    drinkCatalogUserIdIsUuid = true; // It was just created as UUID
  }

  // Note: No data update for existing entries as their user_id will remain NULL (global/seeded drinks).

  // Add the new foreign key constraint if user_id is now UUID and FK doesn't exist
  if (drinkCatalogUserIdIsUuid) {
    const fkResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'drink_catalog' AND constraint_name = 'fk_drink_catalog_owner_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkResult.length > 0;

    if (!fkExists) {
        await knex.schema.withSchema('habit').table('drink_catalog', function(table) {
            table.foreign('user_id', 'fk_drink_catalog_owner_user').references('id').inTable('identity.users').onDelete('SET NULL');
        });
    }
  } else {
      console.warn('CRITICAL: habit.drink_catalog.user_id could not be confirmed as UUID. FK not added.');
  }

  // === Update habit.exercises (the catalog of exercise types) ===
  // This table has an existing integer user_id that needs to be converted to UUID and repointed.

  // Step 1: Add identity_user_id_temp UUID column if it doesn't exist.
  if (!await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp')) {
    await knex.schema.withSchema('habit').table('exercises', function(table) {
      table.uuid('identity_user_id_temp').nullable().comment('Temporary column for new UUID user FK');
    });
  }

  // Step 2: Populate identity_user_id_temp from old integer user_id (if old user_id exists and is integer).
  let exercisesOriginalUserIdIsInteger = false;
  if (await knex.schema.withSchema('habit').hasColumn('exercises', 'user_id')) {
      const colTypeResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'exercises' AND column_name = 'user_id';");
      exercisesOriginalUserIdIsInteger = colTypeResult[0]?.data_type === 'integer';
  }

  if (!await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp')) {
    await knex.schema.withSchema('habit').table('exercises', t => t.uuid('identity_user_id_temp').nullable().comment('Temporary column for new UUID user FK'));
  }

  if (exercisesOriginalUserIdIsInteger && await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp')) {
    await knex.raw(`
      UPDATE habit.exercises he
      SET identity_user_id_temp = iu.id
      FROM identity.users iu
      WHERE (iu.metadata->>'legacy_habit_user_id')::integer = he.user_id 
        AND iu.metadata->>'legacy_source' = 'habit_deprecated_users'
        AND he.identity_user_id_temp IS NULL;
    `);
  }
  // Note: Global exercises (where old user_id was NULL) will have identity_user_id_temp as NULL.

  // Step 3: Drop the old foreign key constraint workout_sessions_user_id_fkey if it exists.
  await knex.raw('ALTER TABLE habit.exercises DROP CONSTRAINT IF EXISTS workout_sessions_user_id_fkey;');
  
  // Step 4: Drop the old integer user_id column if it was indeed integer type.
  if (exercisesOriginalUserIdIsInteger) { 
    await knex.schema.withSchema('habit').table('exercises', t => t.dropColumn('user_id'));
  } 

  // Step 5: Rename identity_user_id_temp to user_id, if temp exists and user_id either doesn't or isn't UUID.
  const exercisesHasIdentityTemp = await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp');
  if (exercisesHasIdentityTemp) {
    let renameTempToUserId = true;
    if (await knex.schema.withSchema('habit').hasColumn('exercises', 'user_id')) {
      const finalUserColTypeResult = await knex.raw('SELECT data_type FROM information_schema.columns WHERE table_schema = \'habit\' AND table_name = \'exercises\' AND column_name = \'user_id\';');
      const finalUserColTypeInfo = finalUserColTypeResult[0];
      if (finalUserColTypeInfo && finalUserColTypeInfo.data_type === 'uuid') { 
        await knex.schema.withSchema('habit').table('exercises', t => t.dropColumn('identity_user_id_temp')); 
        renameTempToUserId = false;
      } else { 
        await knex.schema.withSchema('habit').table('exercises', t => t.dropColumn('user_id'));
      }
    }
    if (renameTempToUserId) { 
      await knex.schema.withSchema('habit').table('exercises', t => t.renameColumn('identity_user_id_temp', 'user_id'));
    }
  }
  // Step 6: The new user_id (UUID) column should be nullable.

  // Step 7: Add the new foreign key constraint to identity.users (if user_id is UUID and FK doesn't exist).
  let finalExercisesUserColIsUuid = false;
  if (await knex.schema.withSchema('habit').hasColumn('exercises', 'user_id')) {
      const colInfoResult = await knex.raw('SELECT data_type FROM information_schema.columns WHERE table_schema = \'habit\' AND table_name = \'exercises\' AND column_name = \'user_id\';');
      finalExercisesUserColIsUuid = colInfoResult[0]?.data_type === 'uuid';
  }

  if (finalExercisesUserColIsUuid) {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'exercises' AND constraint_name = 'fk_exercises_owner_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;
    if (!fkExists) {
      await knex.schema.withSchema('habit').table('exercises', function(table) {
        table.foreign('user_id', 'fk_exercises_owner_user').references('id').inTable('identity.users').onDelete('SET NULL');
      });
    }
  } else {
    console.warn('CRITICAL: habit.exercises.user_id is not UUID or does not exist after modifications. FK not added.');
  }

  // === Update habit.strava_activities ===
  // This table initially has no user_id. We add one and default existing records.

  // Step 1: Ensure user_id column exists as UUID, initially nullable.
  let stravaActivitiesUserIdIsUuid = false;
  const stravaActivitiesHasUserIdColumn = await knex.schema.withSchema('habit').hasColumn('strava_activities', 'user_id');

  if (stravaActivitiesHasUserIdColumn) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'strava_activities' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type === 'uuid') {
      stravaActivitiesUserIdIsUuid = true;
    } else if (colInfo) { // Column exists but is not UUID
      console.warn('habit.strava_activities.user_id exists but is not UUID. Replacing it. Potential data loss if column had incompatible data.');
      await knex.schema.withSchema('habit').table('strava_activities', t => t.dropColumn('user_id'));
      await knex.schema.withSchema('habit').table('strava_activities', t => t.uuid('user_id').nullable().comment('Owner of the Strava activity'));
      stravaActivitiesUserIdIsUuid = true; // It has been made UUID
    }
  } else { // user_id column does not exist, so add it as UUID nullable
    await knex.schema.withSchema('habit').table('strava_activities', function(table) {
      table.uuid('user_id').nullable().comment('Owner of the Strava activity');
    });
    stravaActivitiesUserIdIsUuid = true; // It was just created as UUID
  }

  // Step 2: Populate the new user_id for all existing records with your specific UUID (if user_id is NULL)
  if (stravaActivitiesUserIdIsUuid) { // Only proceed if column is confirmed UUID
    await knex.raw(`
      UPDATE habit.strava_activities
      SET user_id = '95288f22-6049-4651-85ae-4932ededb5ab'
      WHERE user_id IS NULL; -- Only populate if not already set (e.g., by a previous partial run)
    `);
  }

  // Step 3: Alter the user_id column to be NOT NULL (if it's UUID)
  if (stravaActivitiesUserIdIsUuid) {
    await knex.schema.withSchema('habit').alterTable('strava_activities', function(table) {
      table.uuid('user_id').notNullable().alter();
    });
  }

  // Step 4: Add the new foreign key constraint (if user_id is UUID and FK doesn't exist)
  if (stravaActivitiesUserIdIsUuid) {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'strava_activities' AND constraint_name = 'fk_strava_activities_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;

    if (!fkExists) {
        await knex.schema.withSchema('habit').table('strava_activities', function(table) {
            table.foreign('user_id', 'fk_strava_activities_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
        });
    }
  } else {
      console.warn('CRITICAL: habit.strava_activities.user_id could not be confirmed as UUID. FK and NOT NULL constraint not added.');
  }

  // === Update habit.strava_sync_log ===
  // This table initially has no user_id. We add one and default existing records.

  // Step 1: Ensure user_id column exists as UUID, initially nullable.
  let stravaSyncLogUserIdIsUuid = false;
  const stravaSyncLogHasUserIdColumn = await knex.schema.withSchema('habit').hasColumn('strava_sync_log', 'user_id');

  if (stravaSyncLogHasUserIdColumn) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'strava_sync_log' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type === 'uuid') {
      stravaSyncLogUserIdIsUuid = true;
    } else if (colInfo) { // Column exists but is not UUID
      console.warn('habit.strava_sync_log.user_id exists but is not UUID. Replacing it. Potential data loss if column had incompatible data.');
      await knex.schema.withSchema('habit').table('strava_sync_log', t => t.dropColumn('user_id'));
      await knex.schema.withSchema('habit').table('strava_sync_log', t => t.uuid('user_id').nullable().comment('User who performed/owns this sync operation'));
      stravaSyncLogUserIdIsUuid = true; // It has been made UUID
    }
  } else { // user_id column does not exist, so add it as UUID nullable
    await knex.schema.withSchema('habit').table('strava_sync_log', function(table) {
      table.uuid('user_id').nullable().comment('User who performed/owns this sync operation');
    });
    stravaSyncLogUserIdIsUuid = true; // It was just created as UUID
  }

  // Step 2: Populate the new user_id for all existing records with your specific UUID (if user_id is NULL)
  if (stravaSyncLogUserIdIsUuid) { 
    await knex.raw(`\n      UPDATE habit.strava_sync_log\n      SET user_id = \'95288f22-6049-4651-85ae-4932ededb5ab\'\n      WHERE user_id IS NULL; -- Only populate if not already set
    `);
  }

  // Step 3: Alter the user_id column to be NOT NULL (if it's UUID)
  if (stravaSyncLogUserIdIsUuid) {
    await knex.schema.withSchema('habit').alterTable('strava_sync_log', function(table) {
      table.uuid('user_id').notNullable().alter();
    });
  }

  // Step 4: Add the new foreign key constraint (if user_id is UUID and FK doesn't exist)
  if (stravaSyncLogUserIdIsUuid) {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'strava_sync_log' AND constraint_name = 'fk_strava_sync_log_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;

    if (!fkExists) {
        await knex.schema.withSchema('habit').table('strava_sync_log', function(table) {
            table.foreign('user_id', 'fk_strava_sync_log_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
        });
    }
  } else {
      console.warn('CRITICAL: habit.strava_sync_log.user_id could not be confirmed as UUID. FK and NOT NULL constraint not added.');
  }

  // === Update habit.strava_tokens ===
  // This table initially has no user_id. We add one, default existing, make it NOT NULL and UNIQUE.

  // Step 1: Ensure user_id column exists as UUID, initially nullable.
  let stravaTokensUserIdIsUuid = false;
  const stravaTokensHasUserIdColumn = await knex.schema.withSchema('habit').hasColumn('strava_tokens', 'user_id');

  if (stravaTokensHasUserIdColumn) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'strava_tokens' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type === 'uuid') {
      stravaTokensUserIdIsUuid = true;
    } else if (colInfo) { // Column exists but is not UUID
      console.warn('habit.strava_tokens.user_id exists but is not UUID. Replacing it. Potential data loss if column had incompatible data.');
      await knex.schema.withSchema('habit').table('strava_tokens', t => t.dropColumn('user_id'));
      await knex.schema.withSchema('habit').table('strava_tokens', t => t.uuid('user_id').nullable().comment('Link to the identity.users table'));
      stravaTokensUserIdIsUuid = true; // It has been made UUID
    }
  } else { // user_id column does not exist, so add it as UUID nullable
    await knex.schema.withSchema('habit').table('strava_tokens', function(table) {
      table.uuid('user_id').nullable().comment('Link to the identity.users table');
    });
    stravaTokensUserIdIsUuid = true; // It was just created as UUID
  }

  // Step 2: Populate the new user_id for all existing records with your specific UUID (if user_id is NULL)
  if (stravaTokensUserIdIsUuid) { 
    await knex.raw(`\n      UPDATE habit.strava_tokens\n      SET user_id = \'95288f22-6049-4651-85ae-4932ededb5ab\'\n      WHERE user_id IS NULL; -- Only populate if not already set
    `);
  }

  // Step 3: Alter the user_id column to be NOT NULL (if it's UUID)
  if (stravaTokensUserIdIsUuid) {
    await knex.schema.withSchema('habit').alterTable('strava_tokens', function(table) {
      table.uuid('user_id').notNullable().alter();
    });
  }

  // Step 4: Add UNIQUE constraint (if user_id is UUID and constraint doesn't exist)
  if (stravaTokensUserIdIsUuid) {
    const uqExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'strava_tokens' AND constraint_name = 'uq_strava_tokens_user_id' AND constraint_type = 'UNIQUE';`
    );
    const uqExists = uqExistsResult.length > 0;
    if (!uqExists) {
        await knex.schema.withSchema('habit').table('strava_tokens', function(table) {
            table.unique(['user_id'], 'uq_strava_tokens_user_id');
        });
    }
  }

  // Step 5: Add the new foreign key constraint (if user_id is UUID and FK doesn't exist)
  if (stravaTokensUserIdIsUuid) {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'strava_tokens' AND constraint_name = 'fk_strava_tokens_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;

    if (!fkExists) {
        await knex.schema.withSchema('habit').table('strava_tokens', function(table) {
            table.foreign('user_id', 'fk_strava_tokens_identity_user').references('id').inTable('identity.users').onDelete('CASCADE');
        });
    }
  } else {
      console.warn('CRITICAL: habit.strava_tokens.user_id could not be confirmed as UUID. Constraints and FK not added.');
  }

  // === Update habit.strength_sets ===
  // This table initially has no user_id. We add one and populate it from habit.exercises.user_id.

  // Step 1: Ensure user_id column exists as UUID, nullable.
  let strengthSetsUserIdIsUuid = false;
  const strengthSetsHasUserIdColumn = await knex.schema.withSchema('habit').hasColumn('strength_sets', 'user_id');

  if (strengthSetsHasUserIdColumn) {
    const colInfoResult = await knex.raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'habit' AND table_name = 'strength_sets' AND column_name = 'user_id';");
    const colInfo = colInfoResult[0];
    if (colInfo && colInfo.data_type === 'uuid') {
      strengthSetsUserIdIsUuid = true;
    } else if (colInfo) { // Column exists but is not UUID
      console.warn('habit.strength_sets.user_id exists but is not UUID. Replacing it. Potential data loss if column had incompatible data.');
      await knex.schema.withSchema('habit').table('strength_sets', t => t.dropColumn('user_id'));
      await knex.schema.withSchema('habit').table('strength_sets', t => t.uuid('user_id').nullable().comment('User associated with this strength set, via habit.exercises'));
      strengthSetsUserIdIsUuid = true; // It has been made UUID
    }
  } else { // user_id column does not exist, so add it as UUID nullable
    await knex.schema.withSchema('habit').table('strength_sets', function(table) {
      table.uuid('user_id').nullable().comment('User associated with this strength set, via habit.exercises');
    });
    strengthSetsUserIdIsUuid = true; // It was just created as UUID
  }

  // Step 2: Populate the new user_id by joining with habit.exercises (if user_id is NULL)
  // Assumes habit.exercises.user_id is already the correct UUID (or NULL for global exercises).
  if (strengthSetsUserIdIsUuid) { 
    await knex.raw(`\n      UPDATE habit.strength_sets hss\n      SET user_id = he.user_id \n      FROM habit.exercises he\n      WHERE hss.session_id = he.id AND hss.user_id IS NULL;\n    `);
    // Note: If he.user_id is NULL (global exercise), hss.user_id will be set to NULL (or remain NULL).
  }

  // Step 3: Add the new foreign key constraint (if user_id is UUID and FK doesn't exist)
  if (strengthSetsUserIdIsUuid) {
    const fkExistsResult = await knex.raw(
        `SELECT 1 FROM information_schema.table_constraints 
         WHERE constraint_schema = 'habit' AND table_name = 'strength_sets' AND constraint_name = 'fk_strength_sets_identity_user' AND constraint_type = 'FOREIGN KEY';`
    );
    const fkExists = fkExistsResult.length > 0;

    if (!fkExists) {
        await knex.schema.withSchema('habit').table('strength_sets', function(table) {
            table.foreign('user_id', 'fk_strength_sets_identity_user').references('id').inTable('identity.users').onDelete('SET NULL');
        });
    }
  } else {
      console.warn('CRITICAL: habit.strength_sets.user_id could not be confirmed as UUID. FK not added.');
  }

  // All habit schema FKs to identity.users should now be addressed.
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Reverting changes for habit.strength_sets (newest change, so first in down)
  await knex.raw('ALTER TABLE habit.strength_sets DROP CONSTRAINT IF EXISTS fk_strength_sets_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('strength_sets', 'user_id')) {
    await knex.schema.withSchema('habit').table('strength_sets', function(table) {
      table.dropColumn('user_id');
    });
  }

  // Reverting changes for habit.strava_tokens
  await knex.raw('ALTER TABLE habit.strava_tokens DROP CONSTRAINT IF EXISTS uq_strava_tokens_user_id;');
  await knex.raw('ALTER TABLE habit.strava_tokens DROP CONSTRAINT IF EXISTS fk_strava_tokens_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('strava_tokens', 'user_id')) {
    await knex.schema.withSchema('habit').table('strava_tokens', function(table) {
      table.dropColumn('user_id');
    });
  }

  // Reverting changes for habit.strava_sync_log
  await knex.raw('ALTER TABLE habit.strava_sync_log DROP CONSTRAINT IF EXISTS fk_strava_sync_log_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('strava_sync_log', 'user_id')) {
    await knex.schema.withSchema('habit').table('strava_sync_log', function(table) {
      table.dropColumn('user_id');
    });
  }

  // Reverting changes for habit.strava_activities
  await knex.raw('ALTER TABLE habit.strava_activities DROP CONSTRAINT IF EXISTS fk_strava_activities_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('strava_activities', 'user_id')) {
    await knex.schema.withSchema('habit').table('strava_activities', function(table) {
      table.dropColumn('user_id');
    });
  }

  // Reverting changes for habit.exercises (catalog)
  await knex.raw('ALTER TABLE habit.exercises DROP CONSTRAINT IF EXISTS fk_exercises_owner_user;');
  
  // Check current state of user_id and identity_user_id_temp columns
  const exercisesHasCurrentUuidUserId = await knex.schema.withSchema('habit').hasColumn('exercises', 'user_id') && 
                                    ((await knex.raw('SELECT pg_typeof("user_id")::text as col_type FROM habit.exercises LIMIT 1;')).rows[0]?.col_type === 'uuid');
  const exercisesHasIdentityUserIdTemp = await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp');

  if (exercisesHasCurrentUuidUserId && !exercisesHasIdentityUserIdTemp) {
    // If user_id is UUID and temp doesn't exist, rename user_id to temp (this is the main path if up() completed rename)
    await knex.schema.withSchema('habit').table('exercises', function(table) { 
      table.renameColumn('user_id', 'identity_user_id_temp'); 
    });
  } else if (exercisesHasCurrentUuidUserId && exercisesHasIdentityUserIdTemp) {
    // Both exist, user_id is UUID, temp is also there (unexpected, maybe from partial fail). Drop user_id (UUID).
    await knex.schema.withSchema('habit').table('exercises', function(table) { table.dropColumn('user_id'); });
  }
  // If only exercisesHasIdentityUserIdTemp is true, we use it. If neither, something is wrong, but proceed to add integer user_id.

  // Ensure integer user_id column is (re)added if it doesn't exist, or if user_id exists but is not integer type.
  let ensureIntegerUserIdExercises = true;
  if (await knex.schema.withSchema('habit').hasColumn('exercises', 'user_id')) {
    const currentColTypeResult = await knex.raw('SELECT pg_typeof("user_id")::text as col_type FROM habit.exercises LIMIT 1;');
    const currentColType = currentColTypeResult.rows[0]?.col_type;
    if (currentColType === 'integer') {
      ensureIntegerUserIdExercises = false; // Already integer
    } else {
      await knex.schema.withSchema('habit').table('exercises', function(table) { table.dropColumn('user_id'); }); // Drop wrong type
    }
  }
  if (ensureIntegerUserIdExercises) {
    await knex.schema.withSchema('habit').table('exercises', function(table) { table.integer('user_id').nullable(); });
  }
  
  // Repopulate old integer user_id from identity_user_id_temp if it exists (it should be UUID type here)
  if (await knex.schema.withSchema('habit').hasColumn('exercises', 'identity_user_id_temp')) {
    await knex.raw(`
      UPDATE habit.exercises he
      SET user_id = (SELECT ius.metadata->>'legacy_habit_user_id' FROM identity.users ius WHERE ius.id = he.identity_user_id_temp AND ius.metadata->>'legacy_source' = 'habit_deprecated_users')::integer
      WHERE he.identity_user_id_temp IS NOT NULL;
    `);
    await knex.schema.withSchema('habit').table('exercises', function(table) { 
      table.dropColumn('identity_user_id_temp'); 
    });
  }
  
  // Re-add old FK to _deprecated_users
  await knex.schema.withSchema('habit').table('exercises', function(table) {
    // Ensure user_id is integer before adding FK that expects integer
    // This check is implicitly handled by the logic above that ensures user_id is integer.
    table.foreign('user_id', 'workout_sessions_user_id_fkey').references('user_id').inTable('habit._deprecated_users').onDelete('CASCADE');
  });

  // Reverting changes for habit.drink_catalog
  await knex.raw('ALTER TABLE habit.drink_catalog DROP CONSTRAINT IF EXISTS fk_drink_catalog_owner_user;');
  if (await knex.schema.withSchema('habit').hasColumn('drink_catalog', 'user_id')) {
    await knex.schema.withSchema('habit').table('drink_catalog', function(table) { table.dropColumn('user_id'); });
  }

  // Reverting changes for habit.exercise (logged instances table)
  await knex.raw('ALTER TABLE habit.exercise DROP CONSTRAINT IF EXISTS fk_exercise_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('exercise', 'user_id')) {
    await knex.schema.withSchema('habit').table('exercise', function(table) { table.dropColumn('user_id'); });
  }
  await knex.schema.withSchema('habit').table('exercise', function(table) {
    table.string('google_user_id', 255).nullable().defaultTo('anonymous');
  });

  // Reverting changes for habit.alcohol
  await knex.raw('ALTER TABLE habit.alcohol DROP CONSTRAINT IF EXISTS fk_alcohol_identity_user;');
  if (await knex.schema.withSchema('habit').hasColumn('alcohol', 'user_id')) {
    await knex.schema.withSchema('habit').table('alcohol', function(table) { table.dropColumn('user_id'); });
  }
  await knex.schema.withSchema('habit').table('alcohol', function(table) {
    table.string('google_user_id', 255).nullable().defaultTo('anonymous');
  });
  
  // Reverting changes for habit.habit_log
  await knex.raw('ALTER TABLE habit.habit_log DROP CONSTRAINT IF EXISTS fk_habit_log_identity_user;');
  // Handle habit_log user_id rename (UUID to temp, then drop temp, re-add int, populate int, re-add old FK)
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
    const habitLogUserColInfoResult = await knex.raw('SELECT pg_typeof("user_id")::text as col_type FROM habit.habit_log LIMIT 1;');
    const habitLogUserColInfo = habitLogUserColInfoResult[0];
    if (habitLogUserColInfo && habitLogUserColInfo.col_type === 'uuid') { // If user_id is UUID, it means rename from temp occurred in up()
      await knex.schema.withSchema('habit').table('habit_log', t => t.renameColumn('user_id', 'identity_user_id_temp'));
    }
  }
  // Ensure integer user_id column is added if it doesn't exist or if current user_id (after potential rename to temp) isn't integer
  let habitLogNeedsIntUserId = !await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id');
  if (!habitLogNeedsIntUserId && await knex.schema.withSchema('habit').hasColumn('habit_log', 'user_id')) {
    const currentHabitLogUserIdTypeResult = await knex.raw('SELECT pg_typeof("user_id")::text as col_type FROM habit.habit_log LIMIT 1;');
    const currentHabitLogUserIdType = currentHabitLogUserIdTypeResult[0]?.col_type;
    if (currentHabitLogUserIdType !== 'integer') {
      await knex.schema.withSchema('habit').table('habit_log', t => t.dropColumn('user_id'));
      habitLogNeedsIntUserId = true;
    }
  }
  if (habitLogNeedsIntUserId) {
    await knex.schema.withSchema('habit').table('habit_log', t => {t.integer('user_id').nullable()});
  }
  // Repopulate old integer user_id if identity_user_id_temp exists
  if (await knex.schema.withSchema('habit').hasColumn('habit_log', 'identity_user_id_temp')){
    await knex.raw(`
      UPDATE habit.habit_log hhl
      SET user_id = (iu.metadata->>'legacy_habit_user_id')::integer
      FROM identity.users iu
      WHERE iu.id = hhl.identity_user_id_temp
        AND iu.metadata->>'legacy_source' = 'habit_deprecated_users';
    `);
    await knex.schema.withSchema('habit').table('habit_log', function(table) {
      table.dropColumn('identity_user_id_temp');
    });
  }
  await knex.schema.withSchema('habit').table('habit_log', function(table) {  
    table.foreign('user_id', 'habit_log_user_id_fkey').references('user_id').inTable('habit._deprecated_users').onDelete('CASCADE');
    table.string('google_user_id', 255).nullable().defaultTo('anonymous');
  });
};
