-- Vérifier les colonnes horse_id
SELECT 1 FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'horse_id';

SELECT 1 FROM information_schema.columns
WHERE table_name = 'materials' AND column_name = 'horse_id';
-- Verify horse_care_db:horse_links on pg

BEGIN;

-- XXX Add verifications here.

ROLLBACK;
