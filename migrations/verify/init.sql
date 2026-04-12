BEGIN;
SELECT id, name, sex FROM horses WHERE FALSE;
SELECT id, name, category FROM products WHERE FALSE;
SELECT product_id, horse_id FROM product_horses WHERE FALSE;
-- Vérifie qu'un index de recherche par nom existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname IN ('products_name_unique', 'idx_products_name_lower')
    ) THEN
        RAISE EXCEPTION 'Missing products name index';
    END IF;
END $$;
ROLLBACK;