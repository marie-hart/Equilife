BEGIN;

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS category VARCHAR(120);

DO $$
BEGIN
    IF to_regclass('public.care_history') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE care_history ADD COLUMN IF NOT EXISTS category VARCHAR(120)';
    END IF;
END $$;

COMMIT;
