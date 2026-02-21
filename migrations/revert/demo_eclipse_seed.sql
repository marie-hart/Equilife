BEGIN;

-- Supprime le cheval de démo, ce qui déclenche la suppression en cascade du reste
DELETE FROM horses WHERE additional_info = 'demo_seed';

-- Supprime les produits créés spécifiquement pour la démo
DELETE FROM products WHERE note = 'demo_seed';

COMMIT;