BEGIN;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP INDEX IF EXISTS idx_product_horses_horse_id;
DROP TABLE IF EXISTS product_horses;
DROP TABLE IF EXISTS products;

COMMIT;