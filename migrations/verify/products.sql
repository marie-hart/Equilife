BEGIN;

SELECT id, name, category, unit, quantity_purchased, daily_usage FROM products WHERE FALSE;

-- Vérifier les contraintes de catégories
DO $$
BEGIN
   BEGIN
      INSERT INTO products (name, category) VALUES ('Test', 'MauvaiseCat');
      RAISE EXCEPTION 'La contrainte check_category aurait dû échouer';
    EXCEPTION WHEN check_violation THEN
      -- Succès
   END;
END $$;

ROLLBACK;