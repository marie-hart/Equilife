SELECT id, user_id, name, category, is_favorite, created_at, updated_at
FROM care_types
WHERE FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'care_types'
          AND column_name = 'is_favorite'
          AND data_type = 'boolean'
    ) THEN
        RAISE EXCEPTION 'Missing column care_types.is_favorite';
    END IF;
END $$;
