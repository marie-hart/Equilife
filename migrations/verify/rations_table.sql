BEGIN;

-- 1. Vérifie que les colonnes existent
SELECT id, horse_id, is_active FROM rations WHERE FALSE;
SELECT id, ration_id, product_id, frequency, type FROM ration_items WHERE FALSE;

-- 2. Vérifie la présence des contraintes dans le dictionnaire système (plus fiable)
SELECT 1 / COUNT(*)
FROM information_schema.table_constraints
WHERE table_name = 'ration_items'
  AND constraint_name = 'ration_items_type_check';

ROLLBACK;