-- Empêche les doublons de produits (insensible à la casse)
CREATE UNIQUE INDEX materials_name_unique
  ON materials (LOWER(name));
