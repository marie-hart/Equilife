BEGIN;

DROP INDEX IF EXISTS idx_products_name_lower;

CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique
    ON products (LOWER(name));

COMMIT;
