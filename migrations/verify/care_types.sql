SELECT id, user_id, name, category, created_at, updated_at
FROM care_types
WHERE FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_care_types_user_id'
    ) THEN
        RAISE EXCEPTION 'Missing index idx_care_types_user_id';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_care_types_user_name_lower'
    ) THEN
        RAISE EXCEPTION 'Missing index idx_care_types_user_name_lower';
    END IF;
END $$;
