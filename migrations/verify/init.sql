BEGIN;
SELECT id, name, sex FROM horses WHERE FALSE;
SELECT id, name, category FROM products WHERE FALSE;
SELECT product_id, horse_id FROM product_horses WHERE FALSE;
-- Vérifie l'index unique (doit retourner une ligne)
SELECT 1/COUNT(*) FROM pg_indexes WHERE indexname = 'products_name_unique';
ROLLBACK;