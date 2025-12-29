-- Supprimer le trigger
DROP TRIGGER IF EXISTS update_horses_updated_at ON horses;

-- Supprimer la fonction de calcul d'âge
DROP FUNCTION IF EXISTS calculate_age(DATE);

-- Supprimer la table des chevaux
DROP TABLE IF EXISTS horses;
