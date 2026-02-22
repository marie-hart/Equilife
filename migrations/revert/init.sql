-- revert/init.sql
BEGIN;

-- L'ajout de CASCADE permet de supprimer automatiquement les contraintes liées
DROP TABLE IF EXISTS product_horses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS horses CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;