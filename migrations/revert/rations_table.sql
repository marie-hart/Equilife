BEGIN;

-- Supprimer les index (facultatif car DROP TABLE les supprime, mais propre pour Squitch)
DROP INDEX IF EXISTS idx_ration_items_product_id;
DROP INDEX IF EXISTS idx_ration_items_ration_id;
DROP INDEX IF EXISTS idx_rations_horse_id;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_ration_items_updated_at ON ration_items;
DROP TRIGGER IF EXISTS update_rations_updated_at ON rations;

-- Supprimer les tables
DROP TABLE IF EXISTS ration_items;
DROP TABLE IF EXISTS rations;

COMMIT;