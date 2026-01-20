-- Vérifie l'existence des tables rations et ration_items
SELECT 1 FROM information_schema.tables WHERE table_name = 'rations';
SELECT 1 FROM information_schema.tables WHERE table_name = 'ration_items';

-- Vérifie la contrainte sur le type
SELECT 1
FROM information_schema.table_constraints
WHERE table_name = 'ration_items' AND constraint_name = 'ration_items_type_check';
