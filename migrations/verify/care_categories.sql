SELECT category FROM events WHERE FALSE;
DO $$
BEGIN
    IF to_regclass('public.care_history') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'care_history'
              AND column_name = 'category'
        ) THEN
            RAISE EXCEPTION 'Missing column public.care_history.category';
        END IF;
        PERFORM category FROM care_history WHERE FALSE;
    END IF;
END $$;
