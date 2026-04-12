DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'products_name_unique'
    ) THEN
        RAISE EXCEPTION 'Index products_name_unique still exists';
    END IF;
END $$;

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname = 'idx_products_name_lower';
