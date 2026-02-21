BEGIN;

SELECT id, name, category, is_active FROM products WHERE FALSE;
SELECT id, name, event_date FROM events WHERE FALSE;

-- Vérifie si l'extension uuid-ossp est là
SELECT 1/COUNT(*) FROM pg_extension WHERE extname = 'uuid-ossp';

ROLLBACK;