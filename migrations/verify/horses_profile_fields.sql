-- Vérifie l'existence des nouvelles colonnes
SELECT 1
FROM information_schema.columns
WHERE table_name = 'horses' AND column_name = 'sex';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'horses' AND column_name = 'coat';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'horses' AND column_name = 'stable_location';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'horses' AND column_name = 'feed';

-- Vérifie la contrainte sur le sexe
SELECT 1
FROM information_schema.table_constraints
WHERE table_name = 'horses' AND constraint_name = 'horses_sex_check';
