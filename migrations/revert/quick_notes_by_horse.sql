BEGIN;

DROP INDEX IF EXISTS idx_quick_notes_horse_id;
ALTER TABLE quick_notes DROP COLUMN IF EXISTS horse_id;

COMMIT;
