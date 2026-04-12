BEGIN;

DROP INDEX IF EXISTS products_name_unique;

CREATE INDEX IF NOT EXISTS idx_products_name_lower
    ON products (LOWER(name));

COMMIT;
