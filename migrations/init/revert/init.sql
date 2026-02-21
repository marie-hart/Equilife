-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

DROP TRIGGER IF EXISTS update_events_updated_at ON events;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Supprimer les index
DROP INDEX IF EXISTS idx_products_is_active;

DROP INDEX IF EXISTS idx_products_last_purchase_date;

DROP INDEX IF EXISTS idx_events_next_reminder_date;

DROP INDEX IF EXISTS idx_events_event_date;

-- Supprimer les tables
DROP TABLE IF EXISTS products;

DROP TABLE IF EXISTS events;

-- Supprimer l'extension (optionnel, peut être utilisée par d'autres objets)
-- DROP EXTENSION IF EXISTS "uuid-ossp";