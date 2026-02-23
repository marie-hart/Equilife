BEGIN;

-- 1. Vérifie que les colonnes existent
SELECT id, horse_id, is_active FROM rations WHERE FALSE;
SELECT id, ration_id, product_id, frequency, type FROM ration_items WHERE FALSE;

-- 2. Vérifie que la colonne 'type' utilise bien le type ENUM 'product_category'
SELECT 1 / COUNT(*)
FROM information_schema.columns
WHERE table_name = 'ration_items'
  AND column_name = 'type'
  AND udt_name = 'product_category';

ROLLBACK;