-- Table des rations
CREATE TABLE rations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des aliments d'une ration
CREATE TABLE ration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ration_id UUID NOT NULL REFERENCES rations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    quantity VARCHAR(80),
    frequency TEXT[] DEFAULT '{}',
    type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contraintes
ALTER TABLE ration_items
  ADD CONSTRAINT ration_items_type_check
  CHECK (type IN ('aliment', 'complement', 'autre') OR type IS NULL);

-- Triggers pour updated_at
CREATE TRIGGER update_rations_updated_at BEFORE
UPDATE
    ON rations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ration_items_updated_at BEFORE
UPDATE
    ON ration_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX idx_rations_horse_id ON rations(horse_id);
CREATE INDEX idx_ration_items_ration_id ON ration_items(ration_id);
