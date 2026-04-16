BEGIN;

DROP TRIGGER IF EXISTS update_care_types_updated_at ON care_types;
DROP INDEX IF EXISTS idx_care_types_user_name_lower;
DROP INDEX IF EXISTS idx_care_types_user_id;
DROP TABLE IF EXISTS care_types;

COMMIT;
