-- Empêche les doublons de produits (insensible à la casse)
CREATE UNIQUE INDEX products_name_unique
  ON products (LOWER(name));
