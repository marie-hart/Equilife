-- Vérifier que la suppression en cascade est en place
SELECT 1
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_class r ON r.oid = c.confrelid
WHERE t.relname = 'events'
  AND r.relname = 'horses'
  AND c.contype = 'f'
  AND c.confdeltype = 'c';

SELECT 1
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_class r ON r.oid = c.confrelid
WHERE t.relname = 'materials'
  AND r.relname = 'horses'
  AND c.contype = 'f'
  AND c.confdeltype = 'c';
