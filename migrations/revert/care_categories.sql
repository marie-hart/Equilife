BEGIN;
ALTER TABLE events DROP COLUMN IF EXISTS category;
DO $$
BEGIN
    IF to_regclass('public.care_history') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE care_history DROP COLUMN IF EXISTS category';
    END IF;
END $$;
COMMIT;
