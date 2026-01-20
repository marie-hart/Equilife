-- Ajoute le lien produit sur les soins
ALTER TABLE events
  ADD COLUMN product_id UUID REFERENCES materials(id) ON DELETE SET NULL;

CREATE INDEX idx_events_product_id ON events(product_id);
