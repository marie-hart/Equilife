BEGIN;

ALTER TABLE care_types
    DROP COLUMN IF EXISTS is_favorite;

COMMIT;
