-- Ajout des champs de profil cheval
ALTER TABLE horses
  ADD COLUMN sex VARCHAR(20),
  ADD COLUMN coat VARCHAR(50),
  ADD COLUMN stable_location VARCHAR(255),
  ADD COLUMN feed TEXT;

ALTER TABLE horses
  ADD CONSTRAINT horses_sex_check
  CHECK (sex IN ('Jument', 'Hongre', 'Etalon') OR sex IS NULL);
