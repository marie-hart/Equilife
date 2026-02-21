BEGIN;

-- On ajoute la colonne product_id (au singulier pour la cohérence)
ALTER TABLE events
  ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX idx_events_product_id ON events(product_id);

COMMIT;