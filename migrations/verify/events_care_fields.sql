-- Vérifie l'existence des nouvelles colonnes
SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'is_care';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'reminder_interval_days';
