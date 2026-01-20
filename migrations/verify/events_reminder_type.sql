-- Vérifie l'existence de la colonne reminder_type
SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'reminder_type';

-- Vérifie la contrainte reminder_type
SELECT 1
FROM information_schema.table_constraints
WHERE table_name = 'events' AND constraint_name = 'events_reminder_type_check';
