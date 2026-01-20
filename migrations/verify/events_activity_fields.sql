-- Vérifie l'existence des nouvelles colonnes d'activité
SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'activity_type';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'activity_duration_minutes';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'activity_intensity';

SELECT 1
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'activity_comment';

-- Vérifie la contrainte d'intensité
SELECT 1
FROM information_schema.table_constraints
WHERE table_name = 'events' AND constraint_name = 'events_activity_intensity_check';
