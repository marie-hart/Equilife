-- Vérifier que la table existe
SELECT 1 FROM horses LIMIT 1;

-- Vérifier que la fonction existe
SELECT 1 FROM pg_proc WHERE proname = 'calculate_age';
