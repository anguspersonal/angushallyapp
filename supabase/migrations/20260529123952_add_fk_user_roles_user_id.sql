-- Sub-task 2 of #75: add the missing FK on identity.user_roles.user_id.
--
-- identity.user_roles.role_id already FKs identity.roles ON DELETE CASCADE, but
-- user_id had no FK to identity.users.id -- so orphaned grants were structurally
-- possible. A pre-check on 2026-05-29 found 10 orphan rows whose user_id is
-- absent from identity.users (only 3 real users exist; owner confirmed the
-- orphans are dead grants from removed users). This migration purges those
-- orphans, then adds the FK with the same cascade semantics as role_id so the
-- gap can't recur.
--
-- Orphan user_ids removed (recorded for audit; the DELETE below is by predicate,
-- not by id):
--   569fcc48-8e43-4723-908f-e3b153778a0c  88f9fdeb-0954-4918-a2c8-b7ad6c41721b
--   e5b87a4f-64a4-49da-a119-2749b8379b2d  56e9869d-7f78-479e-a6a8-06f4d1c81c71
--   a385bd68-0479-496d-b71f-00e0040ed212  b3ff6d6e-4c48-4605-bc1b-505f0cd2d641
--   1a131cf0-fa35-4c9c-930e-a78c2cd08b5f  6c86d3b7-07a2-4347-9129-3c87feb559b3
--   12b3ac69-1119-46c5-a929-e0c7c333842c  39aafff4-dba0-42dc-bf38-040f38e5ff9e
--
-- Idempotent: the DELETE is naturally a no-op on re-run (no orphans left); the
-- FK add is guarded by a pg_constraint existence check (FK ADD CONSTRAINT has no
-- IF NOT EXISTS form).
--
-- Reversible: the FK is droppable, but the orphan DELETE is NOT reversible
-- without the removed rows. The 10 user_ids above are the audit record. To drop
-- only the constraint:
--   BEGIN;
--   ALTER TABLE identity.user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_user_id;
--   COMMIT;

BEGIN;

-- 1. Remove orphaned role assignments (user_id not present in identity.users).
DELETE FROM identity.user_roles ur
WHERE NOT EXISTS (
  SELECT 1 FROM identity.users u WHERE u.id = ur.user_id
);

-- 2. Add the missing FK, matching role_id's ON DELETE CASCADE.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_user_roles_user_id'
      AND conrelid = 'identity.user_roles'::regclass
  ) THEN
    ALTER TABLE identity.user_roles
      ADD CONSTRAINT fk_user_roles_user_id
      FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
