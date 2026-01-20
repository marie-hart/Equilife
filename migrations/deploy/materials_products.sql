-- Ajout des champs produits
ALTER TABLE materials
  ADD COLUMN category VARCHAR(30),
  ADD COLUMN brand VARCHAR(80),
  ADD COLUMN note TEXT,
  ADD COLUMN needs_repurchase BOOLEAN DEFAULT false;

-- Table de liaison materials <-> horses (multi-chevaux)
CREATE TABLE material_horses (
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (material_id, horse_id)
);

CREATE INDEX idx_material_horses_horse_id ON material_horses(horse_id);
