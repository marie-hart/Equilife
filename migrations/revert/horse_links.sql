-- Supprimer les index
DROP INDEX IF EXISTS idx_events_horse_id;
DROP INDEX IF EXISTS idx_materials_horse_id;

-- Supprimer les colonnes
ALTER TABLE events DROP COLUMN IF EXISTS horse_id;
ALTER TABLE materials DROP COLUMN IF EXISTS horse_id;
-- Revert horse_care_db:horse_links from pg

BEGIN;

-- XXX Add DDLs here.

COMMIT;
