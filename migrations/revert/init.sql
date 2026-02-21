BEGIN;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS events;

DROP EXTENSION IF EXISTS "uuid-ossp";

COMMIT;