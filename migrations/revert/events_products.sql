BEGIN;

DROP INDEX IF EXISTS idx_events_product_id;
ALTER TABLE events DROP COLUMN IF EXISTS product_id;

COMMIT;