SELECT 1
FROM information_schema.columns
WHERE table_name = 'materials' AND column_name = 'category';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'materials' AND column_name = 'brand';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'materials' AND column_name = 'note';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'materials' AND column_name = 'needs_repurchase';

SELECT 1
FROM information_schema.tables
WHERE table_name = 'material_horses';
