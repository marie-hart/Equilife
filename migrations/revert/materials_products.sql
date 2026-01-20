DROP TABLE IF EXISTS material_horses;

ALTER TABLE materials
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS brand,
  DROP COLUMN IF EXISTS note,
  DROP COLUMN IF EXISTS needs_repurchase;
