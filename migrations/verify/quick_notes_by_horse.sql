SELECT horse_id FROM quick_notes WHERE FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_quick_notes_horse_id'
    ) THEN
        RAISE EXCEPTION 'Missing index idx_quick_notes_horse_id';
    END IF;
END $$;
